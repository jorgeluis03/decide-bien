import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
const firebaseConfig = {
  apiKey: "AIzaSyC03vrMgRl3BwQGuEYSzHN5Zxf9JvpXohc",
  authDomain: "decide-bien.firebaseapp.com",
  projectId: "decide-bien",
  storageBucket: "decide-bien.appspot.com",
  messagingSenderId: "965331906609",
  appId: "1:965331906609:web:2bbc923326cf53f819a510",
  measurementId: "G-2Y3JZWMJ8R"
};

console.log("Initializing Firebase app for the first time");
const app = initializeApp(firebaseConfig);

let auth: Auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    console.log("Firebase Auth initialized with persistence");
  } catch (error) {
    console.warn("Error initializing auth with persistence, falling back to default:", error);
    auth = getAuth(app);
  }
}

console.log("Firebase Auth initialized successfully");

const db = getFirestore(app);

console.log("Firebase initialized successfully");

export { app, auth, db };