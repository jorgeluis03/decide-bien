import { db } from "../firebaseConfig";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

// 🔹 Definir la interfaz para un usuario
export interface User {
  id: string; // ID es opcional porque Firestore lo genera
  name: string;
  age: number;
}

// 🔹 Agregar un documento con ID automático
export const addUser = async (userData: Omit<User, "id">): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, "users"), userData);
    return docRef.id; // Retorna el ID del nuevo documento
  } catch (error) {
    console.error("Error al agregar usuario:", error);
    return null;
  }
};

// 🔹 Obtener todos los documentos de una colección
export const getUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
};

// 🔹 Obtener un documento específico
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as User) : null;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return null;
  }
};

// 🔹 Actualizar un documento
export const updateUser = async (id: string, newData: Partial<User>): Promise<boolean> => {
  try {
    const docRef = doc(db, "users", id);
    await updateDoc(docRef, newData);
    return true;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return false;
  }
};

// 🔹 Eliminar un documento
export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, "users", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return false;
  }
};
