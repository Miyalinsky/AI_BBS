import { storage } from '../firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadFile = (file, userId) => {
    const storageRef = ref(storage, `uploads/${userId}/${file.name}`);
    return uploadBytes(storageRef, file);
};

export const getFileUrl = async (filePath) => {
    const fileRef = ref(storage, filePath);
    return getDownloadURL(fileRef);
};
