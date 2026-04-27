// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3lBVCTM1pkCfCvRCzVdkHlxRpxE3zUQk",
  authDomain: "lingis.firebaseapp.com",
  projectId: "lingis",
  storageBucket: "lingis.firebasestorage.app",
  messagingSenderId: "324493458355",
  appId: "1:324493458355:web:66de04b9a5ab7cca7a69c6",
  measurementId: "G-8XVK2P7ENL"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(firebaseApp);
export const auth = getAuth(firebaseApp);

// connectAuthEmulator(auth, 'http://localhost:9099', {disableWarnings: true})
