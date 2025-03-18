import { db } from "../../../firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Voto, Votes } from "../types";

export class VotosService {
  //Función para obtener los votos de una ley
  static async obtenerEstadisticas(leyId: string): Promise<Votes | null> {
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

  //Función para registrar un voto
  static async registrar(votoData: Voto): Promise<{ success: boolean, errorMessage?: string }> {
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

}
