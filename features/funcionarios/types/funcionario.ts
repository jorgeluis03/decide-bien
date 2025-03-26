export interface Funcionario {
    id: string;
    nombre: string;
    cargo: string;
    entidad: string;
    partido?: string;
    region?: string;
    foto: string;
    calificacion: number;
    numCalificaciones: number;
  }