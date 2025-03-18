export interface Congresista {
    nombre: string;
    partido: string;
    email: string;
    fotoUrl: string;
    region?: string;
    comisiones?: string[];
    proyectosLey?: number;
    asistencia?: number;
    profesion?: string;
    educacion?: string;
    trayectoria?: string;
    id?: string;
    edad?: number;
    foto?: any; // This is for require('@/assets/images/perfil.png') usage
}