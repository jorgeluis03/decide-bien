import { Timestamp } from 'firebase/firestore';

export interface Comentario {
    id: string;
    leyId?: string;
    texto: string;
    usuario: {
        dni: string;
        nombreCompleto: string;
        avatar?: string;
    };
    fecha: Timestamp | Date;
    likes: number;
    userHasLiked?: boolean;
}