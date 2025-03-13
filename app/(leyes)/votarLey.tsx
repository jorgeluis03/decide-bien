import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Platform,
    StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link, useRouter } from "expo-router";

interface Votes {
    favor: number;
    contra: number;
    neutral: number;
}

const VotarLeyScreen: React.FC = () => {
    const router = useRouter();
    const [votes, setVotes] = useState<Votes>({
        favor: 150,
        contra: 80,
        neutral: 30,
    });

    const handleVote = (type: keyof Votes) => {
        setVotes((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0 }]}>
            <ThemedView style={styles.header}>
                <Link href=".." replace>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </Link>
                <ThemedText style={styles.headerTitle}>Votar por la Ley</ThemedText>
            </ThemedView>

            <View style={styles.voteStats}>
                <Text style={styles.voteTitle}>Estadísticas de Votos</Text>
                <View style={styles.voteRow}>
                    <Text style={styles.voteText}>✅ A favor: {votes.favor}</Text>
                    <Text style={styles.voteText}>❌ En contra: {votes.contra}</Text>
                    <Text style={styles.voteText}>⚖️ Neutral: {votes.neutral}</Text>
                </View>
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={[styles.voteButton, styles.favor]} onPress={() => handleVote("favor")}>
                    <Ionicons name="thumbs-up" size={30} color="white" />
                    <Text style={styles.buttonText}>A Favor</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.voteButton, styles.neutral]} onPress={() => handleVote("neutral")}>
                    <Ionicons name="hand-left" size={30} color="white" />
                    <Text style={styles.buttonText}>Neutral</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.voteButton, styles.contra]} onPress={() => handleVote("contra")}>
                    <Ionicons name="thumbs-down" size={30} color="white" />
                    <Text style={styles.buttonText}>En Contra</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 10, justifyContent: "center" },
    header: { flexDirection: "row", alignItems: "center", padding: 10 },
    headerTitle: { flex: 1, fontSize: 24, fontWeight: "bold", textAlign: "center" },
    voteStats: { alignItems: "center", marginBottom: 20 },
    voteTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    voteRow: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
    voteText: { fontSize: 18, fontWeight: "600" },
    buttonsContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
    voteButton: { flexDirection: "row", alignItems: "center", padding: 15, borderRadius: 30, width: "30%", justifyContent: "center" },
    favor: { backgroundColor: "#4CAF50" },
    neutral: { backgroundColor: "#FF9800" },
    contra: { backgroundColor: "#F44336" },
    buttonText: { color: "white", fontSize: 16, fontWeight: "bold", marginLeft: 8 },
});

export default VotarLeyScreen;
