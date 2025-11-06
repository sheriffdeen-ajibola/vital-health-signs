// Firebase Configuration and Initialization
// Replace these values with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqx_L3NGMYkcHjYzdVOdwd2j6FIJMlJPo",
  authDomain: "vital-health-signs-monitor.firebaseapp.com",
  projectId: "vital-health-signs-monitor",
  storageBucket: "vital-health-signs-monitor.firebasestorage.app",
  messagingSenderId: "633163340595",
  appId: "1:633163340595:web:0a0d1f563f554601cfbc46",
  measurementId: "G-K72NJXJX5Q",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence().catch((err) => {
  if (err.code == "failed-precondition") {
    console.warn(
      "Multiple tabs open, persistence can only be enabled in one tab at a time."
    );
  } else if (err.code == "unimplemented") {
    console.warn("The current browser does not support offline persistence");
  }
});

// Configure auth persistence
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDb = db;
