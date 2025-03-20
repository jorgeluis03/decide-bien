import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../../types/AuthState';

interface AuthStore extends AuthState {
  // Authentication actions
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setVerificationId: (verificationId: string | null) => void;
  signOut: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
}

// Create store with persistence
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      isLoading: false,
      error: null,
      verificationId: null,
      isAuthenticated: false,

      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setVerificationId: (verificationId) => set({ verificationId }),
      signOut: () => set({ 
        user: null, 
        isAuthenticated: false, 
        verificationId: null 
      }),
      updateUserProfile: (userData) => 
        set((state) => ({ 
          user: state.user ? { ...state.user, ...userData } : null 
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);