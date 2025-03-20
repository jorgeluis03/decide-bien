import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAuth, Auth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyC03vrMgRl3BwQGuEYSzHN5Zxf9JvpXohc",
  authDomain: "decide-bien.firebaseapp.com",
  projectId: "decide-bien",
  storageBucket: "decide-bien.appspot.com",
  messagingSenderId: "965331906609",
  appId: "1:965331906609:web:2bbc923326cf53f819a510",
  measurementId: "G-2Y3JZWMJ8R"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  if (!getApps().length) {
    console.log("Initializing Firebase app for the first time");
    app = initializeApp(firebaseConfig);
    
    // Inicializar Auth con persistencia para React Native
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    
    db = getFirestore(app);
  } else {
    console.log("Firebase app already initialized, getting instance");
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  }
  
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export { auth, db };