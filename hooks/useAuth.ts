import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { AuthService } from '../services/firebase/AuthService';
import { useAuthStore } from '../services/firebase/useAuthStore';
import { User } from '../types/AuthState';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuth() {
    // Obtener estado del store
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

    // Listen for auth state changes when component mounts
    useEffect(() => {
        console.log("useAuth effect ejecutándose");
        setLoading(true);

        try {
            // Escuchar cambios en el estado de autenticación
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                try {
                    console.log("AuthStateChanged ejecutándose", firebaseUser ? "Usuario autenticado" : "No autenticado");
                    if (firebaseUser) {
                        // Usuario autenticado, obtener datos de Firestore
                        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

                        if (userDoc.exists()) {
                            // Combinar datos de Auth y Firestore
                            const userData: User = {
                                uid: firebaseUser.uid,
                                phoneNumber: firebaseUser.phoneNumber,
                                displayName: firebaseUser.displayName,
                                photoURL: firebaseUser.photoURL,
                                email: firebaseUser.email,
                                providerId: firebaseUser.providerId || 'password',
                                isAnonymous: firebaseUser.isAnonymous,
                                ...userDoc.data() as Partial<User>
                            };

                            setUser(userData);

                            // Actualizar timestamp de último login
                            try {
                                await setDoc(doc(db, 'users', firebaseUser.uid), {
                                    lastLoginAt: serverTimestamp()
                                }, { merge: true });
                            } catch (error) {
                                console.warn('Error updating lastLoginAt:', error);
                            }
                        } else {
                            // Usuario existe en Auth pero no en Firestore, crear documento
                            const basicUserData: User = {
                                uid: firebaseUser.uid,
                                phoneNumber: firebaseUser.phoneNumber,
                                displayName: firebaseUser.displayName,
                                photoURL: firebaseUser.photoURL,
                                email: firebaseUser.email,
                                providerId: firebaseUser.providerId || 'password',
                                isAnonymous: firebaseUser.isAnonymous,
                                createdAt: Date.now(),
                                lastLoginAt: Date.now()
                            };

                            // Crear documento en Firestore
                            try {
                                await setDoc(doc(db, 'users', firebaseUser.uid), basicUserData);
                            } catch (error) {
                                console.error('Error creating user document:', error);
                            }

                            setUser(basicUserData);
                        }
                    } else {
                        // No hay usuario autenticado
                        setUser(null);
                    }
                } catch (err: any) {
                    console.error('Error loading user data:', err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            });

            // Limpiar suscripción al desmontar
            return () => {
                console.log("Limpiando suscripción de auth");
                unsubscribe();
            };
        } catch (err: any) {
            console.error("Error crítico en useAuth:", err);
            setError(err.message || "Error en la autenticación");
            setLoading(false);
        }
    }, [setUser, setLoading, setError]);

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
        setLoading(true);

        try {
            await AuthService.signOut();
            signOut(); // Actualiza el estado local
        } catch (err: any) {
            console.error('Logout error:', err);
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
        registerWithEmailAndPassword,
        signInWithEmailAndPassword,
        logout,
        updateProfile,
        refreshUserData,
        sendPasswordReset
    };
}