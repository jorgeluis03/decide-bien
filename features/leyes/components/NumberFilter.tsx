import React, { useState, useEffect } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

interface NumberFilterProps {
    onNumberChange: (number: number | null) => void;
}

export default function NumberFilter({ onNumberChange }: NumberFilterProps) {
    const [leyNumber, setLeyNumber] = useState<string>("");

    useEffect(() => {
        // Convertir a número o null si está vacío
        const numValue = leyNumber.trim() !== "" ? parseInt(leyNumber, 10) : null;
        onNumberChange(numValue);
    }, [leyNumber, onNumberChange]);

    const clearNumber = () => {
        setLeyNumber("");
    };

    return (
        <ThemedView style={styles.numberInputContainer}>
            <TouchableOpacity style={styles.numberButton}>
                <Ionicons name="document-text-outline" size={20} color="black" />
                <TextInput
                    style={styles.input}
                    placeholder="Número"
                    value={leyNumber}
                    onChangeText={(text) => setLeyNumber(text.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    returnKeyType="search"
                    placeholderTextColor="#888"
                />
            </TouchableOpacity>
            {leyNumber.length > 0 && (
                <TouchableOpacity style={styles.clearButton} onPress={clearNumber}>
                    <Ionicons name="close-circle" size={20} color="gray" />
                </TouchableOpacity>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    numberInputContainer: {
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 12,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    numberButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    input: {
        marginLeft: 8,
        fontSize: 14,
        width: 80,
        color: "#333",
    },
    clearButton: {
        marginLeft: 2,
    },
});