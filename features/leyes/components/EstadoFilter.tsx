import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, ScrollView, View, Text } from "react-native";

interface EstadoFilterProps {
    onEstadoChange: (selectedEstado: number | null) => void;
}

const estados = [
    {
        "estadoId": null,
        "desEstado": "TODO",
    },
    {
        "estadoId": 1,
        "desEstado": "PRESENTADO",
    },
    {
        "estadoId": 3,
        "desEstado": "EN COMISIÓN",
    },
    {
        "estadoId": 35,
        "desEstado": "DICTAMEN",
    },
    {
        "estadoId": 10,
        "desEstado": "APROBADO",
    },
    {
        "estadoId": 72,
        "desEstado": "APROBADO 1ERA. VOTACIÓN",
    },
    {
        "estadoId": 95,
        "desEstado": "EN AGENDA DEL PLENO",
    },
    {
        "estadoId": 9,
        "desEstado": "AUTÓGRAFA",
    },
    {
        "estadoId": 86,
        "desEstado": "EN DEBATE - PLENO",
    },
    {
        "estadoId": 30,
        "desEstado": "Al Archivo",
    },
    {
        "estadoId": 7,
        "desEstado": "Orden del Día",
    },
    {
        "estadoId": 96,
        "desEstado": "EN CUARTO INTERMEDIO",
    },
    {
        "estadoId": 21,
        "desEstado": "EN RECONSIDERACIÓN",
    },
    {
        "estadoId": 34,
        "desEstado": "PASA A COMISIÓN",
    },
    {
        "estadoId": 73,
        "desEstado": "Pendiente 2da. votación",
    },
    {
        "estadoId": 29,
        "desEstado": "Publicada en el Diario Oficial El Peruano",
    },
    {
        "estadoId": 12,
        "desEstado": "Retirado por su Autor",
    },
    {
        "estadoId": 11,
        "desEstado": "RETORNA A COMISIÓN",
    }
];

export default function EstadoFilter({ onEstadoChange }: EstadoFilterProps) {
    const [selectedEstado, setSelectedEstado] = useState<number | null>(null);

    const toggleEstado = (estadoId: number | null) => {
        const newEstado = selectedEstado === estadoId ? null : estadoId;
        setSelectedEstado(newEstado);
        onEstadoChange(newEstado);
    };

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                {estados.map((estado) => (
                    <TouchableOpacity
                        key={estado.estadoId}
                        style={[styles.estadoButtonContainer, selectedEstado === estado.estadoId && styles.selectedEstado]}
                        onPress={() => toggleEstado(estado.estadoId)}
                    >
                        <Text style={[styles.estadoText, selectedEstado === estado.estadoId && styles.selectedEstadoText]}>
                            {estado.desEstado}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    container: {
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
    selectedEstadoText: {
        fontWeight: "bold",
        color: "#2E8FFA",
    },
    estadoText: {
        fontSize: 12,
    },
});
