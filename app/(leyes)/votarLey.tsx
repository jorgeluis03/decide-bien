import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Platform,
    StatusBar,
    TouchableOpacity,
    ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";

interface Votes {
    favor: number;
    contra: number;
    neutral: number;
}

const VotarLeyScreen: React.FC = () => {
    const router = useRouter();
    const [votes, setVotes] = useState<Votes>({ favor: 150, contra: 80, neutral: 30 });
    const [ageVotes] = useState({
        "18-25": { favor: 50, contra: 20, neutral: 10 },
        "26-40": { favor: 60, contra: 30, neutral: 15 },
        "41+": { favor: 40, contra: 30, neutral: 5 }
    });
    const [genderVotes] = useState({
        male: { favor: 90, contra: 40, neutral: 20 },
        female: { favor: 60, contra: 40, neutral: 10 }
    });
    const [locationVotes] = useState({
        urban: { favor: 100, contra: 50, neutral: 20 },
        rural: { favor: 50, contra: 30, neutral: 10 }
    });
    
    const totalVotes = votes.favor + votes.contra + votes.neutral;
    const getPercentage = (count: number) => (totalVotes ? (count / totalVotes) * 100 : 0);

    return (
        <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }]}>            
            {/* Header e Icon Back*/}
            <ThemedView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color="black" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Estadísticas de Votación</ThemedText>
            </ThemedView>
            
            <ScrollView>
                {/* Estadísticas Generales */}
                <View style={styles.statsContainer}>
                    <ThemedText style={styles.sectionTitle}>Resultados Generales</ThemedText>
                    {[
                        { label: "A favor", color: "#4CAF50", value: votes.favor },
                        { label: "Neutral", color: "#FF9800", value: votes.neutral },
                        { label: "En contra", color: "#F44336", value: votes.contra }
                    ].map((item, index) => (
                        <View key={index} style={styles.statRow}>
                            <Text style={styles.statLabel}>{item.label}</Text>
                            <View style={styles.progressBarBackground}>
                                <View style={[styles.progressBarFill, { width: `${getPercentage(item.value)}%`, backgroundColor: item.color }]} />
                            </View>
                            <Text style={styles.percentageText}>{getPercentage(item.value).toFixed(1)}%</Text>
                        </View>
                    ))}
                </View>
                
                {/* Segmentación por Edad */}
                <View style={styles.statsContainer}>
                    <ThemedText style={styles.sectionTitle}>Votos por Edad</ThemedText>
                    {Object.entries(ageVotes).map(([ageRange, data], index) => (
                        <View key={index}>
                            <Text style={styles.subTitle}>{ageRange}</Text>
                            {Object.entries(data).map(([label, value], i) => (
                                <Text key={i} style={styles.detailText}>{label}: {value} votos</Text>
                            ))}
                        </View>
                    ))}
                </View>
                
                {/* Segmentación por Género */}
                <View style={styles.statsContainer}>
                    <ThemedText style={styles.sectionTitle}>Votos por Género</ThemedText>
                    {Object.entries(genderVotes).map(([gender, data], index) => (
                        <View key={index}>
                            <Text style={styles.subTitle}>{gender === "male" ? "Hombres" : "Mujeres"}</Text>
                            {Object.entries(data).map(([label, value], i) => (
                                <Text key={i} style={styles.detailText}>{label}: {value} votos</Text>
                            ))}
                        </View>
                    ))}
                </View>

                {/* Segmentación por Ubicación */}
                <View style={styles.statsContainer}>
                    <ThemedText style={styles.sectionTitle}>Votos por Ubicación</ThemedText>
                    {Object.entries(locationVotes).map(([location, data], index) => (
                        <View key={index}>
                            <Text style={styles.subTitle}>{location === "urban" ? "Zona Urbana" : "Zona Rural"}</Text>
                            {Object.entries(data).map(([label, value], i) => (
                                <Text key={i} style={styles.detailText}>{label}: {value} votos</Text>
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
    header: { flexDirection: "row", alignItems: "center", paddingVertical: 15 },
    headerTitle: { flex: 1, fontSize: 20, fontWeight: "bold", textAlign: "center" },
    statsContainer: { marginTop: 20, padding: 20, backgroundColor: "#f9f9f9", borderRadius: 12, shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#333" },
    subTitle: { fontSize: 16, fontWeight: "600", color: "#555", marginTop: 10 },
    detailText: { fontSize: 14, color: "#666", marginLeft: 10 },
    statRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    statLabel: { flex: 1, fontSize: 16, fontWeight: "500", color: "#333" },
    progressBarBackground: { flex: 3, height: 12, backgroundColor: "#ddd", borderRadius: 6, overflow: "hidden" },
    progressBarFill: { height: "100%" },
    percentageText: { width: 50, textAlign: "right", fontSize: 16, fontWeight: "600", color: "#555" }
});

export default VotarLeyScreen;