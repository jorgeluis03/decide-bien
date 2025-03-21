import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { AuthService } from '../services/firebase/AuthService';
import { useAuthStore } from '../services/firebase/useAuthStore';
import { User } from '../types/AuthState';
import { SessionService } from '@/services/firebase/SessionService';

let authListenerInitialized = false;

export function useAuth() {
    console.log("Hook useAuth cargado");

    const [isInitialized, setIsInitialized] = useState(false);
    const {
        user,
        isLoading,
        error,
        isAuthenticated,
        setUser,
        setLoading,
        setError,
        signOut,
        updateUserProfile
    } = useAuthStore();

    useEffect(() => {
        if (authListenerInitialized) {
            setIsInitialized(true);
            return;
        }

        console.log("Inicializando auth listener");
        authListenerInitialized = true;
        setLoading(true);

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    console.log("Auth state changed: Autenticado");

                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        phoneNumber: firebaseUser.phoneNumber,
                        photoURL: firebaseUser.photoURL,
                        providerId: firebaseUser.providerId,
                        isAnonymous: firebaseUser.isAnonymous,
                    });

                    await SessionService.updateLastActive();
                } else {
                    console.log("Auth state changed: No autenticado");
                    setUser(null);
                }
            } catch (error) {
                console.error("Error en el listener de autenticación:", error);
                setError("Error al gestionar el estado de autenticación");
            } finally {
                setLoading(false);
                setIsInitialized(true);
            }
        });

        return () => {
            console.log("Limpiando auth listener");
            unsubscribe();
        };
    }, []);

    /**
     * Registra un nuevo usuario con correo y contraseña
     */
    const registerWithEmailAndPassword = useCallback(async (
        email: string,
        password: string,
        displayName: string,
        dni: string
    ) => {
        setLoading(true);
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
            setLoading(false);
        }
    }, [setLoading, setError, setUser]);

    /**
     * Inicia sesión con correo y contraseña
     */
    const signInWithEmailAndPassword = useCallback(async (email: string, password: string) => {
        setLoading(true);
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
            setLoading(false);
        }
    }, [setLoading, setError, setUser]);

    /**
 * Cierra la sesión del usuario actual
 */
    const logout = useCallback(async () => {
        console.log("Iniciando proceso de logout");
        setLoading(true);

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
            setLoading(false);
        }
    }, [setLoading, setError, signOut]);

    /**
     * Actualiza el perfil del usuario actual
     */
    const updateProfile = useCallback(async (userData: Partial<User>) => {
        if (!user) {
            const error = 'Usuario no autenticado';
            setError(error);
            throw new Error(error);
        }

        setLoading(true);

        try {
            await AuthService.updateUserProfile(user.uid, userData);
            updateUserProfile(userData);
        } catch (err: any) {
            console.error('Profile update error:', err);
            setError(err.message || 'Error al actualizar perfil');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user, setLoading, setError, updateUserProfile]);

    /**
     * Obtiene los datos actualizados del usuario
     */
    const refreshUserData = useCallback(async () => {
        if (!user) {
            return null;
        }

        setLoading(true);

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
            setLoading(false);
        }
    }, [user, setLoading, setError, setUser]);

    /**
     * Envía un correo para restablecer la contraseña
     */
    const sendPasswordReset = useCallback(async (email: string) => {
        setLoading(true);
        setError(null);

        try {
            await AuthService.sendPasswordReset(email);
        } catch (err: any) {
            console.error('Password reset error:', err);
            setError(err.message || 'Error al enviar correo de restablecimiento');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError]);

    return {
        user,
        isLoading,
        error,
        isAuthenticated,
        isInitialized,
        registerWithEmailAndPassword,
        signInWithEmailAndPassword: async (email: string, password: string) => {
            try {
                setLoading(true);
                setError(null);
                console.log(`AuthService: Iniciando sesión ${email}`);
                await AuthService.signInWithEmailAndPassword(email, password);
                // No es necesario actualizar el estado, lo hará el auth listener
            } catch (error: any) {
                console.error("Error en login:", error);
                setError(error.message || 'Error al iniciar sesión');
                throw error;
            } finally {
                setLoading(false);
            }
        },

        logout,

        updateProfile,
        refreshUserData,
        sendPasswordReset
    };
}