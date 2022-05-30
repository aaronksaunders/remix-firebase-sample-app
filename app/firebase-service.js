import { initializeApp } from "firebase/app";
import { getAuth  } from "firebase/auth"
import { getFirestore  } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkqZmuBNdoqk4ENvRZG7vOIBQrsDgznGc",
  authDomain: "reactfire-new.firebaseapp.com",
  projectId: "reactfire-new",
  storageBucket: "reactfire-new.appspot.com",
  messagingSenderId: "34036326576",
  appId: "1:34036326576:web:84994c4ec90b84c23c9b75"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const db = getFirestore(app);

export { auth, db }