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

// Evita que la splash screen se oculte antes de que se carguen los assets
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Componente para proteger rutas
function AuthenticationGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasHandledInitialAuth, setHasHandledInitialAuth] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Determinar si estamos en una ruta de autenticación
  const isAuthRoute = pathname.startsWith('/auth/');
  const isLoginScreen = pathname === '/auth/login';

  useEffect(() => {
    // Solo realizar la redirección si no estamos ya redirigiendo y la autenticación se ha cargado
    if (!isLoading && !isRedirecting && !hasHandledInitialAuth) {
      let shouldRedirect = false;
      let redirectPath: '/auth/login' | '/tabs' = '/auth/login';

      if (!isAuthenticated && !isAuthRoute) {
        console.log('No autenticado, redirigiendo a login');
        shouldRedirect = true;
        redirectPath = '/auth/login';
      } else if (isAuthenticated && isLoginScreen) {
        console.log('Autenticado, redirigiendo a tabs');
        shouldRedirect = true;
        redirectPath = '/tabs';
      }

      if (shouldRedirect) {
        // Establecer flags antes de redirigir para prevenir redirecciones múltiples
        setIsRedirecting(true);
        setHasHandledInitialAuth(true);

        // Usar setTimeout para dejar que React complete el ciclo de renderizado actual
        setTimeout(() => {
          router.replace(redirectPath);
          // Después de un tiempo, permitir futuras redirecciones si la ruta cambia
          setTimeout(() => {
            setIsRedirecting(false);
          }, 1000);
        }, 100);
      } else {
        setHasHandledInitialAuth(true);
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, isAuthRoute, isLoginScreen, hasHandledInitialAuth, isRedirecting]);

  // Si la ruta cambia después de la autenticación inicial, podemos permitir nuevas verificaciones
  useEffect(() => {
    if (hasHandledInitialAuth && !isRedirecting) {
      setHasHandledInitialAuth(false);
    }
  }, [pathname]);

  // Mostrar indicador de carga solo durante la carga inicial y no cuando ya estamos redirigiendo
  if (isLoading && !isAuthRoute && !isRedirecting) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Verificando sesión...</Text>
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