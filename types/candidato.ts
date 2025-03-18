export interface Candidato {
    id: string;
    nombre: string;
    partido: string;
    foto: any; // For require('@/assets/images/perfil.png')
    edad: number;
    profesion: string;
    trayectoria: string;
    ideologia: string;
    colorPartido?: string;
    educacion?: string;
}

// For detailed profile screen
export interface CandidatoPerfil {
    nombre: string;
    edad: number;
    profesion: string;
    nacionalidad: string;
    lugar_de_nacimiento: string;
    estado_civil: string;
    familia: string;
    experiencia_profesional: string[];
    experiencia_politica: string[];
    participacion_organizaciones: string[];
    ideologia: string;
    educacion: string[];
    redes_sociales: {
        twitter: string;
        facebook: string;
    };
    intereses: string[];
    hobbies: string[];
    motivaciones: string;
    valores: string[];
    vision_de_futuro: string;
    publicaciones: string[];
    reconocimientos: string[];
}