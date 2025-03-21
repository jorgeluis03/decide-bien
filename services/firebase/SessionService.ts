import { auth, db } from '@/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';

export class SessionService {
    // Claves para almacenamiento
    static SESSION_LAST_ACTIVE_KEY = 'session_last_active';
    static SESSION_USER_KEY = 'session_user_data';
    static SESSION_TOKEN_KEY = 'session_auth_token';

    // Verificar si la sesión está activa de forma más robusta
    static async isSessionActive(): Promise<boolean> {
        try {
            // Verificar si hay un usuario en Firebase Auth
            const currentUser = auth.currentUser;
            if (currentUser) {
                console.log("Usuario activo en auth.currentUser");
                // El usuario existe en auth, verificar si el token es válido
                try {
                    // Intentar obtener un token sin forzar renovación
                    await currentUser.getIdToken(false);
                    return true;
                } catch (e) {
                    console.log("Error con el token, sesión inválida:", e);
                    return false;
                }
            }

            // Verificar en AsyncStorage como respaldo
            const savedToken = await AsyncStorage.getItem(this.SESSION_TOKEN_KEY);
            if (savedToken) {
                console.log("Token encontrado en AsyncStorage, pero no hay usuario en Auth");
                // Hay un token guardado, pero no hay usuario en auth
                // Esto podría indicar que la sesión expiró o se invalidó
            }

            return false;
        } catch (error) {
            console.error('Error al verificar sesión:', error);
            return false;
        }
    }

    // Actualizar timestamp de actividad y guardar datos de usuario
    static async updateLastActive(userData?: any): Promise<void> {
        try {
            const timestamp = Date.now();
            await AsyncStorage.setItem(this.SESSION_LAST_ACTIVE_KEY, timestamp.toString());

            // Guardar datos de usuario si están disponibles
            if (userData) {
                await AsyncStorage.setItem(this.SESSION_USER_KEY, JSON.stringify(userData));
            } else if (auth.currentUser) {
                // Si no se proporcionan datos pero hay un usuario autenticado
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                if (userDoc.exists()) {
                    await AsyncStorage.setItem(this.SESSION_USER_KEY, JSON.stringify(userDoc.data()));
                }
            }

            // Guardar el token actual
            if (auth.currentUser) {
                const token = await auth.currentUser.getIdToken(false);
                await AsyncStorage.setItem(this.SESSION_TOKEN_KEY, token);
            }

            // Actualizar en Firestore
            const user = auth.currentUser;
            if (user) {
                await setDoc(doc(db, 'users', user.uid), {
                    lastActive: serverTimestamp()
                }, { merge: true });
            }
        } catch (error) {
            console.error('Error al actualizar actividad:', error);
        }
    }

    // Limpiar todos los datos de sesión
    static async clearSession(): Promise<void> {
        try {
            // Eliminar múltiples claves de sesión
            const keys = [
                this.SESSION_LAST_ACTIVE_KEY,
                this.SESSION_USER_KEY,
                this.SESSION_TOKEN_KEY
            ];

            await AsyncStorage.multiRemove(keys);
            console.log("Datos de sesión eliminados de AsyncStorage");
        } catch (error) {
            console.error('Error al limpiar sesión:', error);
        }
    }
}