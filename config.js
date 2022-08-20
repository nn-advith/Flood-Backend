// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import Firebase from "firebase/compat/app"
// import { getAnalytics } from "firebase/analytics";
// import "firebase/auth";
// import "firebase/compat/firestore";


import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyClfCjmX4D1mHV00uPTZd_-oORyftBdPuQ",
  authDomain: "sih-2-61305.firebaseapp.com",
  databaseURL: "https://sih-2-61305-default-rtdb.firebaseio.com",
  projectId: "sih-2-61305",
  storageBucket: "sih-2-61305.appspot.com",
  messagingSenderId: "1084649752470",
  appId: "1:1084649752470:web:1d6f933c9faa0b0f263fb7",
  measurementId: "G-KJ92V08DKB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export {database}



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// const firebase = Firebase.initializeApp(firebaseConfig);

// const db = firebase.firestore();

// export {firebase ,db}