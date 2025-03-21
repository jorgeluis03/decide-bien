import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthenticationGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [redirected, setRedirected] = useState(false);

  const isAuthRoute = pathname.startsWith('/auth/');

  useEffect(() => {
    if (!isInitialized || redirected) return;

    const timer = setTimeout(() => {
      const state = {
        isAuthenticated,
        pathname,
        isAuthRoute,
        userExists: !!user
      };
      console.log('AuthGuard - Estado actual:', state);

      if (!isAuthenticated && !isAuthRoute) {
        console.log('No autenticado, redirigiendo a login');
        router.replace('/auth/login');
        setRedirected(true);
      } else if (isAuthenticated && isAuthRoute && pathname !== '/auth/completeProfile') {
        console.log('Autenticado, redirigiendo a home');

        if (user && !user.profileComplete && pathname !== '/auth/completeProfile') {
          router.replace('/auth/completeProfile');
        } else {
          router.replace('/tabs');
        }
        setRedirected(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isInitialized, pathname, router, user, redirected]);

  useEffect(() => {
    setRedirected(false);
  }, [pathname]);

  if (!isInitialized || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Iniciando aplicación...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthenticationGuard>
          <Slot />
        </AuthenticationGuard>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}