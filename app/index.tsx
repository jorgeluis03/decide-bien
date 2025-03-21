import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { SessionService } from '@/services/firebase/SessionService';

export default function Index() {
  const { isAuthenticated, isInitialized } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        // Verificar si hay una sesión activa
        const sessionActive = await SessionService.isSessionActive();
        console.log("Estado de sesión en Index:", sessionActive);
        setHasSession(sessionActive);
      } catch (error) {
        console.error("Error al verificar sesión:", error);
      } finally {
        setChecking(false);
      }
    }

    if (isInitialized && !isAuthenticated) {
      checkSession();
    } else if (isInitialized && isAuthenticated) {
      setChecking(false);
    }
  }, [isAuthenticated, isInitialized]);

  // Mostrar pantalla de carga mientras verificamos
  if (!isInitialized || checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Verificando sesión...</Text>
      </View>
    );
  }

  // Redirección basada en el estado de autenticación
  if (isAuthenticated || hasSession) {
    console.log("Redirigiendo a tabs (usuario autenticado)");
    return <Redirect href="/tabs" />;
  } else {
    console.log("Redirigiendo a login (usuario no autenticado)");
    return <Redirect href="/auth/login" />;
  }
}