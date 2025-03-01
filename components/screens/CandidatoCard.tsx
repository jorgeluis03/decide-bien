import React from "react";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { ThemedText } from "@/components/ThemedText";

interface Candidato {
    id: string;
    foto: any;
    nombre: string;
    edad: number;
    profesion: string;
    partido: string;
    colorPartido?: string;
    ideologia: string;
    trayectoria?: string;
}

interface CandidatoCardProps {
    candidato: Candidato;
}

const CandidatoCard: React.FC<CandidatoCardProps> = ({ candidato }) => {
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image source={candidato.foto} style={styles.image} />
                <Link href={`/(candidatos)/detalle?id=${candidato.id}`} asChild>
                    <TouchableOpacity style={styles.button}>
                        <ThemedText style={styles.buttonText}>Ver más</ThemedText>
                    </TouchableOpacity>
                </Link>
            </View>
            <View style={styles.info}>
                <ThemedText style={styles.name}>{candidato.nombre}</ThemedText>
                <View style={styles.row}>
                    <ThemedText style={styles.detail}>🎂 {candidato.edad} años</ThemedText>
                    <ThemedText style={styles.detail}>🎓 {candidato.profesion}</ThemedText>
                </View>
                <View style={styles.row}>
                    <View style={[styles.badge, { backgroundColor: candidato.colorPartido || "#3498db" }]}>
                        <ThemedText style={styles.badgeText}>{candidato.partido}</ThemedText>
                    </View>
                    <View style={[styles.badge, styles.ideologyBadge]}>
                        <ThemedText style={styles.badgeText}>{candidato.ideologia}</ThemedText>
                    </View>
                </View>
                {candidato.trayectoria && (
                    <ThemedText style={styles.trayectoria}>{candidato.trayectoria}</ThemedText>
                )}
            </View>
        </View>
    );
};

export default CandidatoCard;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingVertical: 12,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        backgroundColor: "#fff",
    },
    imageContainer: {
        alignItems: "center",
        flexDirection: "column",
        marginRight: 16,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: "#0a7ea4",
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 4,
    },
    detail: {
        fontSize: 14,
        color: "#555",
        marginRight: 10, // Reemplazo de gap
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
        marginRight: 6,
    },
    ideologyBadge: {
        backgroundColor: "#FFD700",
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#fff",
    },
    trayectoria: {
        fontSize: 13,
        color: "#777",
        fontStyle: "italic",
        marginTop: 6,
    },
    button: {
        marginTop: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: "#0a7ea4",
        borderRadius: 6,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
});
