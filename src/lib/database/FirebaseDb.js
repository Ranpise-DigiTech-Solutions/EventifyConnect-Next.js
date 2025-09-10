import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import firebaseConfig from "../firebaseConfig.js";

// FIREBASE SETUP
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const firebaseDb = getDatabase(firebaseApp)
const firebaseFunc = getFunctions(firebaseApp);
const firebaseStorage = getStorage();
 
export { firebaseStorage ,firebaseAuth, firestore, firebaseDb, firebaseFunc};