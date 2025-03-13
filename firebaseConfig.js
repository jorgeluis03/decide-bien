import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase (reemplaza con tus credenciales)
const firebaseConfig = {
    apiKey: "AIzaSyC03vrMgRl3BwQGuEYSzHN5Zxf9JvpXohc",
    authDomain: "decide-bien.firebaseapp.com",
    projectId: "decide-bien",
    storageBucket: "decide-bien.firebasestorage.app",
    messagingSenderId: "965331906609",
    appId: "1:965331906609:web:2bbc923326cf53f819a510",
    measurementId: "G-2Y3JZWMJ8R"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
const db = getFirestore(app);

export { db };
