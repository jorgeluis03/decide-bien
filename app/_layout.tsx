import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect } from 'react';
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

  useEffect(() => {
    // Si está en una ruta de autenticación (login, register, verifyCode), permitir la navegación
    const isAuthRoute = pathname.startsWith('/auth/');
    const isLoginScreen = pathname === '/auth/login';

    if (!isLoading) {
      // Solo redirija a login si no está autenticado Y no está ya en una ruta de auth
      if (!isAuthenticated && !isAuthRoute) {
        console.log('No autenticado, redirigiendo a login');
        router.replace('/auth/login');
      } else if (isAuthenticated && isLoginScreen) {
        // Si está autenticado pero está en la pantalla de login, redirigir a tabs
        console.log('Autenticado, redirigiendo a tabs');
        router.replace('/tabs');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return null;
  }

  return children;
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