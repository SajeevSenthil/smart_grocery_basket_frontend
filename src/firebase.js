import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBEVutHD46Si_G9HNgzVPKAvaxmV0U-cME",
  authDomain: "smartgrocery-9f884.firebaseapp.com",
  databaseURL: "https://smartgrocery-9f884-default-rtdb.firebaseio.com",
  projectId: "smartgrocery-9f884",
  storageBucket: "smartgrocery-9f884.appspot.com",
  messagingSenderId: "983846952457",
  appId: "1:983846952457:web:2a7d254aafe06c34dd62d8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);