export interface User {
  uid: string;
  phoneNumber: string | null;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
  providerId: string;
  isAnonymous: boolean;
  createdAt?: number;
  lastLoginAt?: number;
  // Añadimos los campos adicionales para el perfil
  fechaNacimiento?: number;
  departamento?: string;
  ocupacion?: string;
  updatedAt?: number;
  profileComplete?: boolean;
  dni?: string;
  // Otros campos opcionales que puedas querer agregar
  direccion?: string;
  genero?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  verificationId: string | null;
  isAuthenticated: boolean;
}