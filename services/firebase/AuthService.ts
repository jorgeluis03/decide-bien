import {
    PhoneAuthProvider,
    signInWithCredential,
    PhoneMultiFactorGenerator,
    RecaptchaVerifier,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { User } from '../../types/AuthState';
import { Platform } from 'react-native';

export class AuthService {
    // Iniciar el proceso de autenticación con teléfono
    static async requestPhoneVerification(
        phoneNumber: string,
        recaptchaVerifier: RecaptchaVerifier | null
    ): Promise<string> {
        try {
            if (Platform.OS === 'web' && !recaptchaVerifier) {
                throw new Error('Recaptcha verifier is required for web platform');
            }

            const provider = new PhoneAuthProvider(auth);

            // Para web se necesita recaptcha, para móvil no es necesario
            let verificationId;
            if (Platform.OS === 'web' && recaptchaVerifier) {
                verificationId = await provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
            } else {
                verificationId = await provider.verifyPhoneNumber(phoneNumber);
            }

            return verificationId;
        } catch (error: any) {
            console.error('Error en solicitud de verificación telefónica:', error);
            throw new Error(error.message || 'Error al solicitar verificación telefónica');
        }
    }

    // Verificar código SMS e iniciar sesión
    static async verifyPhoneCode(
        verificationId: string,
        verificationCode: string
    ): Promise<User | null> {
        try {
            const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
            const userCredential = await signInWithCredential(auth, credential);

            if (!userCredential.user) return null;

            // Mapear el usuario de Firebase a nuestro modelo de usuario
            const userData: User = {
                uid: userCredential.user.uid,
                phoneNumber: userCredential.user.phoneNumber,
                displayName: userCredential.user.displayName,
                photoURL: userCredential.user.photoURL,
                email: userCredential.user.email,
                providerId: userCredential.user.providerId,
                isAnonymous: userCredential.user.isAnonymous,
            };

            // Obtener datos adicionales del perfil desde Firestore o crear si no existe
            const userDoc = await getDoc(doc(db, 'users', userData.uid));

            if (userDoc.exists()) {
                // Actualizar último inicio de sesión
                await updateDoc(doc(db, 'users', userData.uid), {
                    lastLoginAt: serverTimestamp(),
                });

                return {
                    ...userData,
                    ...userDoc.data() as Partial<User>,
                };
            } else {
                // Crear nuevo perfil
                const newUserData = {
                    ...userData,
                    createdAt: Date.now(),
                    lastLoginAt: Date.now(),
                };

                await setDoc(doc(db, 'users', userData.uid), newUserData);
                return newUserData;
            }
        } catch (error: any) {
            console.error('Error en verificación de código:', error);
            throw new Error(error.message || 'Error al verificar código');
        }
    }

    // Cerrar sesión
    static async signOut(): Promise<void> {
        return firebaseSignOut(auth);
    }

    // Actualizar perfil de usuario
    static async updateUserProfile(
        uid: string,
        userData: Partial<User>
    ): Promise<void> {
        try {
            const userRef = doc(db, 'users', uid);

            // Actualizar en Firestore
            await updateDoc(userRef, {
                ...userData,
                updatedAt: serverTimestamp(),
            });

            // Si hay displayName o photoURL, actualizar también en Auth
            if (userData.displayName || userData.photoURL) {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    await updateProfile(currentUser, {
                        displayName: userData.displayName || currentUser.displayName,
                        photoURL: userData.photoURL || currentUser.photoURL,
                    });
                }
            }
        } catch (error: any) {
            console.error('Error al actualizar perfil:', error);
            throw new Error(error.message || 'Error al actualizar perfil');
        }
    }
}