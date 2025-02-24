import React from "react";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { ThemedText } from '@/components/ThemedText';

const CongresistaItem = ({ congresista }) => {
    return (
        <View style={styles.card}>
            <View style={styles.imageContainer}>
                <Image source={congresista.foto} style={styles.image} />
                <Link href={`/detalle/${congresista.id}`} asChild>
                    <TouchableOpacity style={styles.button}>
                        <ThemedText style={styles.buttonText}>Ver más</ThemedText>
                    </TouchableOpacity>
                </Link>
            </View>
            <View style={styles.info}>
                <ThemedText style={styles.name}>{congresista.nombre}</ThemedText>
                <View style={styles.row}>
                    <ThemedText style={styles.detail}>🎂 {congresista.edad} años</ThemedText>
                    <ThemedText style={styles.detail}>🎓 {congresista.profesion}</ThemedText>
                </View>
                <ThemedText style={styles.detail}>{congresista.educacion}</ThemedText>
                {congresista.trayectoria && <ThemedText style={styles.trayectoria}>{congresista.trayectoria}</ThemedText>}
            </View>
        </View>
    );
};

export default CongresistaItem;

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 5,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        alignItems: "center",
    },
    imageContainer: {
        alignItems: "center",
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
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
    },
    detail: {
        fontSize: 14,
        color: "#555",
        flexShrink: 1,
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
        alignSelf: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 4,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
});
