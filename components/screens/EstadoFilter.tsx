import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface EstadoFilterProps {
    onEstadoChange: (selectedEstado: number | null) => void;
}

const estados = [
    { estadoId: 1, desEstado: "Pendiente" },
    { estadoId: 2, desEstado: "Aprobado" },
    { estadoId: 3, desEstado: "En Comisión" },
];

export default function EstadoFilter({ onEstadoChange }: EstadoFilterProps) {
    const [selectedEstado, setSelectedEstado] = useState<number | null>(null);
    
    const toggleEstado = (estadoId: number) => {
        const newEstado = selectedEstado === estadoId ? null : estadoId;
        setSelectedEstado(newEstado);
        onEstadoChange(newEstado);
    };

    return (
        <View style={styles.container}>
            {estados.map((estado) => (
                <TouchableOpacity
                    key={estado.estadoId}
                    style={[styles.estadoButtonContainer, selectedEstado === estado.estadoId && styles.selectedEstado]}
                    onPress={() => toggleEstado(estado.estadoId)}
                >
                    <Text style={styles.estadoText}>{estado.desEstado}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginVertical: 10,
        paddingHorizontal: 10,
    },
    estadoButtonContainer: {
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        alignItems: "center",
        justifyContent: "center",
    },
    selectedEstado: {
        backgroundColor: "#d1e7ff",
    },
    estadoText: {
        fontSize: 14,
    },
});
