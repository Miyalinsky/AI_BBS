import { collection, doc, getDoc, getDocs, query, orderBy, serverTimestamp, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';

// スレッドを削除する関数
export const deleteThread = async (threadId) => {
    try {
        await deleteDoc(doc(firestore, 'threads', threadId));
    } catch (error) {
        console.error('Error deleting thread: ', error);
        throw error;
    }
};

// レスを削除する関数
export const deletePost = async (threadId, postId) => {
    try {
        await deleteDoc(doc(firestore, `threads/${threadId}/posts`, postId));
    } catch (error) {
        console.error('Error deleting post: ', error);
        throw error;
    }
};

export const addThreadWithFirstPost = async (title, userId, content, handleName = '名無し', userIdByIp) => {
    try {
        const threadRef = doc(collection(firestore, 'threads'));
        await setDoc(threadRef, {
            title: title,
            createdAt: serverTimestamp(),
            createdBy: userId
        });

        const postRef = doc(collection(firestore, `threads/${threadRef.id}/posts`));
        await setDoc(postRef, {
            content: content,
            createdAt: serverTimestamp(),
            createdBy: userId,
            handleName: handleName,
            userIdByIp: userIdByIp
        });

        return threadRef.id;
    } catch (error) {
        console.error('Error adding thread with first post: ', error);
        throw error;
    }
};

export const getThreads = async () => {
    try {
        const q = query(collection(firestore, 'threads'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting threads: ', error);
        throw error;
    }
};

export const getPosts = async (threadId) => {
    try {
        const q = query(collection(firestore, `threads/${threadId}/posts`), orderBy('createdAt', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting posts: ', error);
        throw error;
    }
};

export const getThreadTitle = async (threadId) => {
    try {
        const threadDoc = await getDoc(doc(firestore, 'threads', threadId));
        if (threadDoc.exists()) {
            return threadDoc.data().title;
        } else {
            throw new Error('Thread not found');
        }
    } catch (error) {
        console.error('Error getting thread title: ', error);
        throw error;
    }
};

export const getPostCount = async (threadId) => {
    try {
        const postsSnapshot = await getDocs(collection(firestore, `threads/${threadId}/posts`));
        return postsSnapshot.size;
    } catch (error) {
        console.error('Error getting post count: ', error);
        throw error;
    }
};

export const addPost = async (threadId, content, userId, handleName = '名無し', userIdByIp) => {
    try {
        const postRef = doc(collection(firestore, `threads/${threadId}/posts`));
        await setDoc(postRef, {
            content: content,
            createdAt: serverTimestamp(),
            createdBy: userId,
            handleName: handleName,
            userIdByIp: userIdByIp
        });
        return postRef.id;
    } catch (error) {
        console.error('Error adding post: ', error);
        throw error;
    }
};
