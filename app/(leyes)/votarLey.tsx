import React, { useState, useRef, useMemo, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Platform,
    StatusBar,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

interface Votes {
    favor: number;
    contra: number;
    neutral: number;
}

const VotarLeyScreen: React.FC = () => {
    const sheetRef = useRef<BottomSheet>(null);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const [votes, setVotes] = useState<Votes>({ favor: 150, contra: 80, neutral: 30 });
    const [dni, setDni] = useState("");
    const [selectedVote, setSelectedVote] = useState<keyof Votes | null>(null);

    // Memoizamos valores derivados para evitar recálculos innecesarios
    const snapPoints = useMemo(() => ["70%", "95%"], []);
    const totalVotes = useMemo(() => votes.favor + votes.contra + votes.neutral, [votes]);

    const percentage = useCallback((count: number) => {
        return ((count / totalVotes) * 100).toFixed(1);
    }, [totalVotes]);

    const handleOpenModal = useCallback(() => {
        setIsOpen(true);
        sheetRef.current?.snapToIndex(0);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsOpen(false);
        setDni("");
        setSelectedVote(null);
    }, []);

    const handleValidateDNI = useCallback(() => {
        if (!selectedVote) {
            Alert.alert("Error", "Selecciona una opción de voto.");
            return;
        }

        if (dni.length !== 8 || isNaN(Number(dni))) {
            Alert.alert("Error", "Ingrese un DNI válido de 8 dígitos.");
            return;
        }

        handleVote(selectedVote);
        Alert.alert("Éxito", `Tu voto ${selectedVote} ha sido registrado correctamente.`);
        handleCloseModal();
    }, [dni, selectedVote]);

    const handleVote = useCallback((type: keyof Votes) => {
        setVotes((prevVotes) => ({
            ...prevVotes,
            [type]: prevVotes[type] + 1,
        }));
    }, []);

    const handleSearchDNI = useCallback(() => {
        if (dni.length !== 8 || isNaN(Number(dni))) {
            Alert.alert("Error", "Ingrese un DNI válido para buscar.");
            return;
        }
        Alert.alert("Búsqueda DNI", `Verificando DNI: ${dni}`);
    }, [dni]);

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
            <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }]}>
                {/* Header */}
                <ThemedView style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Votar Ley</ThemedText>
                </ThemedView>

                <ThemedText style={styles.title}>¿Qué opinas sobre esta ley?</ThemedText>

                {/* Estadísticas de votación */}
                <View style={styles.statsContainer}>
                    {(["favor", "neutral", "contra"] as Array<keyof Votes>).map((type) => (
                        <View key={type} style={styles.statRow}>
                            <Text style={styles.statLabel}>
                                {type === "favor" ? "A Favor" : type === "neutral" ? "Neutral" : "En Contra"} ({votes[type]})
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

                {/* Sección de votos */}
                <View style={styles.voteContainer}>
                    <TouchableOpacity
                        style={[styles.voteButton, styles.favor]}
                        onPress={handleOpenModal}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="thumbs-up" size={24} color="white" />
                        <Text style={styles.voteText}>Votar</Text>
                    </TouchableOpacity>
                </View>

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
                                <Text style={styles.bottomSheetTitle}>Confirma tu voto</Text>
                                <Text style={styles.bottomSheetText}>Ingrese su DNI para validar su voto:</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ingrese su DNI"
                                        keyboardType="numeric"
                                        maxLength={8}
                                        value={dni}
                                        onChangeText={setDni}
                                        autoFocus
                                    />
                                    <TouchableOpacity onPress={handleSearchDNI}>
                                        <Ionicons name="search" size={24} color="black" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.selectOptionText}>Seleccione una opción:</Text>

                                <View style={styles.voteContainer}>
                                    {renderVoteOption("favor", "thumbs-up", "A Favor")}
                                    {renderVoteOption("neutral", "remove-circle", "Neutral")}
                                    {renderVoteOption("contra", "thumbs-down", "En Contra")}
                                </View>

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
                                            !selectedVote || dni.length !== 8 ? styles.disabledButton : {}
                                        ]}
                                        onPress={handleValidateDNI}
                                        disabled={!selectedVote || dni.length !== 8}
                                    >
                                        <Text style={styles.confirmButtonText}>Confirmar</Text>
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

const colors = {
    favor: "#4CAF50",
    neutral: "#FF9800",
    contra: "#F44336",
};

const styles = StyleSheet.create({
    flex: { flex: 1 },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16
    },
    scrollContent: {
        paddingBottom: 32,
        paddingHorizontal: 16,
        alignItems: "center"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        marginTop: 20,
        marginBottom: 16
    },
    headerTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: "600",
        textAlign: "center",
        marginRight: 24
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#222",
        textAlign: "center",
        marginBottom: 24
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
        gap: 12
    },
    voteButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3
    },
    favor: { backgroundColor: colors.favor },
    neutral: { backgroundColor: colors.neutral },
    contra: { backgroundColor: colors.contra },
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
    bottomSheetText: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: "center",
        color: "#444"
    },
    selectOptionText: {
        fontSize: 16,
        fontWeight: "500",
        marginTop: 16,
        marginBottom: 8,
        alignSelf: "flex-start"
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        width: "100%"
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 0,
        marginRight: 10
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
    disabledButton: {
        backgroundColor: "#9E9E9E",
        opacity: 0.7
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
});

export default VotarLeyScreen;