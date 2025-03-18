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

export interface Firmante {
    firmanteId: number;
    nombre: string;
    dni: string;
    sexo: string;
    pagWeb: string;
    foto_url: string;
}

// Base interface for common properties
export interface LeyBase {
    titulo: string;
    desEstado: string;
    fecPresentacion: string;
}

// Used in list views (leyesTab.tsx)
export interface LeyResumen extends LeyBase {
    pleyNum: number;
    autores: string;
}

// Used in detail view (detalle.tsx)
export interface LeyDetalle extends LeyBase {
    pleyId: string;
    desProponente: string;
    desGpar: string;
    sumilla: string;
    firmantes: Firmante[];
}

// Type guard to check if a Ley is a LeyDetalle
export function isLeyDetalle(ley: LeyBase): ley is LeyDetalle {
    return (ley as LeyDetalle).pleyId !== undefined;
}

export interface Voto {
    dni: string;
    leyId: string;
    nombreCompleto: string;
    voto: "aFavor" | "enContra" | "neutral";
    timestamp?: any;
}

export interface Votes {
    aFavor: number;
    enContra: number;
    neutral: number;
}