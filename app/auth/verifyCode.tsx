import React, { useState, useRef, useEffect } from 'react';
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
    Animated,
    Easing
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

export default function VerifyCodeScreen() {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const router = useRouter();

    // Referencias para los inputs
    const inputRefs = useRef<Array<TextInput | null>>([]);

    // Animaciones
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const successAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Precargar refs y limpiar código al montar
        setCode(['', '', '', '', '', '']);

        // Enfocar primer campo con un pequeño retraso para asegurar renderizado
        const focusTimeout = setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 500);

        return () => {
            // Limpiar timeout al desmontar
            clearTimeout(focusTimeout);
        };
    }, []);

    useEffect(() => {
        // Animación de entrada
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            })
        ]).start();

        // Focus al primer input automáticamente
        setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 500);

        // Contador regresivo para reenvío
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer, fadeAnim, scaleAnim]);

    // Verificar código completo automáticamente
    useEffect(() => {
        const completeCode = code.join('');
        if (completeCode.length === 6) {
            handleVerify();
        }
    }, [code]);

    const handleInputChange = (text: string, index: number) => {
        // Permite pegar un código completo
        if (text.length > 1) {
            // Si el usuario pegó el código completo (6 dígitos)
            const pastedCode = text.replace(/[^0-9]/g, '').substring(0, 6).split('');
            // Rellenar con valores vacíos si es necesario
            while (pastedCode.length < 6) pastedCode.push('');
            setCode(pastedCode);

            // Enfocar al último campo con texto o al último campo si todos están llenos
            const lastIndex = Math.min(pastedCode.length - 1, 5);
            if (pastedCode[lastIndex]) {
                setTimeout(() => inputRefs.current[lastIndex]?.focus(), 0);
            }
            return;
        }

        // Manejo normal para entrada de un solo dígito
        const sanitizedText = text.replace(/[^0-9]/g, '');
        const newCode = [...code];
        newCode[index] = sanitizedText;
        setCode(newCode);

        // Avanzar al siguiente campo automáticamente si se ingresó un dígito
        if (sanitizedText && index < 5) {
            // Usar setTimeout para evitar problemas de renderizado
            setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Detecta presión de Backspace
        if (e.nativeEvent.key === 'Backspace') {
            if (code[index] === '' && index > 0) {
                // Si el campo actual está vacío, ir al anterior y borrar su contenido
                const newCode = [...code];
                newCode[index - 1] = '';
                setCode(newCode);
                setTimeout(() => inputRefs.current[index - 1]?.focus(), 0);
            } else if (code[index] !== '') {
                // Si el campo actual tiene contenido, solo borrarlo
                const newCode = [...code];
                newCode[index] = '';
                setCode(newCode);
            }
        }
    };

    const handleVerify = async () => {
        const completeCode = code.join('');
        if (completeCode.length !== 6) {
            return;
        }

        setIsLoading(true);

        // Animación de éxito
        Animated.sequence([
            Animated.timing(successAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.delay(600)
        ]).start();

        // Esta función se implementará con Firebase
        // Aquí solo es un placeholder para el diseño
        setTimeout(() => {
            setIsLoading(false);
            router.replace('/tabs');
        }, 1500);
    };

    const handleResendCode = () => {
        if (!canResend) return;

        // Animación de reset
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0.7,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();

        // Resetear inputs
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();

        // Lógica para reenviar el código
        setTimer(60);
        setCanResend(false);
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

                    <Animated.View
                        style={[
                            styles.logoContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }]
                            }
                        ]}
                    >
                        <Image
                            source={require('@/assets/images/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.formSection,
                            {
                                opacity: fadeAnim,
                                transform: [{
                                    translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0]
                                    })
                                }]
                            }
                        ]}
                    >
                        <ThemedText style={styles.title}>Verificación</ThemedText>
                        <ThemedText style={styles.subtitle}>
                            Ingresa el código de 6 dígitos que enviamos a tu número telefónico
                        </ThemedText>

                        {/* OTP Input */}
                        <View style={styles.otpContainer}>
                            {code.map((digit, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.digitContainer}
                                    onPress={() => inputRefs.current[index]?.focus()}
                                    activeOpacity={0.8}
                                >
                                    <TextInput
                                        ref={ref => { inputRefs.current[index] = ref }}
                                        style={[
                                            styles.digitInput,
                                            digit ? styles.digitFilled : {}
                                        ]}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        value={digit}
                                        onChangeText={(text) => handleInputChange(text, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        selectionColor={Colors.common.primary}
                                        accessible={true}
                                        accessibilityLabel={`Dígito ${index + 1} de 6`}
                                        autoCorrect={false}
                                        autoCapitalize="none"
                                        blurOnSubmit={false}
                                        caretHidden={false} // Cambiar a false puede ayudar
                                    />
                                    {index < 5 && <View style={styles.digitSeparator} />}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Verificación exitosa animada */}
                        <Animated.View
                            style={[
                                styles.successContainer,
                                {
                                    opacity: successAnim,
                                    transform: [
                                        {
                                            scale: successAnim.interpolate({
                                                inputRange: [0, 0.5, 1],
                                                outputRange: [0, 1.2, 1]
                                            })
                                        }
                                    ]
                                }
                            ]}
                        >
                            <View style={styles.successCircle}>
                                <Ionicons name="checkmark" size={24} color="white" />
                            </View>
                            <ThemedText style={styles.successText}>Verificado con éxito</ThemedText>
                        </Animated.View>

                        {/* Resend Timer */}
                        <TouchableOpacity
                            style={styles.resendContainer}
                            onPress={handleResendCode}
                            disabled={!canResend}
                        >
                            <ThemedText
                                style={[
                                    styles.resendText,
                                    canResend ? styles.resendActive : styles.resendInactive
                                ]}
                            >
                                {canResend
                                    ? 'Reenviar código'
                                    : `Reenviar código en ${timer}s`
                                }
                            </ThemedText>
                        </TouchableOpacity>

                        {/* Verify Button - Solo visible si el código no está completo */}
                        {code.join('').length < 6 && (
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    code.join('').length !== 6 && styles.buttonDisabled
                                ]}
                                onPress={handleVerify}
                                disabled={isLoading || code.join('').length !== 6}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <ThemedText style={styles.buttonText}>Verificar</ThemedText>
                                )}
                            </TouchableOpacity>
                        )}
                    </Animated.View>

                    <Animated.View
                        style={{
                            opacity: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 0.8]
                            })
                        }}
                    >
                        <ThemedText style={styles.helpText}>
                            ¿No recibiste el código? Verifica tu número telefónico o intenta con la opción de reenviar código.
                        </ThemedText>
                    </Animated.View>
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
        marginTop: 10,
        marginBottom: 40,
    },
    logo: {
        width: 70,
        height: 70,
    },
    formSection: {
        width: '100%',
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2E2E3A',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: Colors.common.secondaryText,
        marginBottom: 32,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    otpContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 35,
    },
    digitContainer: {
        flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    },
    digitInput: {
        width: 45,
        height: 55,
        borderRadius: 8,
        backgroundColor: '#F5F7F9',
        fontSize: 24,
        fontWeight: '600',
        color: '#2E2E3A',
        textAlign: 'center',
        paddingHorizontal: 0,
        borderWidth: 1,
        borderColor: '#EAEAEA',
    },
    digitFilled: {
        borderColor: Colors.common.primary,
        backgroundColor: 'rgba(0, 122, 255, 0.05)',
    },
    digitSeparator: {
        width: 8,
    },
    successContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    successCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    successText: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: '600',
    },
    resendContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    resendText: {
        fontSize: 14,
        paddingVertical: 5,
    },
    resendActive: {
        color: Colors.common.primary,
        fontWeight: '600',
    },
    resendInactive: {
        color: Colors.common.secondaryText,
    },
    button: {
        width: '100%',
        backgroundColor: Colors.common.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
    },
    buttonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    helpText: {
        marginTop: 40,
        fontSize: 14,
        color: Colors.common.secondaryText,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
    },
});