import { db } from "../../../firebaseConfig";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    increment,
    orderBy,
    query,
    setDoc,
    updateDoc,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { Comentario } from "../types";

export class ComentariosService {
    static async obtenerTodos(
        leyId: string,
        options?: { limit?: number; orderByLikes?: boolean }
    ): Promise<Comentario[]> {
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
    }

    static async darLike(
        leyId: string,
        comentarioId: string,
        userDni: string
    ): Promise<boolean> {
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

    static async agregar(comentarioData: {
        leyId: string;
        texto: string;
        usuario: { dni: string; nombreCompleto: string; avatar?: string };
    }): Promise<{ success: boolean; id?: string; errorMessage?: string }> {
        try {
            const { leyId, texto, usuario } = comentarioData;
            const leyRef = doc(db, "leyes", leyId);

            // Check if the ley exists, if not create it
            const leySnap = await getDoc(leyRef);
            if (!leySnap.exists()) {
                // Initialize the ley document with default values
                await setDoc(leyRef, {
                    comentariosCount: 0,
                    votos: { aFavor: 0, enContra: 0, neutral: 0 }
                });
            }

            // Use DNI as the document ID for the comment
            const comentarioRef = doc(collection(leyRef, "comentarios"), usuario.dni);

            // Check if the user already has a comment
            const comentarioSnap = await getDoc(comentarioRef);
            const isUpdate = comentarioSnap.exists();

            const nuevoComentario: Omit<Comentario, 'id'> = {
                leyId,
                texto,
                usuario,
                fecha: serverTimestamp() as Timestamp,
                likes: isUpdate ? (comentarioSnap.data()?.likes || 0) : 0
            };

            // Set the document with the DNI as the ID
            await setDoc(comentarioRef, nuevoComentario);

            // If it's a new comment (not an update), increment the count
            if (!isUpdate) {
                await updateDoc(leyRef, {
                    comentariosCount: increment(1)
                });
            }

            return {
                success: true,
                id: usuario.dni
            };
        } catch (error) {
            console.error("Error al agregar comentario:", error);
            return {
                success: false,
                errorMessage: "No se pudo agregar el comentario. Intenta nuevamente."
            };
        }
    };
}
