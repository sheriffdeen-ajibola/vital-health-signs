// Import styles
import "./styles/main.css";

// Import Firebase configuration and services
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./js/firebase-config";

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Import application modules
import "./js/app.js";
import "./js/auth-service.js";
import "./js/calculations.js";
import "./js/modals.js";
import "./js/storage.js";
