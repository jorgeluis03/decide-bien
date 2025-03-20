import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/tabs');
    }, 1500);
  };

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
                secureTextEntry={secureTextEntry}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setSecureTextEntry(!secureTextEntry)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={Colors.common.secondaryText}
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <ThemedText style={styles.forgotPassword}>¿Olvidaste tu contraseña?</ThemedText>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <ThemedText style={styles.buttonText}>Iniciar sesión</ThemedText>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>¿No tienes cuenta?</ThemedText>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
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
    marginBottom: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#2E2E3A',
    marginLeft: 12,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPassword: {
    color: Colors.common.primary,
    fontSize: 14,
    fontWeight: '500',
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
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
});