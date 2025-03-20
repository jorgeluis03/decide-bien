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
    Modal,
    Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';

const DEPARTAMENTOS = [
    'Lima', 'Arequipa', 'Cusco', 'Lambayeque', 'La Libertad',
    'Piura', 'Cajamarca', 'Loreto', 'Junín', 'Áncash',
    'Puno', 'Ica', 'San Martín', 'Huánuco', 'Ayacucho',
    'Ucayali', 'Tacna', 'Amazonas', 'Apurímac', 'Huancavelica',
    'Madre de Dios', 'Moquegua', 'Pasco', 'Tumbes'
];

const OCUPACIONES = [
    'Estudiante', 'Profesional Universitario', 'Técnico',
    'Independiente', 'Empleado', 'Emprendedor', 'Jubilado',
    'Funcionario Público', 'Docente', 'Ama de casa', 'Otro'
];

export default function CompleteProfile() {
    const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [departamento, setDepartamento] = useState('');
    const [showDepartamentos, setShowDepartamentos] = useState(false);
    const [ocupacion, setOcupacion] = useState('');
    const [showOcupaciones, setShowOcupaciones] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { updateProfile } = useAuth();

    const handleSaveProfile = async () => {
        if (!fechaNacimiento || !departamento || !ocupacion) {
            Alert.alert('Error', 'Por favor, completa todos los campos.');
            return;
        }

        setIsLoading(true);

        try {
            // Actualizar perfil con los datos adicionales
            await updateProfile({
                fechaNacimiento: fechaNacimiento.getTime(),
                departamento,
                ocupacion,
                // Asegurar que estos campos estén creados
                updatedAt: Date.now(),
                profileComplete: true
            });

            console.log('Perfil completado correctamente');

            // Navegar a la pantalla principal
            router.replace('/tabs');
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'No se pudo guardar el perfil. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');

        if (selectedDate) {
            setFechaNacimiento(selectedDate);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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
                        <ThemedText style={styles.tagline}>Completa tu perfil</ThemedText>
                    </View>

                    <View style={styles.formSection}>
                        <ThemedText style={styles.title}>¡Casi listo!</ThemedText>
                        <ThemedText style={styles.subtitle}>
                            Para brindarte una mejor experiencia, necesitamos algunos datos adicionales
                        </ThemedText>

                        {/* Fecha de nacimiento */}
                        <TouchableOpacity
                            style={styles.inputContainer}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar-outline" size={20} color={Colors.common.secondaryText} />
                            <TextInput
                                style={styles.input}
                                placeholder="Fecha de nacimiento"
                                placeholderTextColor={Colors.common.secondaryText}
                                editable={false}
                                value={fechaNacimiento ? formatDate(fechaNacimiento) : ''}
                            />
                            <Ionicons name="chevron-down" size={20} color={Colors.common.secondaryText} />
                        </TouchableOpacity>

                        {/* Departamento */}
                        <TouchableOpacity
                            style={styles.inputContainer}
                            onPress={() => setShowDepartamentos(true)}
                        >
                            <Ionicons name="location-outline" size={20} color={Colors.common.secondaryText} />
                            <TextInput
                                style={styles.input}
                                placeholder="Departamento"
                                placeholderTextColor={Colors.common.secondaryText}
                                editable={false}
                                value={departamento}
                            />
                            <Ionicons name="chevron-down" size={20} color={Colors.common.secondaryText} />
                        </TouchableOpacity>

                        {/* Ocupación */}
                        <TouchableOpacity
                            style={styles.inputContainer}
                            onPress={() => setShowOcupaciones(true)}
                        >
                            <Ionicons name="briefcase-outline" size={20} color={Colors.common.secondaryText} />
                            <TextInput
                                style={styles.input}
                                placeholder="Ocupación"
                                placeholderTextColor={Colors.common.secondaryText}
                                editable={false}
                                value={ocupacion}
                            />
                            <Ionicons name="chevron-down" size={20} color={Colors.common.secondaryText} />
                        </TouchableOpacity>

                        {/* Guardar Perfil Button */}
                        <TouchableOpacity
                            style={[
                                styles.button,
                                (!fechaNacimiento || !departamento || !ocupacion) && styles.buttonDisabled
                            ]}
                            onPress={handleSaveProfile}
                            disabled={isLoading || !fechaNacimiento || !departamento || !ocupacion}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <ThemedText style={styles.buttonText}>Completar Registro</ThemedText>
                            )}
                        </TouchableOpacity>

                        <ThemedText style={styles.skipText}>
                            Podrás completar o actualizar tu perfil más tarde
                        </ThemedText>
                    </View>

                    {/* DatePicker modal para iOS */}
                    {Platform.OS === 'ios' && showDatePicker && (
                        <Modal
                            transparent={true}
                            visible={showDatePicker}
                            animationType="slide"
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <View style={styles.modalHeader}>
                                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                            <ThemedText style={styles.modalButton}>Cancelar</ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                            <ThemedText style={[styles.modalButton, styles.modalDoneButton]}>Listo</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                    <DateTimePicker
                                        value={fechaNacimiento || new Date(2000, 0, 1)}
                                        mode="date"
                                        display="spinner"
                                        onChange={onDateChange}
                                        maximumDate={new Date()}
                                        minimumDate={new Date(1920, 0, 1)}
                                    />
                                </View>
                            </View>
                        </Modal>
                    )}

                    {/* DatePicker para Android */}
                    {Platform.OS === 'android' && showDatePicker && (
                        <DateTimePicker
                            value={fechaNacimiento || new Date(2000, 0, 1)}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                            maximumDate={new Date()}
                            minimumDate={new Date(1920, 0, 1)}
                        />
                    )}

                    {/* Modal para selección de departamento */}
                    <Modal
                        transparent={true}
                        visible={showDepartamentos}
                        animationType="slide"
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setShowDepartamentos(false)}>
                                        <ThemedText style={styles.modalButton}>Cancelar</ThemedText>
                                    </TouchableOpacity>
                                    <ThemedText style={styles.modalTitle}>Departamento</ThemedText>
                                    <View style={{ width: 60 }} />
                                </View>
                                <ScrollView style={styles.optionsList}>
                                    {DEPARTAMENTOS.map((dep) => (
                                        <TouchableOpacity
                                            key={dep}
                                            style={styles.optionItem}
                                            onPress={() => {
                                                setDepartamento(dep);
                                                setShowDepartamentos(false);
                                            }}
                                        >
                                            <ThemedText style={[
                                                styles.optionText,
                                                departamento === dep && styles.selectedOptionText
                                            ]}>
                                                {dep}
                                            </ThemedText>
                                            {departamento === dep && (
                                                <Ionicons name="checkmark" size={22} color={Colors.common.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>

                    {/* Modal para selección de ocupación */}
                    <Modal
                        transparent={true}
                        visible={showOcupaciones}
                        animationType="slide"
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setShowOcupaciones(false)}>
                                        <ThemedText style={styles.modalButton}>Cancelar</ThemedText>
                                    </TouchableOpacity>
                                    <ThemedText style={styles.modalTitle}>Ocupación</ThemedText>
                                    <View style={{ width: 60 }} />
                                </View>
                                <ScrollView style={styles.optionsList}>
                                    {OCUPACIONES.map((ocup) => (
                                        <TouchableOpacity
                                            key={ocup}
                                            style={styles.optionItem}
                                            onPress={() => {
                                                setOcupacion(ocup);
                                                setShowOcupaciones(false);
                                            }}
                                        >
                                            <ThemedText style={[
                                                styles.optionText,
                                                ocupacion === ocup && styles.selectedOptionText
                                            ]}>
                                                {ocup}
                                            </ThemedText>
                                            {ocupacion === ocup && (
                                                <Ionicons name="checkmark" size={22} color={Colors.common.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>
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
        marginTop: 10,
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
    button: {
        width: '100%',
        backgroundColor: Colors.common.primary,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        marginTop: 8,
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
    skipText: {
        color: Colors.common.secondaryText,
        fontSize: 13,
        textAlign: 'center',
        marginTop: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalButton: {
        fontSize: 16,
        color: Colors.common.primary,
        paddingHorizontal: 8,
    },
    modalDoneButton: {
        fontWeight: '600',
    },
    optionsList: {
        maxHeight: 400,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedOptionText: {
        color: Colors.common.primary,
        fontWeight: '600',
    },
});