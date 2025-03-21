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
            initializationLoggedRef.current = true;
        }
    }, []);

    useEffect(() => {
        if (!authListenerInitialized) {
            authListenerInitialized = true;

            // Set up the Firebase Auth state listener
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

                if (firebaseUser) {
                    try {
                        // Get additional user data from Firestore
                        const userDocRef = doc(db, 'users', firebaseUser.uid);
                        const userDoc = await getDoc(userDocRef);

                        if (userDoc.exists()) {
                            const userData = userDoc.data();

                            // Log cada campo crítico individualmente
                            const fullUser: User = {
                                uid: firebaseUser.uid,
                                email: firebaseUser.email || '',
                                displayName: firebaseUser.displayName || userData.displayName || '',
                                dni: userData.dni || '', // Asegúrate de que este campo se incluya
                                phoneNumber: firebaseUser.phoneNumber || '',
                                photoURL: firebaseUser.photoURL || '',
                                providerId: firebaseUser.providerId || '',
                                isAnonymous: false,
                                // Añadir otros campos de perfil
                                fechaNacimiento: userData.fechaNacimiento,
                                departamento: userData.departamento,
                                ocupacion: userData.ocupacion,
                                profileComplete: userData.profileComplete || false,
                                createdAt: userData.createdAt,
                                lastLoginAt: userData.lastLoginAt,
                                updatedAt: userData.updatedAt
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
        setIsLoading(true);
        setError(null);

        try {
            const userCredential = await AuthService.signInWithEmailAndPassword(email, password);
            // Necesitamos asegurarnos de que el estado se actualice aquí y no esperar a onAuthStateChanged
            if (userCredential) {
                const firebaseUser = userCredential;
                // Obtener datos adicionales del usuario desde Firestore
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
                        providerId: 'password',
                        isAnonymous: false,
                        fechaNacimiento: userData.fechaNacimiento,
                        departamento: userData.departamento,
                        ocupacion: userData.ocupacion,
                        profileComplete: userData.profileComplete || false,
                        createdAt: userData.createdAt,
                        lastLoginAt: Date.now(),
                        updatedAt: userData.updatedAt
                    };

                    // Actualizar el estado con los datos del usuario
                    setUser(fullUser);
                    setAuthenticated(true);

                    // Guardar el estado de la sesión
                    await SessionService.saveSessionState(true);
                }
            }
            return userCredential;
        } catch (err: any) {
            console.error('Error de autenticación:', err);
            setError(err.message || 'Error al iniciar sesión');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [setIsLoading, setError, setUser, setAuthenticated]);

    /**
     * Cierra la sesión del usuario actual
     */
    const logout = useCallback(async () => {
        setIsLoading(true); // Use setIsLoading

        try {
            // 1. Limpiar datos de sesión local primero
            await SessionService.clearSession();
            // 2. Cerrar sesión en Firebase Auth
            await AuthService.signOut();
            // 3. Actualizar el estado local al final
            signOut(); // Esta es la función del store
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
        signInWithEmailAndPassword,
        logout,
        updateProfile,
        refreshUserData,
        sendPasswordReset
    };
}