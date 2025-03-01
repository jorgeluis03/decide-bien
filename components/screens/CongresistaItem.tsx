import React from "react";
import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { ThemedText } from '@/components/ThemedText';

interface Congresista {
    id: string;
    foto: any;
    nombre: string;
    edad: number;
    profesion: string;
    educacion: string;
    trayectoria?: string;
}

interface CongresistaItemProps {
    congresista: Congresista;
}

const CongresistaItem: React.FC<CongresistaItemProps> = ({ congresista }) => {
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image source={congresista.foto} style={styles.image} />
                <Link href="#" asChild>
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
                {congresista.trayectoria && (
                    <ThemedText style={styles.trayectoria}>{congresista.trayectoria}</ThemedText>
                )}
            </View>
        </View>
    );
};

export default CongresistaItem;

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
        gap: 6,
        marginTop: 4,
    },
    detail: {
        fontSize: 14,
        color: "#555",
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
