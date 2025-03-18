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