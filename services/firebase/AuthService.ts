import {
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { User } from "../../types/AuthState";

export class AuthService {
  /**
   * Registra un nuevo usuario con correo y contraseña
   */
  static async registerWithEmailAndPassword(
    email: string,
    password: string,
    displayName: string
  ): Promise<User> {
    try {
      console.log("AuthService: Registrando usuario", email);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Actualizar el nombre de usuario
      await firebaseUpdateProfile(firebaseUser, { displayName });

      // Crear objeto de usuario para nuestro estado
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: displayName,
        phoneNumber: null,
        photoURL: null,
        providerId: 'password',
        isAnonymous: false,
        createdAt: Date.now(),
        lastLoginAt: Date.now()
      };

      // Crear en Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), user);

      return user;
    } catch (error: any) {
      console.error('Error en registerWithEmailAndPassword:', error);

      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Este correo ya está registrado');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      } else {
        throw error;
      }
    }
  }

  /**
   * Inicia sesión con correo y contraseña
   */
  static async signInWithEmailAndPassword(email: string, password: string) {
    console.log(`AuthService: Iniciando sesión ${email}`);
    try {
      const userCredential = await firebaseSignIn(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error("Error en signInWithEmailAndPassword:", error);
      throw error;
    }
  }

  /**
   * Envía un correo para restablecer la contraseña
   */
  static async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Error en sendPasswordReset:', error);

      if (error.code === 'auth/user-not-found') {
        throw new Error('No hay ninguna cuenta asociada a este correo');
      } else {
        throw error;
      }
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  static async updateUserProfile(userId: string, userData: Partial<User>): Promise<void> {
    try {
      console.log("AuthService: Actualizando perfil para", userId);
      await updateDoc(doc(db, 'users', userId), {
        ...userData,
        updatedAt: Date.now()
      });
      console.log("AuthService: Perfil actualizado");
    } catch (error) {
      console.error('Error en updateUserProfile:', error);
      throw error;
    }
  }

  /**
   * Cierra la sesión actual
   */
  static async signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error en signOut:", error);
      throw error;
    }
  }

  // services/firebase/AuthService.ts
  static async refreshToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      // Obtener un token fresco
      const token = await currentUser.getIdToken(true);
      return token;
    } catch (error) {
      console.error('Error al renovar token:', error);
      throw error;
    }
  }
}