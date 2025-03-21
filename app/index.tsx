import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { SessionService } from '@/services/firebase/SessionService';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const [finalAuthState, setFinalAuthState] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuthState() {
      try {
        // First check for a cached user session - this is fast
        const cachedSession = await SessionService.getCachedSession();
        
        if (cachedSession) {
          setFinalAuthState(true);
          return;
        }
        
        // If Firebase auth is initialized, use that result
        if (isInitialized) {
          if (isAuthenticated) {
            setFinalAuthState(true);
          } else {
            // As a fallback, check the session
            const sessionActive = await SessionService.isSessionActive();
            setFinalAuthState(sessionActive);
          }
        }
      } catch (error) {
        console.error("Error during auth check:", error);
        setFinalAuthState(false);
      } finally {
        // Hide splash screen once we've determined auth state
        SplashScreen.hideAsync();
      }
    }

    checkAuthState();
  }, [isAuthenticated, isInitialized]);

  // While still determining auth state, return null to keep splash screen visible
  if (finalAuthState === null) {
    return null;
  }

  // Redirect based on authentication state
  if (finalAuthState) {
    return <Redirect href="/tabs" />;
  } else {
    return <Redirect href="/auth/login" />;
  }
}