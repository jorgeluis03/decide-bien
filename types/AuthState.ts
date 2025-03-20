export interface User {
    uid: string;
    phoneNumber: string | null;
    displayName: string | null;
    photoURL: string | null;
    email: string | null;
    providerId: string;
    isAnonymous: boolean;
    // Campos adicionales para el perfil de usuario
    dni?: string;
    nombreCompleto?: string;
    departamento?: string;
    provincia?: string;
    distrito?: string;
    partidoPreferido?: string;
    intereses?: string[];
    createdAt?: number;
    lastLoginAt?: number;
  }
  
  export interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    verificationId: string | null;
    isAuthenticated: boolean;
  }