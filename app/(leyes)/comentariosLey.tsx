import React, { useState, useEffect, useCallback } from "react";
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
    Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useLocalSearchParams, useRouter } from "expo-router";
import { obtenerComentarios, agregarComentario, darLikeComentario } from "@/services/firestoreService";
import { Timestamp } from "firebase/firestore";

// Make this interface compatible with the one in firestoreService
interface Comentario {
    id: string;
    texto: string;
    usuario: {
        dni: string;
        nombreCompleto: string;
        avatar?: string;
    };
    fecha: Timestamp | Date;
    likes: number;
    userHasLiked?: boolean;
}

const ComentariosLeyScreen: React.FC = () => {
    const { idLey, titulo } = useLocalSearchParams<{
        idLey: string;
        titulo: string;
    }>();

    const router = useRouter();
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    // Using dni to align with Firestore service requirements
    const usuario = {
        dni: "12345678A", // Default value, should be replaced with actual user dni
        nombreCompleto: "Usuario Anónimo",
        avatar: "https://i.pravatar.cc/150?img=" + Math.floor(Math.random() * 70)
    };

    // Cargar comentarios al iniciar
    useEffect(() => {
        const cargarComentarios = async () => {
            if (!idLey) return;
            
            try {
                setCargando(true);
                const comentariosData = await obtenerComentarios(idLey);
                
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

    const handleEnviarComentario = useCallback(async () => {
        if (!nuevoComentario.trim() || !idLey) return;
        
        try {
            setEnviando(true);
            
            const comentarioData = {
                leyId: idLey,
                texto: nuevoComentario,
                usuario: {
                    dni: usuario.dni,
                    nombreCompleto: usuario.nombreCompleto,
                    avatar: usuario.avatar
                }
            };
            
            const result = await agregarComentario(comentarioData);
            
            if (result.success) {
                // Agregar el nuevo comentario al estado local
                const nuevoComentarioObj: Comentario = {
                    id: result.id || Date.now().toString(),
                    texto: nuevoComentario,
                    usuario: {
                        dni: usuario.dni,
                        nombreCompleto: usuario.nombreCompleto,
                        avatar: usuario.avatar
                    },
                    fecha: new Date(),
                    likes: 0,
                    userHasLiked: false
                };
                
                setComentarios(prevComentarios => [nuevoComentarioObj, ...prevComentarios]);
                setNuevoComentario("");
            } else {
                Alert.alert("Error", result.errorMessage || "No se pudo enviar el comentario");
            }
        } catch (error) {
            console.error("Error al enviar comentario:", error);
            Alert.alert("Error", "No se pudo enviar el comentario");
        } finally {
            setEnviando(false);
        }
    }, [nuevoComentario, idLey, usuario]);

    const handleLikeComentario = useCallback(async (id: string) => {
        if (!idLey) return;

        try {
            // Call the Firestore service to like/unlike comment
            const success = await darLikeComentario(idLey, id, usuario.dni);
            
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
                <Image 
                    source={{ uri: item.usuario.avatar || 'https://i.pravatar.cc/150' }} 
                    style={styles.avatarImage}
                />
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
                <Image 
                    source={{ uri: usuario.avatar }} 
                    style={styles.inputAvatar}
                />
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
                        onPress={handleEnviarComentario}
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
        </SafeAreaView>
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
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
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
    inputAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
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