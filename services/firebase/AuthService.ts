import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from "firebase/auth";
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
  static async signInWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<User> {
    try {
      console.log("AuthService: Iniciando sesión", email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Obtener datos adicionales de Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      let userData: User;
      
      if (userDoc.exists()) {
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          phoneNumber: firebaseUser.phoneNumber,
          photoURL: firebaseUser.photoURL,
          providerId: 'password',
          isAnonymous: false,
          ...userDoc.data() as Partial<User>
        };
      } else {
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          phoneNumber: firebaseUser.phoneNumber,
          photoURL: firebaseUser.photoURL,
          providerId: 'password',
          isAnonymous: false,
          createdAt: Date.now(),
          lastLoginAt: Date.now()
        };
        
        // Crear en Firestore si no existe
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      }
      
      return userData;
    } catch (error: any) {
      console.error('Error en signInWithEmailAndPassword:', error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Correo o contraseña incorrectos');
      } else {
        throw error;
      }
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
  static async signOut(): Promise<void> {
    try {
      console.log("AuthService: Cerrando sesión");
      await firebaseSignOut(auth);
      console.log("AuthService: Sesión cerrada");
    } catch (error) {
      console.error('Error en signOut:', error);
      throw error;
    }
  }
}