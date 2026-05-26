import { getApp, getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC08L3GNwiBsb0IqZZLT_LRS5_-8h3kcrc",
  authDomain: "getluminaapp.com",
  projectId: "luminaai-1a068",
  storageBucket: "luminaai-1a068.firebasestorage.app",
  messagingSenderId: "668245289397",
  appId: "1:668245289397:web:luminaai-web",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");

export { auth, googleProvider };

