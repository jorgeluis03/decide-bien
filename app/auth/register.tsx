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

export default function RegisterScreen() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [name, setName] = useState('');
    const [dni, setDni] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        if (!phoneNumber || !name || !dni) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        if (dni.length !== 8 || isNaN(Number(dni))) {
            alert('El DNI debe tener 8 dígitos numéricos.');
            return;
        }

        if (!phoneNumber.startsWith('+51') || phoneNumber.length !== 12) {
            alert('Ingresa un número válido con formato +51XXXXXXXXX');
            return;
        }

        setIsLoading(true);
        // Esta función se implementará con Firebase
        // Aquí solo es un placeholder para el diseño
        setTimeout(() => {
            setIsLoading(false);
            router.push('/auth/verifyCode');
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
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>

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
                        <ThemedText style={styles.title}>Crear cuenta</ThemedText>
                        <ThemedText style={styles.subtitle}>Te enviaremos un código de verificación</ThemedText>

                        {/* Nombre completo Input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color={Colors.common.secondaryText} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nombre completo"
                                placeholderTextColor={Colors.common.secondaryText}
                                autoCapitalize="words"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        {/* DNI Input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="card-outline" size={20} color={Colors.common.secondaryText} />
                            <TextInput
                                style={styles.input}
                                placeholder="DNI (8 dígitos)"
                                placeholderTextColor={Colors.common.secondaryText}
                                keyboardType="numeric"
                                maxLength={8}
                                value={dni}
                                onChangeText={setDni}
                            />
                        </View>

                        {/* Phone Input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="call-outline" size={20} color={Colors.common.secondaryText} />
                            <ThemedText style={styles.countryCode}>+51</ThemedText>
                            <TextInput
                                style={styles.phoneInput}
                                placeholder="Número de teléfono"
                                placeholderTextColor={Colors.common.secondaryText}
                                keyboardType="phone-pad"
                                value={phoneNumber.replace('+51', '')}
                                onChangeText={(text) => setPhoneNumber('+51' + text)}
                                maxLength={9}
                            />
                        </View>

                        {/* Terms and Privacy */}
                        <View style={styles.termsContainer}>
                            <ThemedText style={styles.termsText}>
                                Al registrarte, aceptas nuestros{' '}
                                <ThemedText style={styles.termsLink}>Términos y Condiciones</ThemedText>{' '}
                                y{' '}
                                <ThemedText style={styles.termsLink}>Política de Privacidad</ThemedText>
                            </ThemedText>
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <ThemedText style={styles.buttonText}>Registrarse</ThemedText>
                            )}
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View style={styles.footer}>
                            <ThemedText style={styles.footerText}>¿Ya tienes cuenta?</ThemedText>
                            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                                <ThemedText style={styles.footerLink}> Inicia sesión</ThemedText>
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
        paddingTop: 10,
        paddingBottom: 40,
    },
    backButton: {
        alignSelf: 'flex-start',
        padding: 8,
        marginTop: 10,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 30,
    },
    logo: {
        width: 70,
        height: 70,
    },
    appName: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.common.primary,
        marginTop: 8,
        letterSpacing: 0.5,
    },
    tagline: {
        fontSize: 13,
        color: Colors.common.secondaryText,
        marginTop: 5,
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
        marginBottom: 24,
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
    termsContainer: {
        marginBottom: 24,
    },
    termsText: {
        fontSize: 13,
        color: Colors.common.secondaryText,
        textAlign: 'center',
        lineHeight: 24,
    },
    termsLink: {
        color: Colors.common.primary,
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