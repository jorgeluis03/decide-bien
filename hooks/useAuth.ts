import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { AuthService } from '../services/firebase/AuthService';
import { useAuthStore } from '../services/firebase/useAuthStore';
import { User } from '../types/AuthState';

export function useAuth() {
    const {
        user,
        isLoading,
        error,
        verificationId,
        isAuthenticated,
        setUser,
        setLoading,
        setError,
        setVerificationId,
        signOut,
        updateUserProfile
    } = useAuthStore();

    useEffect(() => {
        setLoading(true);

        // Escuchar cambios en el estado de autenticación
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
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
                            providerId: firebaseUser.providerId,
                            isAnonymous: firebaseUser.isAnonymous,
                            ...userDoc.data() as Partial<User>
                        };

                        setUser(userData);
                    } else {
                        // Usuario existe en Auth pero no en Firestore
                        const basicUserData: User = {
                            uid: firebaseUser.uid,
                            phoneNumber: firebaseUser.phoneNumber,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            email: firebaseUser.email,
                            providerId: firebaseUser.providerId,
                            isAnonymous: firebaseUser.isAnonymous,
                        };

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
        return () => unsubscribe();
    }, []);

    const requestPhoneVerification = useCallback(async (phoneNumber: string, recaptchaVerifier: any = null) => {
        setLoading(true);
        setError(null);

        try {
            const id = await AuthService.requestPhoneVerification(phoneNumber, recaptchaVerifier);
            setVerificationId(id);
            return id;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const verifyPhoneCode = useCallback(async (code: string) => {
        if (!verificationId) {
            setError('No hay verificación en curso');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const user = await AuthService.verifyPhoneCode(verificationId, code);
            setUser(user);
            setVerificationId(null);
            return user;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [verificationId]);

    const logout = useCallback(async () => {
        setLoading(true);

        try {
            await AuthService.signOut();
            signOut(); // Actualiza el estado local
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProfile = useCallback(async (userData: Partial<User>) => {
        if (!user) {
            setError('Usuario no autenticado');
            return;
        }

        setLoading(true);

        try {
            await AuthService.updateUserProfile(user.uid, userData);
            updateUserProfile(userData);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user]);

    return {
        user,
        isLoading,
        error,
        isAuthenticated,
        verificationId,
        requestPhoneVerification,
        verifyPhoneCode,
        logout,
        updateProfile
    };
}