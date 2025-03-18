export interface Personero {
    tipo: string;
    nombre: string;
}

export interface Partido {
    numero: string;
    logo: string;
    nombre: string;
    fecha_inscripcion: string;
    direccion: string;
    telefonos: string;
    web: string;
    email: string;
    personeros: Personero[];
}