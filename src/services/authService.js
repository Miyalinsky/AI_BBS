import { auth } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from '../firebase/firebaseConfig';

// アカウント登録された際にFirestoreにユーザードキュメントを作成する関数
const createUserDocument = async (user) => {
    if (!user) return;

    const userDocRef = doc(firestore, "users", user.uid);

    try {
        await setDoc(userDocRef, {
            email: user.email,
            isAdmin: false, // 初期状態では管理者フラグをfalseに設定
        });
        console.log("User document created successfully");
    } catch (error) {
        console.error("Error creating user document: ", error);
    }
};

// ユーザードキュメントからユーザーが管理者かどうかを確認する関数
export const checkIfUserIsAdmin = async (userId) => {
    if (!userId) {
        console.error("User ID is undefined or null.");
        return false;
    }

    try {
        const userDoc = await getDoc(doc(firestore, "users", userId));
        if (!userDoc.exists()) {
            console.error("User document does not exist.");
            return false;
        }
        return userDoc.data().isAdmin === true;
    } catch (error) {
        console.error("Error checking if user is admin: ", error);
        return false;
    }
};

// ユーザー登録時にFireStoreにドキュメントを作成する処理を追加
export const register = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDocument(userCredential.user);  // 登録時にユーザーのドキュメントを作成
    return userCredential;
};

export const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
    return signOut(auth);
};

export const onAuthStateChanged = (callback) => {
    return firebaseOnAuthStateChanged(auth, callback);
};
