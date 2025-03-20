import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Text
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  // Envolverlo en un try/catch por si el hook falla
  let authHook;
  try {
    authHook = useAuth();
    console.log("Hook useAuth cargado correctamente");
  } catch (err) {
    console.error('Error al cargar useAuth:', err);
    // En caso de error, proporcionar un objeto vacío con las funciones necesarias
    authHook = {
      isLoading: false,
      error: "Error al cargar la autenticación",
      signInWithEmailAndPassword: () => Promise.reject("Servicio no disponible")
    };
  }

  // Destructuramos de forma segura, proporcionando valores por defecto
  const {
    signInWithEmailAndPassword = async () => Promise.reject("Servicio no disponible"),
    error: authError
  } = authHook || {};

  useEffect(() => {
    console.log('LoginScreen montado');
    setReady(true);

    // Si hay un error de autenticación, mostrarlo
    if (authError) {
      setError(authError);
    }

    return () => {
      console.log('LoginScreen desmontado');
    };
  }, [authError]);

  const handleLogin = async () => {
    if (!signInWithEmailAndPassword) {
      setError('Servicio de autenticación no disponible');
      return;
    }

    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingresa tu correo y contraseña');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Iniciando login con:', email);

      // Iniciar sesión con email y contraseña
      await signInWithEmailAndPassword(email, password);

      // Redirigir directamente a la app principal
      router.replace('/tabs');
    } catch (error: any) {
      console.error('Error de login:', error);
      setError(error?.message || 'Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Si no está listo, mostrar un indicador de carga
  if (!ready) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.common.primary} />
        <Text style={{ marginTop: 20 }}>Cargando aplicación...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Si hay un error, mostrarlo */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.appName}>Decide Bien</ThemedText>
            <ThemedText style={styles.tagline}>Tu voz importa en la democracia</ThemedText>
          </View>

          <View style={styles.formSection}>
            <ThemedText style={styles.title}>Bienvenido</ThemedText>
            <ThemedText style={styles.subtitle}>Inicia sesión para continuar</ThemedText>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.common.secondaryText} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor={Colors.common.secondaryText}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.common.secondaryText} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={Colors.common.secondaryText}
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <ThemedText style={styles.buttonText}>Iniciar Sesión</ThemedText>
              )}
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push({ pathname: '/auth/forgotPassword' })}
            >
              <ThemedText style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</ThemedText>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>¿No tienes cuenta?</ThemedText>
              <TouchableOpacity onPress={() => router.push({ pathname: '/auth/register' })}>
                <ThemedText style={styles.footerLink}> Regístrate</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <ThemedText style={styles.version}>Versión 1.0.0</ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.common.primary,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: Colors.common.secondaryText,
    marginTop: 8,
    fontStyle: 'italic',
  },
  formSection: {
    width: '100%',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E2E3A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.common.secondaryText,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7F9',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
    height: 52,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#2E2E3A',
    marginLeft: 8,
  },
  countryCode: {
    fontSize: 15,
    color: '#2E2E3A',
    marginLeft: 12,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
    color: '#2E2E3A',
    marginLeft: 8,
  },
  button: {
    width: '100%',
    backgroundColor: Colors.common.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: Colors.common.disabledButton,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: Colors.common.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    color: Colors.common.secondaryText,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.common.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: Colors.common.secondaryText,
    marginTop: 40,
    fontSize: 12,
    opacity: 0.8,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: Colors.common.errorBackground,
    borderWidth: 1,
    borderColor: Colors.common.errorBorder,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.common.errorText,
    fontSize: 14,
  }
});