import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Platform,
    StatusBar,
    TouchableOpacity,
    TextInput,
    FlatList,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    ScrollView,
    Keyboard
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useLocalSearchParams, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { fetchData } from "@/utils/fetchData";
import { BASE_URL } from "@/constants/config";
import { Comentario } from "@/features/leyes/types";
import { ComentariosService } from "@/features/leyes/services/comentariosService";

const ComentariosLeyScreen: React.FC = () => {
    const { idLey, titulo } = useLocalSearchParams<{
        idLey: string;
        titulo: string;
    }>();

    const sheetRef = useRef<BottomSheet>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [dni, setDni] = useState("");
    const [dniInfo, setDniInfo] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [nombreCompleto, setNombreCompleto] = useState("");
    const router = useRouter();
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [isEnviandoComentario, setIsEnviandoComentario] = useState(false);

    const snapPoints = useMemo(() => ["70%"], []);

    const handleOpenModal = useCallback(() => {
        if (!nuevoComentario.trim()) {
            Alert.alert("Error", "Escribe un comentario antes de enviar");
            return;
        }
        setIsOpen(true);
        sheetRef.current?.snapToIndex(0);
    }, [nuevoComentario]);

    const handleCloseModal = useCallback(() => {
        setIsOpen(false);
        setDni("");
        setDniInfo(null);
    }, []);

    const handleSearchDNI = useCallback(async () => {
        if (dni.length !== 8 || isNaN(Number(dni))) {
            Alert.alert("Error", "Ingrese un DNI válido para buscar.");
            return;
        }

        Keyboard.dismiss();
        setIsLoading(true);
        setDniInfo(null);

        try {
            const response = await fetchData<any>(`${BASE_URL}/api/v1/consulta-dni?dni=${dni}`);
            if (response) {
                const nombreCompleto = `${response.nombres} ${response.apellidoPaterno} ${response.apellidoMaterno}`;
                setNombreCompleto(nombreCompleto);
                setDniInfo(`Nombres: ${response.nombres}\nApellidos: ${response.apellidoPaterno} ${response.apellidoMaterno}\nCódigo de Verificación: ${response.codigoVerificacion}`);
            } else {
                setDniInfo("No se encontró información para este DNI");
                setNombreCompleto("");
            }
        } catch (error) {
            setDniInfo("Error al consultar el DNI. Intente nuevamente.");
            setNombreCompleto("");
        } finally {
            setIsLoading(false);
        }
    }, [dni]);

    const handleValidateDNI = useCallback(async () => {
        if (dni.length !== 8 || isNaN(Number(dni))) {
            Alert.alert("Error", "Ingrese un DNI válido de 8 dígitos.");
            return;
        }

        if (!nombreCompleto) {
            Alert.alert("Error", "Debe validar su DNI antes de comentar.");
            return;
        }

        if (!nuevoComentario.trim() || !idLey) {
            Alert.alert("Error", "El comentario no puede estar vacío.");
            return;
        }

        Keyboard.dismiss();
        setIsEnviandoComentario(true);

        try {
            const comentarioData = {
                leyId: idLey,
                texto: nuevoComentario,
                usuario: {
                    dni: dni,
                    nombreCompleto: nombreCompleto
                }
            };

            const result = await ComentariosService.agregar(comentarioData);

            if (result.success) {
                // Verificar si el comentario ya existe en la lista
                const comentarioExistente = comentarios.find(c => c.id === dni);

                if (comentarioExistente) {
                    // Actualizar el comentario existente
                    setComentarios(prevComentarios =>
                        prevComentarios.map(c =>
                            c.id === dni
                                ? {
                                    ...c,
                                    texto: nuevoComentario,
                                    fecha: new Date()
                                }
                                : c
                        )
                    );
                } else {
                    // Agregar el nuevo comentario al estado local
                    const nuevoComentarioObj: Comentario = {
                        id: dni,
                        texto: nuevoComentario,
                        usuario: {
                            dni: dni,
                            nombreCompleto: nombreCompleto
                        },
                        fecha: new Date(),
                        likes: 0,
                        userHasLiked: false
                    };

                    setComentarios(prevComentarios => [nuevoComentarioObj, ...prevComentarios]);
                }

                setNuevoComentario("");
                handleCloseModal();
                Alert.alert("Éxito", "Tu comentario ha sido registrado correctamente.");
            } else {
                Alert.alert("Error", result.errorMessage || "No se pudo enviar el comentario");
            }
        } catch (error) {
            console.error("Error al enviar comentario:", error);
            Alert.alert("Error", "No se pudo enviar el comentario");
        } finally {
            setIsEnviandoComentario(false);
        }
    }, [dni, nombreCompleto, idLey, nuevoComentario, comentarios, handleCloseModal]);

    // Using dni to align with Firestore service requirements
    const usuario = {
        dni: "12345678", // Default value, will be replaced with the validated DNI
        nombreCompleto: "Usuario Anónimo"
    };

    // Cargar comentarios al iniciar
    useEffect(() => {
        const cargarComentarios = async () => {
            if (!idLey) return;

            try {
                setCargando(true);
                const comentariosData = await ComentariosService.obtenerTodos(idLey);

                // Transform the data to match the component's expected format
                const formattedComentarios = comentariosData.map(comment => ({
                    ...comment,
                    id: comment.id || "",
                    userHasLiked: false // Default value, should be updated based on user's likes
                }));

                setComentarios(formattedComentarios);
            } catch (error) {
                console.error("Error al obtener comentarios:", error);
                Alert.alert("Error", "No se pudieron cargar los comentarios");
            } finally {
                setCargando(false);
            }
        };

        cargarComentarios();
    }, [idLey]);

    const handleLikeComentario = useCallback(async (id: string) => {
        if (!idLey) return;

        try {
            // Call the Firestore service to like/unlike comment
            const success = await ComentariosService.darLike(idLey, id, usuario.dni);

            if (success) {
                // Update local state
                setComentarios(prevComentarios =>
                    prevComentarios.map(comentario =>
                        comentario.id === id
                            ? {
                                ...comentario,
                                likes: comentario.userHasLiked
                                    ? comentario.likes - 1
                                    : comentario.likes + 1,
                                userHasLiked: !comentario.userHasLiked
                            }
                            : comentario
                    )
                );
            }
        } catch (error) {
            console.error("Error al dar like:", error);
            Alert.alert("Error", "No se pudo actualizar el like");
        }
    }, [idLey, usuario.dni]);

    const renderComentario = useCallback(({ item }: { item: Comentario }) => {
        // Handle both Timestamp and Date objects
        let fecha: Date;
        if (item.fecha instanceof Date) {
            fecha = item.fecha;
        } else if (item.fecha && typeof item.fecha.toDate === 'function') {
            fecha = item.fecha.toDate();
        } else {
            fecha = new Date();
        }

        const fechaFormateada = fecha instanceof Date && !isNaN(fecha.getTime())
            ? fecha.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            })
            : 'Fecha no disponible';

        return (
            <ThemedView style={styles.comentarioContainer}>
                <View style={styles.comentarioInitials}>
                    <Text style={styles.initialsText}>
                        {item.usuario.nombreCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.comentarioContent}>
                    <View style={styles.comentarioHeader}>
                        <Text style={styles.nombreUsuario}>{item.usuario.nombreCompleto}</Text>
                        <Text style={styles.fechaComentario}>{fechaFormateada}</Text>
                    </View>
                    <Text style={styles.textoComentario}>{item.texto}</Text>
                    <View style={styles.comentarioFooter}>
                        <TouchableOpacity
                            style={styles.likeButton}
                            onPress={() => handleLikeComentario(item.id)}
                        >
                            <Ionicons
                                name={item.userHasLiked ? "heart" : "heart-outline"}
                                size={20}
                                color={item.userHasLiked ? "#F44336" : "#666"}
                            />
                            <Text style={styles.likeCount}>{item.likes}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.replyButton}>
                            <Ionicons name="chatbubble-outline" size={18} color="#666" />
                            <Text style={styles.replyText}>Responder</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ThemedView>
        );
    }, [handleLikeComentario]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }]}>
                {/* Header */}
                <ThemedView style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle} numberOfLines={1}>
                        Comentarios
                    </ThemedText>
                    <View style={styles.headerRight} />
                </ThemedView>

                {/* Información de la ley */}
                <ThemedView style={styles.leyInfoContainer}>
                    <ThemedText style={styles.leyTitulo} numberOfLines={2}>
                        {titulo}
                    </ThemedText>
                </ThemedView>

                {/* Lista de comentarios */}
                {cargando ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#007AFF" />
                    </View>
                ) : (
                    <FlatList
                        data={comentarios}
                        renderItem={renderComentario}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.comentariosList}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="chatbubble-ellipses-outline" size={60} color="#ccc" />
                                <Text style={styles.emptyText}>No hay comentarios todavía</Text>
                                <Text style={styles.emptySubtext}>Sé el primero en comentar sobre esta ley</Text>
                            </View>
                        }
                    />
                )}

                {/* Input para nuevo comentario */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                    style={styles.inputContainer}
                >
                    <View style={styles.userInitials}>
                        <Text style={styles.initialsText}>
                            {usuario.nombreCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Escribe un comentario..."
                        multiline
                        value={nuevoComentario}
                        onChangeText={setNuevoComentario}
                    />
                    {enviando ? (
                        <ActivityIndicator size="small" color="#007AFF" style={styles.sendButton} />
                    ) : (
                        <TouchableOpacity
                            onPress={handleOpenModal}
                            disabled={!nuevoComentario.trim()}
                            style={[
                                styles.sendButton,
                                !nuevoComentario.trim() && styles.disabledSendButton
                            ]}
                        >
                            <Ionicons name="send" size={24} color={nuevoComentario.trim() ? "#007AFF" : "#ccc"} />
                        </TouchableOpacity>
                    )}
                </KeyboardAvoidingView>

                {/*  */}
                {isOpen && <View style={styles.overlay} />}

                {/* BottomSheet para ingresar DNI */}
                {isOpen && (
                    <BottomSheet
                        ref={sheetRef}
                        snapPoints={snapPoints}
                        enablePanDownToClose={true}
                        onClose={handleCloseModal}
                        index={0}
                        keyboardBehavior="interactive"
                    >
                        <BottomSheetView style={styles.bottomSheetContentContainer}>
                            <ScrollView
                                style={{ width: '100%' }}
                                contentContainerStyle={{ alignItems: 'center' }}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <Text style={styles.bottomSheetTitle}>Confirma tu comentario</Text>
                                <Text style={styles.bottomSheetText}>Ingrese su DNI para validar su comentario:</Text>
                                <View style={styles.dniInputContainer}>
                                    <TextInput
                                        style={styles.dniInput}
                                        placeholder="Ingrese su DNI"
                                        keyboardType="numeric"
                                        maxLength={8}
                                        value={dni}
                                        onChangeText={setDni}
                                        autoFocus
                                    />
                                    <TouchableOpacity onPress={handleSearchDNI} disabled={isLoading}>
                                        {isLoading ? (
                                            <ActivityIndicator size="small" color="#007AFF" />
                                        ) : (
                                            <Ionicons name="search" size={24} color="black" />
                                        )}
                                    </TouchableOpacity>
                                </View>

                                {dniInfo && (
                                    <ThemedView style={styles.dniInfoContainer}>
                                        <ThemedText style={styles.dniInfoText}>{dniInfo}</ThemedText>
                                    </ThemedView>
                                )}

                                <View style={styles.bottomSheetButtons}>
                                    <TouchableOpacity
                                        style={[styles.bottomSheetButton, styles.cancelButton]}
                                        onPress={handleCloseModal}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.bottomSheetButton,
                                            styles.confirmButton,
                                            !nombreCompleto ? styles.disabledButton : {}
                                        ]}
                                        onPress={handleValidateDNI}
                                        disabled={!nombreCompleto}
                                    >
                                        {isEnviandoComentario ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text style={styles.confirmButtonText}>Confirmar</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </BottomSheetView>
                    </BottomSheet>
                )}
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        marginTop: 10,
        marginBottom: 10,
        height: 50,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
    },
    headerRight: {
        width: 30, // Balancear el header
    },
    leyInfoContainer: {
        width: "100%",
        backgroundColor: "#f8f9fa",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    leyTitulo: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    comentariosList: {
        padding: 16,
        paddingBottom: 80,
    },
    comentarioContainer: {
        flexDirection: "row",
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    comentarioInitials: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#E1E1E1",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    initialsText: {
        fontWeight: "bold",
        color: "#555",
    },
    comentarioContent: {
        flex: 1,
    },
    comentarioHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
        alignItems: "center",
    },
    nombreUsuario: {
        fontWeight: "700",
        fontSize: 14,
        color: "#333",
    },
    fechaComentario: {
        fontSize: 12,
        color: "#999",
    },
    textoComentario: {
        fontSize: 15,
        color: "#333",
        lineHeight: 20,
        marginBottom: 8,
    },
    comentarioFooter: {
        flexDirection: "row",
        alignItems: "center",
    },
    likeButton: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 20,
    },
    likeCount: {
        marginLeft: 5,
        fontSize: 14,
        color: "#666",
    },
    replyButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    replyText: {
        marginLeft: 5,
        fontSize: 14,
        color: "#666",
    },
    inputContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    userInitials: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#E1E1E1",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        maxHeight: 100,
        backgroundColor: "#f9f9f9",
    },
    sendButton: {
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    disabledSendButton: {
        opacity: 0.5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#666",
        marginTop: 10,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#999",
        marginTop: 5,
        textAlign: "center",
        paddingHorizontal: 20,
    },
    dniInfoContainer: {
        width: "100%",
        padding: 12,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        marginBottom: 16,
    },
    dniInfoText: {
        fontSize: 14,
        lineHeight: 20,
        color: "#333",
        fontWeight: "600"
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    bottomSheetContentContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "white",
        padding: 24,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16
    },
    bottomSheetTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#222"
    },
    bottomSheetText: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: "center",
        color: "#444"
    },
    bottomSheetButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 24
    },
    bottomSheetButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    cancelButton: {
        backgroundColor: "#e0e0e0",
        marginRight: 8
    },
    confirmButton: {
        backgroundColor: "#4CAF50",
        marginLeft: 8
    },
    cancelButtonText: {
        color: "#333",
        fontSize: 16,
        fontWeight: "bold"
    },
    confirmButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold"
    },
    disabledButton: {
        backgroundColor: "#9E9E9E",
        opacity: 0.7
    },
    dniInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        width: "100%"
    },
    dniInput: {
        flex: 1,
        fontSize: 16,
        padding: 0,
        marginRight: 10
    },
});

export default ComentariosLeyScreen;