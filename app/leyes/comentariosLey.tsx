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
    Keyboard
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useLocalSearchParams, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Comentario } from "@/features/leyes/types";
import { ComentariosService } from "@/features/leyes/services/comentariosService";
import { useAuth } from "@/hooks/useAuth";

const ComentariosLeyScreen: React.FC = () => {
    const { idLey, titulo } = useLocalSearchParams<{
        idLey: string;
        titulo: string;
    }>();

    const { user } = useAuth();
    const router = useRouter();
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);

    // Cargar comentarios al iniciar
    useEffect(() => {
        const cargarComentarios = async () => {
            if (!idLey) return;

            try {
                setCargando(true);
                const comentariosData = await ComentariosService.obtenerTodos(idLey);

                // Verificar si el usuario ha dado like a algún comentario
                const formattedComentarios = comentariosData.map(comment => ({
                    ...comment,
                    id: comment.id || "",
                    userHasLiked: false // Por ahora lo dejamos en false, pero podríamos implementar una verificación real
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

    const handleEnviarComentario = useCallback(async () => {
        if (!nuevoComentario.trim() || !idLey) {
            Alert.alert("Error", "El comentario no puede estar vacío.");
            return;
        }

        if (!user) {
            Alert.alert(
                "Iniciar Sesión",
                "Necesitas iniciar sesión para comentar",
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Iniciar Sesión", onPress: () => router.push("/auth/login") }
                ]
            );
            return;
        }

        Keyboard.dismiss();
        setEnviando(true);

        try {
            const comentarioData = {
                leyId: idLey,
                texto: nuevoComentario,
                usuario: {
                    dni: user.dni || user.uid, // Usar uid como respaldo si no hay dni
                    nombreCompleto: user.displayName || "Usuario"
                }
            };

            const result = await ComentariosService.agregar(comentarioData);

            if (result.success) {
                // Verificar si el comentario ya existe en la lista
                const userId = user.dni || user.uid;
                const comentarioExistente = comentarios.find(c => c.id === userId);

                if (comentarioExistente) {
                    // Actualizar el comentario existente
                    setComentarios(prevComentarios =>
                        prevComentarios.map(c =>
                            c.id === userId
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
                        id: userId,
                        texto: nuevoComentario,
                        usuario: {
                            dni: userId,
                            nombreCompleto: user.displayName || "Usuario"
                        },
                        fecha: new Date(),
                        likes: 0,
                        userHasLiked: false
                    };

                    setComentarios(prevComentarios => [nuevoComentarioObj, ...prevComentarios]);
                }

                setNuevoComentario("");
                Alert.alert("Comentario publicado", "Tu comentario ha sido registrado correctamente.");
            } else {
                Alert.alert("Error", result.errorMessage || "No se pudo enviar el comentario");
            }
        } catch (error) {
            console.error("Error al enviar comentario:", error);
            Alert.alert("Error", "No se pudo enviar el comentario");
        } finally {
            setEnviando(false);
        }
    }, [nuevoComentario, idLey, user, comentarios, router]);

    const handleLikeComentario = useCallback(async (id: string) => {
        if (!idLey || !user) {
            if (!user) {
                Alert.alert(
                    "Iniciar Sesión",
                    "Necesitas iniciar sesión para dar like",
                    [
                        { text: "Cancelar", style: "cancel" },
                        { text: "Iniciar Sesión", onPress: () => router.push("/auth/login") }
                    ]
                );
            }
            return;
        }

        try {
            const userId = user.dni || user.uid;
            // Call the Firestore service to like/unlike comment
            const success = await ComentariosService.darLike(idLey, id, userId);

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
    }, [idLey, user, router]);

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

        const iniciales = item.usuario.nombreCompleto
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();

        const esComentarioPropio = user && (user.dni === item.usuario.dni || user.uid === item.usuario.dni);

        return (
            <ThemedView style={[
                styles.comentarioContainer,
                esComentarioPropio && styles.comentarioPropio
            ]}>
                <View style={styles.comentarioInitials}>
                    <Text style={styles.initialsText}>{iniciales}</Text>
                </View>
                <View style={styles.comentarioContent}>
                    <View style={styles.comentarioHeader}>
                        <Text style={styles.nombreUsuario}>
                            {item.usuario.nombreCompleto}
                            {esComentarioPropio && <Text style={styles.autorTag}> (Tú)</Text>}
                        </Text>
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
                    </View>
                </View>
            </ThemedView>
        );
    }, [handleLikeComentario, user]);

    // Generar iniciales del usuario
    const iniciales = useMemo(() => {
        if (!user || !user.displayName) return "??";
        return user.displayName
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }, [user]);

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
                            {iniciales}
                        </Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder={user ? "Escribe un comentario..." : "Inicia sesión para comentar"}
                        multiline
                        value={nuevoComentario}
                        onChangeText={setNuevoComentario}
                        editable={!!user}
                    />
                    {enviando ? (
                        <ActivityIndicator size="small" color="#007AFF" style={styles.sendButton} />
                    ) : (
                        <TouchableOpacity
                            onPress={handleEnviarComentario}
                            disabled={!nuevoComentario.trim() || !user}
                            style={[
                                styles.sendButton,
                                (!nuevoComentario.trim() || !user) && styles.disabledSendButton
                            ]}
                        >
                            <Ionicons
                                name="send"
                                size={24}
                                color={(nuevoComentario.trim() && user) ? "#007AFF" : "#ccc"}
                            />
                        </TouchableOpacity>
                    )}
                </KeyboardAvoidingView>
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
    comentarioPropio: {
        backgroundColor: "#f7faff",
        borderRadius: 8,
        padding: 8,
        borderLeftWidth: 3,
        borderLeftColor: "#007AFF",
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
    autorTag: {
        color: "#007AFF",
        fontStyle: "italic",
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
});

export default ComentariosLeyScreen;