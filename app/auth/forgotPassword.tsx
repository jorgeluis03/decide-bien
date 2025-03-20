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
    ActivityIndicator,
    Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const { sendPasswordReset } = useAuth();

    const handleSendReset = async () => {
        if (!email) {
            Alert.alert('Error', 'Por favor, ingresa tu correo electrónico.');
            return;
        }

        setIsLoading(true);

        try {
            await sendPasswordReset(email);
            setSuccess(true);
            Alert.alert(
                'Correo enviado',
                'Se ha enviado un enlace de recuperación a tu correo electrónico.',
                [{ text: 'OK', onPress: () => router.push('/auth/login') }]
            );
        } catch (error) {
            console.error('Error al enviar correo de restablecimiento:', error);
            Alert.alert('Error: No se pudo enviar el correo. Intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
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
                    </View>

                    <View style={styles.formSection}>
                        <ThemedText style={styles.title}>Recuperar contraseña</ThemedText>
                        <ThemedText style={styles.subtitle}>
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
                        </ThemedText>

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

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSendReset}
                            disabled={isLoading || success}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <ThemedText style={styles.buttonText}>Enviar correo</ThemedText>
                            )}
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View style={styles.footer}>
                            <ThemedText style={styles.footerText}>¿Recordaste tu contraseña?</ThemedText>
                            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                                <ThemedText style={styles.footerLink}> Inicia sesión</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
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
        paddingBottom: 40,
    },
    backButton: {
        marginTop: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
        color: Colors.common.primary,
    },
    formSection: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.common.secondaryText,
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingVertical: 10,
        marginBottom: 25,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        color: Colors.light.text,
        fontSize: 16,
    },
    button: {
        backgroundColor: Colors.common.primary,
        borderRadius: 12,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    footerText: {
        color: Colors.common.secondaryText,
    },
    footerLink: {
        color: Colors.common.primary,
        fontWeight: 'bold',
    },
});