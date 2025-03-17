import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  increment,
  getDocs,
  orderBy,
  query,
  addDoc,
} from "firebase/firestore";

//Interfaz para el voto
interface Voto {
  dni: string;
  leyId: string;
  nombreCompleto: string;
  voto: "aFavor" | "enContra" | "neutral";
  timestamp?: any;
}

//Función para registrar un voto
export const registrarVoto = async (votoData: Voto): Promise<{ success: boolean, errorMessage?: string }> => {
  try {
    const { dni, leyId, voto } = votoData;
    const leyRef = doc(db, "leyes", leyId);
    const votanteRef = doc(collection(leyRef, "votantes"), dni);

    // Verificar si la ley existe
    const leySnap = await getDoc(leyRef);
    if (!leySnap.exists()) {
      await setDoc(leyRef, { votos: { aFavor: 0, enContra: 0, neutral: 0 } });
    }

    // Verificar si el usuario ya votó
    const votanteSnap = await getDoc(votanteRef);
    if (votanteSnap.exists()) {
      return {
        success: false,
        errorMessage: "Ya has emitido tu voto para esta ley anteriormente."
      };
    }

    // Registrar el voto en la subcolección 'votantes'
    await setDoc(votanteRef, {
      voto,
      timestamp: serverTimestamp(),
    });

    // Obtener nuevamente la ley después de la posible creación
    const leyData = (await getDoc(leyRef)).data();
    if (!leyData) {
      return {
        success: false,
        errorMessage: "No se pudieron obtener los datos de la ley."
      };
    }

    // Actualizar el conteo de votos
    const votosActualizados = {
      aFavor: leyData.votos?.aFavor || 0,
      enContra: leyData.votos?.enContra || 0,
      neutral: leyData.votos?.neutral || 0,
    };
    votosActualizados[voto] += 1;

    await updateDoc(leyRef, { votos: votosActualizados });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      errorMessage: "Error en el servidor: No se pudo registrar el voto. Por favor, intenta nuevamente más tarde."
    };
  }
};

interface Votes {
  aFavor: number;
  enContra: number;
  neutral: number;
}
//Función para obtener los votos de una ley
export const obtenerEstadisticasVotos = async (leyId: string): Promise<Votes | null> => {
  try {
    const leyRef = doc(db, "leyes", leyId);
    const leySnap = await getDoc(leyRef);

    if (!leySnap.exists()) {
      return { aFavor: 0, enContra: 0, neutral: 0 };
    }

    const data = leySnap.data();
    return {
      aFavor: data.votos?.aFavor || 0,
      enContra: data.votos?.enContra || 0,
      neutral: data.votos?.neutral || 0
    };
  } catch (error) {
    console.error("Error al obtener estadísticas de votos:", error);
    return null;
  }
};

interface Comentario {
  id?: string;
  leyId: string;
  texto: string;
  usuario: {
    dni: string;
    nombreCompleto: string;
    avatar?: string;
  };
  fecha: Timestamp;
  likes: number;
}

export const agregarComentario = async (comentarioData: {
  leyId: string;
  texto: string;
  usuario: { dni: string; nombreCompleto: string; avatar?: string };
}): Promise<{ success: boolean; id?: string; errorMessage?: string }> => {
  try {
    const nuevoComentario: Omit<Comentario, 'id'> = {
      leyId: comentarioData.leyId,
      texto: comentarioData.texto,
      usuario: comentarioData.usuario,
      fecha: serverTimestamp() as Timestamp,
      likes: 0
    };

    // Use subcollection of comentarios under the ley document
    const leyRef = doc(db, "leyes", comentarioData.leyId);
    const comentariosCollection = collection(leyRef, "comentarios");

    // Use addDoc to generate a new document with auto-ID
    const docRef = await addDoc(comentariosCollection, nuevoComentario);

    // Update comentarios count in the law document
    await updateDoc(leyRef, {
      comentariosCount: increment(1)
    });

    return {
      success: true,
      id: docRef.id
    };
  } catch (error) {
    console.error("Error al agregar comentario:", error);
    return {
      success: false,
      errorMessage: "No se pudo agregar el comentario. Intenta nuevamente."
    };
  }
};

// Función para obtener comentarios de una ley
export const obtenerComentarios = async (
  leyId: string,
  options?: { limit?: number; orderByLikes?: boolean }
): Promise<Comentario[]> => {
  try {
    const leyRef = doc(db, "leyes", leyId);
    const comentariosRef = collection(leyRef, "comentarios");

    // Build query with options
    let q = query(
      comentariosRef,
      options?.orderByLikes
        ? orderBy("likes", "desc")
        : orderBy("fecha", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        leyId: data.leyId,
        texto: data.texto,
        usuario: data.usuario,
        fecha: data.fecha,
        likes: data.likes || 0
      };
    });
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return [];
  }
};

// Función para dar like a un comentario
export const darLikeComentario = async (
  leyId: string,
  comentarioId: string,
  userDni: string
): Promise<boolean> => {
  try {
    const leyRef = doc(db, "leyes", leyId);
    const comentarioRef = doc(collection(leyRef, "comentarios"), comentarioId);
    const likeRef = doc(collection(comentarioRef, "likes"), userDni);

    // Check if user already liked
    const likeDoc = await getDoc(likeRef);

    if (likeDoc.exists()) {
      // User already liked, remove like
      await deleteDoc(likeRef);
      await updateDoc(comentarioRef, {
        likes: increment(-1)
      });
    } else {
      // Add like
      await setDoc(likeRef, {
        timestamp: serverTimestamp(),
        dni: userDni
      });
      await updateDoc(comentarioRef, {
        likes: increment(1)
      });
    }

    return true;
  } catch (error) {
    console.error("Error al gestionar like:", error);
    return false;
  }
};
