import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBPL9iI9KkDKOHoIO2RBzbaxlsQXwG9C8A",
    authDomain: "cbbs-1bd93.firebaseapp.com",
    projectId: "cbbs-1bd93",
    storageBucket: "cbbs-1bd93.appspot.com",
    messagingSenderId: "600276362513",
    appId: "1:600276362513:web:cf61574c7cf373fdae18b0"
};

const app = initializeApp(firebaseConfig);

// 他のファイルで機能を利用できるようにエクスポート
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
