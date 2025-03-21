import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Platform,
    StatusBar,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    Keyboard,
    LayoutAnimation,
    KeyboardAvoidingView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useLocalSearchParams, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { BASE_URL } from "@/constants/config";
import { Votes } from "@/features/leyes/types";
import { VotosService } from "@/features/leyes/services/votosService";
import { useAuth } from "@/hooks/useAuth";

const VotarLeyScreen: React.FC = () => {
    const { idLey, titulo, sumilla } = useLocalSearchParams<{
        idLey: string;
        titulo: string;
        sumilla: string;
    }>();

    const { user } = useAuth();
    const sheetRef = useRef<BottomSheet>(null);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const [votes, setVotes] = useState<Votes>({ aFavor: 0, enContra: 0, neutral: 0 });
    const [selectedVote, setSelectedVote] = useState<keyof Votes | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isEnviandoVoto, setIsEnviandoVoto] = useState(false);

    // Obtener las estadísticas de votación de la ley
    useEffect(() => {
        const fetchVoteStats = async () => {
            if (idLey) {
                try {
                    setIsLoadingStats(true);
                    const stats = await VotosService.obtenerEstadisticas(idLey);
                    if (stats) {
                        setVotes(stats);
                    }
                } catch (error) {
                    console.error("Error al obtener estadísticas:", error);
                    Alert.alert("Error", "No se pudieron cargar las estadísticas de votos");
                } finally {
                    setIsLoadingStats(false);
                }
            }
        };

        fetchVoteStats();
    }, [idLey]);

    // Memoizamos valores derivados para evitar recálculos innecesarios
    const snapPoints = useMemo(() => ["40%"], []);
    const totalVotes = useMemo(() => votes.aFavor + votes.enContra + votes.neutral, [votes]);

    const percentage = useCallback((count: number) => {
        return ((count / totalVotes) * 100).toFixed(1);
    }, [totalVotes]);

    const handleOpenModal = useCallback(() => {
        // Verificar si el usuario está autenticado
        if (!user) {
            Alert.alert(
                "Iniciar Sesión",
                "Necesitas iniciar sesión para votar",
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Iniciar Sesión",
                        onPress: () => router.push("/auth/login")
                    }
                ]
            );
            return;
        }

        setIsOpen(true);
        sheetRef.current?.snapToIndex(0);
    }, [user, router]);

    const handleSheetChanges = useCallback((index: number) => {
        // Si el índice es -1, significa que el BottomSheet se ha cerrado completamente
        if (index === -1) {
            // Resetea la UI
            if (Platform.OS === 'ios') {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            }
        }
    }, []);

    const handleCloseModal = useCallback(() => {
        Keyboard.dismiss();
        setIsOpen(false);
        setSelectedVote(null);

        setTimeout(() => {
            // En iOS esto ayudará a forzar que el layout se recalcule
            if (Platform.OS === 'ios') {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            }
        }, 100);
    }, []);

    const handleSubmitVote = useCallback(async () => {
        if (!selectedVote) {
            Alert.alert("Error", "Selecciona una opción de voto");
            return;
        }

        if (!user || !user.dni) {
            Alert.alert("Error", "No se puede identificar al usuario. Por favor, inicia sesión nuevamente.");
            return;
        }

        setIsEnviandoVoto(true);

        try {
            // Preparar los datos para enviar
            const votoData = {
                leyId: idLey,
                dni: user.dni,
                nombreCompleto: user.displayName || "Usuario",
                voto: selectedVote
            };

            // Registrar el voto en Firestore
            const result = await VotosService.registrar(votoData);
            if (result.success) {
                Alert.alert("Voto registrado", "¡Gracias por participar en la votación!");
                setVotes((prevVotes) => ({
                    ...prevVotes,
                    [selectedVote]: prevVotes[selectedVote] + 1
                }));
                handleCloseModal();
            } else {
                Alert.alert("Error", result.errorMessage);
            }
        } catch (error) {
            Alert.alert("Error", "Hubo un problema al enviar su voto. Verifique su conexión e intente nuevamente.");
        } finally {
            setIsEnviandoVoto(false);
        }
    }, [selectedVote, user, idLey, handleCloseModal]);

    const renderVoteOption = useCallback((type: keyof Votes, icon: string, label: string) => {
        const isSelected = selectedVote === type;
        return (
            <TouchableOpacity
                style={[styles.voteButton, styles[type], isSelected ? {} : styles.opaque]}
                onPress={() => setSelectedVote(type)}
                activeOpacity={0.7}
            >
                <Ionicons name={icon as any} size={24} color="white" />
                <Text style={styles.voteText}>{label}</Text>
            </TouchableOpacity>
        );
    }, [selectedVote]);

    return (
        <GestureHandlerRootView style={styles.flex}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }]}>
                    {/* Header */}
                    <ThemedView style={styles.header}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                    </ThemedView>

                    <ThemedText style={styles.title}>¿Qué opinas sobre esta ley?</ThemedText>

                    {/* Información de la ley */}
                    <ThemedView style={styles.leyInfoContainer}>
                        <ThemedText style={styles.leyTitulo} numberOfLines={2}>
                            {titulo}
                        </ThemedText>
                        <ThemedText style={styles.leySumilla}>
                            {sumilla}
                        </ThemedText>
                    </ThemedView>

                    {/* Estadísticas de votación */}
                    {isLoadingStats ? (
                        <View style={styles.centered}>
                            <ActivityIndicator size="large" color="#007AFF" />
                        </View>
                    ) : totalVotes === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="bar-chart-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>No hay votos todavía</Text>
                            <Text style={styles.emptySubtext}>Sé el primero en votar sobre esta ley</Text>
                        </View>
                    ) : (
                        <View style={styles.statsContainer}>
                            {(["aFavor", "neutral", "enContra"] as Array<keyof Votes>).map((type) => (
                                <View key={type} style={styles.statRow}>
                                    <Text style={styles.statLabel}>
                                        {type === "aFavor" ? "A Favor" : type === "neutral" ? "Neutral" : "En Contra"} ({votes[type]})
                                    </Text>
                                    <View style={styles.progressBarBackground}>
                                        <View
                                            style={[
                                                styles.progressBar,
                                                {
                                                    width: `${parseFloat(percentage(votes[type]))}%`,
                                                    backgroundColor: colors[type]
                                                }
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.statPercentage}>{percentage(votes[type])}%</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Floating Action Button (FAB) para votar */}
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={handleOpenModal}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="thumbs-up" size={24} color="white" />
                    </TouchableOpacity>

                    {isOpen && <View style={styles.overlay} />}

                    {/* BottomSheet para seleccionar voto */}
                    {isOpen && (
                        <BottomSheet
                            ref={sheetRef}
                            snapPoints={snapPoints}
                            enablePanDownToClose={true}
                            onClose={handleCloseModal}
                            onChange={handleSheetChanges}
                            index={0}
                        >
                            <BottomSheetView style={styles.bottomSheetContentContainer}>
                                <ScrollView
                                    style={{ width: '100%' }}
                                    contentContainerStyle={{ alignItems: 'center' }}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <Text style={styles.bottomSheetTitle}>Confirma tu voto</Text>

                                    {user && (
                                        <ThemedView style={styles.userInfoContainer}>
                                            <ThemedText style={styles.userInfoText}>
                                                Votando como: {user.displayName}
                                            </ThemedText>
                                        </ThemedView>
                                    )}

                                    <Text style={styles.selectOptionText}>Seleccione una opción:</Text>

                                    <View style={styles.voteContainer}>
                                        {renderVoteOption("aFavor", "thumbs-up", "A Favor")}
                                        {renderVoteOption("neutral", "remove-circle", "Neutral")}
                                        {renderVoteOption("enContra", "thumbs-down", "En Contra")}
                                    </View>

                                    <View style={styles.bottomSheetButtons}>
                                        <TouchableOpacity
                                            style={[
                                                styles.bottomSheetButton,
                                                styles.confirmButton,
                                                !selectedVote ? styles.disabledButton : {}
                                            ]}
                                            onPress={handleSubmitVote}
                                            disabled={!selectedVote}
                                        >
                                            {isEnviandoVoto ? (
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
            </KeyboardAvoidingView>
        </GestureHandlerRootView>
    );
};

const colors = {
    aFavor: "#4CAF50",
    neutral: "#FF9800",
    enContra: "#F44336",
};

const styles = StyleSheet.create({
    leyInfoContainer: {
        width: "100%",
        backgroundColor: "#e6f7ff",
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
    },
    leyTitulo: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
        marginBottom: 6,
    },
    leySumilla: {
        fontSize: 14,
        color: "#666",
        fontStyle: "italic",
        lineHeight: 20,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    flex: { flex: 1 },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        marginTop: 20,
        marginBottom: 16
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#222",
        textAlign: "center",
        marginBottom: 12
    },
    statsContainer: {
        width: "100%",
        marginBottom: 24
    },
    statRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12
    },
    statLabel: {
        width: 100,
        fontSize: 16
    },
    progressBarBackground: {
        flex: 1,
        height: 12,
        backgroundColor: "#eee",
        borderRadius: 6,
        overflow: "hidden"
    },
    progressBar: {
        height: "100%",
        borderRadius: 6
    },
    statPercentage: {
        width: 50,
        textAlign: "right",
        fontSize: 16,
        fontWeight: "500"
    },
    voteContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10
    },
    voteButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderRadius: 8,
        shadowColor: "#000",
        shadowRadius: 3,
    },
    aFavor: { backgroundColor: colors.aFavor },
    neutral: { backgroundColor: colors.neutral },
    enContra: { backgroundColor: colors.enContra },
    opaque: { opacity: 0.6 },
    voteText: {
        color: "white",
        fontSize: 16,
        marginLeft: 8,
        fontWeight: "600"
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
    selectOptionText: {
        fontSize: 16,
        fontWeight: "500",
        marginTop: 16,
        marginBottom: 8,
        alignSelf: "flex-start"
    },
    bottomSheetButtons: {
        flexDirection: "row",
        justifyContent: "center",
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
    confirmButton: {
        backgroundColor: "#4CAF50",
        marginLeft: 8
    },
    disabledButton: {
        backgroundColor: "#9E9E9E",
        opacity: 0.7
    },
    confirmButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold"
    },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.aFavor,
        alignItems: 'center',
        justifyContent: 'center',
        right: 30,
        bottom: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    userInfoContainer: {
        width: "100%",
        padding: 12,
        backgroundColor: "#e6f0fd",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#d0e1f9",
    },
    userInfoText: {
        fontSize: 15,
        color: "#333",
        fontWeight: "500",
        textAlign: "center",
    },

});

export default VotarLeyScreen;