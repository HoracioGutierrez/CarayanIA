import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {collection, getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBua80deWD8qc8InoIEWeuG4v3N5XnH85o",
  authDomain: "carayania-ca056.firebaseapp.com",
  projectId: "carayania-ca056",
  storageBucket: "carayania-ca056.appspot.com",
  messagingSenderId: "467823726400",
  appId: "1:467823726400:web:95b6c4129405d79ab234a5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getFirestore(app);
export const requestsCollection = collection(db, "requests");