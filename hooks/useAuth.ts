import { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { AuthService } from '../services/firebase/AuthService';
import { useAuthStore } from '../services/firebase/useAuthStore';
import { User } from '../types/AuthState';
import { SessionService } from '@/services/firebase/SessionService';

let authListenerInitialized = false;

export function useAuth() {
    // Use refs to track initialization and prevent redundant logs
    const initializationLoggedRef = useRef(false);

    const {
        user,
        isAuthenticated,
        isInitialized,
        setUser,
        setAuthenticated,
        setInitialized,
        updateUserProfile,
        signOut
    } = useAuthStore();

    // Rename this to isLoading for consistency
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Log only on first initialization
    useEffect(() => {
        if (!initializationLoggedRef.current) {
            console.log("Hook useAuth cargado");
            initializationLoggedRef.current = true;
        }
    }, []);

    useEffect(() => {
        if (!authListenerInitialized) {
            console.log("Inicializando auth listener");
            authListenerInitialized = true;

            // Set up the Firebase Auth state listener
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (firebaseUser) {
                    try {
                        // Get additional user data from Firestore
                        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            const fullUser: User = {
                                uid: firebaseUser.uid,
                                email: firebaseUser.email || '',
                                displayName: firebaseUser.displayName || userData.displayName || '',
                                dni: userData.dni || '',
                                phoneNumber: firebaseUser.phoneNumber || '',
                                photoURL: firebaseUser.photoURL || '',
                                providerId: firebaseUser.providerId || '',
                                isAnonymous: false, // Add this required field
                            };

                            setUser(fullUser);
                            setAuthenticated(true);

                            // Save session state
                            await SessionService.saveSessionState(true);
                        } else {
                            // User exists in Firebase Auth but not in Firestore
                            setUser({
                                uid: firebaseUser.uid,
                                email: firebaseUser.email || '',
                                displayName: firebaseUser.displayName || '',
                                dni: '',
                                phoneNumber: firebaseUser.phoneNumber || '',
                                photoURL: firebaseUser.photoURL || '',
                                providerId: firebaseUser.providerId || '',
                                isAnonymous: false, // Add this required field
                            });
                            setAuthenticated(true);
                        }
                    } catch (error) {
                        console.error('Error fetching user data:', error);
                        setAuthenticated(false);
                    }
                } else {
                    console.log("Auth state changed: No autenticado");
                    setUser(null);
                    setAuthenticated(false);

                    // Clear session state
                    await SessionService.clearSession();
                }

                setInitialized(true);
            });

            // Cleanup function to unsubscribe from the listener
            return () => unsubscribe();
        }
    }, [setAuthenticated, setInitialized, setUser]);

    /**
     * Registra un nuevo usuario con correo y contraseña
     */
    const registerWithEmailAndPassword = useCallback(async (
        email: string,
        password: string,
        displayName: string,
        dni: string
    ) => {
        setIsLoading(true); // Use setIsLoading instead of setLoading
        setError(null);

        try {
            const user = await AuthService.registerWithEmailAndPassword(email, password, displayName);

            // Actualizar con datos adicionales como DNI
            await AuthService.updateUserProfile(user.uid, {
                dni,
                profileComplete: false
            });

            setUser(user);
            return user;
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Error al registrar usuario');
            throw err;
        } finally {
            setIsLoading(false); // Use setIsLoading instead of setLoading
        }
    }, [setIsLoading, setError, setUser]);

    /**
     * Inicia sesión con correo y contraseña
     */
    const signInWithEmailAndPassword = useCallback(async (email: string, password: string) => {
        setIsLoading(true); // Use setIsLoading
        setError(null);

        try {
            const user = await AuthService.signInWithEmailAndPassword(email, password);
            setUser(user);
            return user;
        } catch (err: any) {
            console.error('Sign in error:', err);
            setError(err.message || 'Error al iniciar sesión');
            throw err;
        } finally {
            setIsLoading(false); // Use setIsLoading
        }
    }, [setIsLoading, setError, setUser]);

    /**
     * Cierra la sesión del usuario actual
     */
    const logout = useCallback(async () => {
        console.log("Iniciando proceso de logout");
        setIsLoading(true); // Use setIsLoading

        try {
            // 1. Limpiar datos de sesión local primero
            console.log("1. Limpiando sesión local");
            await SessionService.clearSession();

            // 2. Cerrar sesión en Firebase Auth
            console.log("2. Cerrando sesión en Firebase");
            await AuthService.signOut();

            // 3. Actualizar el estado local al final
            console.log("3. Actualizando estado de la aplicación");
            signOut(); // Esta es la función del store

            console.log("Logout completado con éxito");
            return true;
        } catch (err: any) {
            console.error('Error detallado al cerrar sesión:', err);
            setError(err.message || 'Error al cerrar sesión');
            throw err;
        } finally {
            setIsLoading(false); // Use setIsLoading
        }
    }, [setIsLoading, setError, signOut]);

    /**
     * Actualiza el perfil del usuario actual
     */
    const updateProfile = useCallback(async (userData: Partial<User>) => {
        if (!user) {
            const error = 'Usuario no autenticado';
            setError(error);
            throw new Error(error);
        }

        setIsLoading(true); // Use setIsLoading

        try {
            await AuthService.updateUserProfile(user.uid, userData);
            updateUserProfile(userData);
        } catch (err: any) {
            console.error('Profile update error:', err);
            setError(err.message || 'Error al actualizar perfil');
            throw err;
        } finally {
            setIsLoading(false); // Use setIsLoading
        }
    }, [user, setIsLoading, setError, updateUserProfile]);

    /**
     * Obtiene los datos actualizados del usuario
     */
    const refreshUserData = useCallback(async () => {
        if (!user) {
            return null;
        }

        setIsLoading(true); // Use setIsLoading

        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (userDoc.exists()) {
                const refreshedData = {
                    ...user,
                    ...userDoc.data() as Partial<User>
                };

                setUser(refreshedData);
                return refreshedData;
            }

            return user;
        } catch (err: any) {
            console.error('Error refreshing user data:', err);
            setError(err.message || 'Error al obtener datos del usuario');
            return user;
        } finally {
            setIsLoading(false); // Use setIsLoading
        }
    }, [user, setIsLoading, setError, setUser]);

    /**
     * Envía un correo para restablecer la contraseña
     */
    const sendPasswordReset = useCallback(async (email: string) => {
        setIsLoading(true); // Use setIsLoading
        setError(null);

        try {
            await AuthService.sendPasswordReset(email);
        } catch (err: any) {
            console.error('Password reset error:', err);
            setError(err.message || 'Error al enviar correo de restablecimiento');
            throw err;
        } finally {
            setIsLoading(false); // Use setIsLoading
        }
    }, [setIsLoading, setError]);

    return {
        user,
        isAuthenticated,
        isInitialized,
        isLoading, // Now correctly references the renamed state variable
        error,
        registerWithEmailAndPassword,
        signInWithEmailAndPassword: async (email: string, password: string) => {
            try {
                setIsLoading(true); // Use setIsLoading
                setError(null);
                console.log(`AuthService: Iniciando sesión ${email}`);
                await AuthService.signInWithEmailAndPassword(email, password);
                // No es necesario actualizar el estado, lo hará el auth listener
            } catch (error: any) {
                console.error("Error en login:", error);
                setError(error.message || 'Error al iniciar sesión');
                throw error;
            } finally {
                setIsLoading(false); // Use setIsLoading
            }
        },

        logout,

        updateProfile,
        refreshUserData,
        sendPasswordReset
    };
}