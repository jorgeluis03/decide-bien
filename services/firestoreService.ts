import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// 🔹 Interfaz para el voto
export interface Voto {
  dni: string;
  leyId: string;
  nombreCompleto: string;
  voto: "aFavor" | "enContra" | "neutral";
  timestamp?: any;
}

// 🔹 Función para registrar un voto
export const registrarVoto = async (votoData: Voto): Promise<boolean> => {
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
      console.error("El usuario ya ha votado en esta ley.");
      return false;
    }

    // Registrar el voto en la subcolección 'votantes'
    await setDoc(votanteRef, {
      voto,
      timestamp: serverTimestamp(),
    });

    // Obtener nuevamente la ley después de la posible creación
    const leyData = (await getDoc(leyRef)).data();
    if (!leyData) {
      console.error("No se pudo obtener los datos de la ley.");
      return false;
    }

    // Actualizar el conteo de votos
    const votosActualizados = {
      aFavor: leyData.votos?.aFavor || 0,
      enContra: leyData.votos?.enContra || 0,
      neutral: leyData.votos?.neutral || 0,
    };
    votosActualizados[voto] += 1;

    await updateDoc(leyRef, { votos: votosActualizados });

    console.log("Voto registrado correctamente.");
    return true;
  } catch (error) {
    console.error("Error al registrar voto:", error);
    return false;
  }
};
