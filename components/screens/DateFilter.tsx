import React, { useState, useEffect } from "react";
import {TouchableOpacity, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "../ThemedView";
import { ThemedText } from "../ThemedText";

interface DateFilterProps {
    onDateChange: (startDate: Date | null, endDate: Date | null) => void;
}

export default function DateFilter({ onDateChange }: DateFilterProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [currentPicker, setCurrentPicker] = useState<"start" | "end" | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === "android") {
            setShowPicker(false); // Oculta el picker al seleccionar
        }
        if (selectedDate) {
            if (currentPicker === "start") {
                setStartDate(selectedDate);
            } else if (currentPicker === "end") {
                setEndDate(selectedDate);
            }
        }
    };


    useEffect(() => {
        onDateChange(startDate, endDate);
    }, [startDate, endDate, onDateChange]);

    const openPicker = (picker: "start" | "end") => {
        setCurrentPicker(picker);
        setShowPicker(true);
    };

    const clearDate = (picker: "start" | "end") => {
        if (picker === "start") {
            setStartDate(null);
        } else {
            setEndDate(null);
        }
    };

    return (
        <ThemedView style={styles.container}>
            {/* Selector de fecha de inicio */}
            <ThemedView style={styles.dateButtonContainer}>
                <TouchableOpacity style={styles.dateButton} onPress={() => openPicker("start")}>
                    <Ionicons name="calendar" size={20} color="black" />
                    <ThemedText style={styles.dateText}>{startDate ? startDate.toLocaleDateString() : "Desde"}</ThemedText>
                </TouchableOpacity>
                {startDate && (
                    <TouchableOpacity style={styles.clearButton} onPress={() => clearDate("start")}>
                        <Ionicons name="close-circle" size={20} color="gray" />
                    </TouchableOpacity>
                )}
            </ThemedView>

            {/* Selector de fecha de fin */}
            <ThemedView style={styles.dateButtonContainer}>
                <TouchableOpacity style={styles.dateButton} onPress={() => openPicker("end")}>
                    <Ionicons name="calendar" size={20} color="black" />
                    <ThemedText style={styles.dateText}>{endDate ? endDate.toLocaleDateString() : "Hasta"}</ThemedText>
                </TouchableOpacity>
                {endDate && (
                    <TouchableOpacity style={styles.clearButton} onPress={() => clearDate("end")}>
                        <Ionicons name="close-circle" size={20} color="gray" />
                    </TouchableOpacity>
                )}
            </ThemedView>

            {showPicker && (
                <DateTimePicker
                    value={currentPicker === "start" ? startDate || new Date() : endDate || new Date()}
                    mode="date"
                    display={Platform.OS === "android" ? "default" : "spinner"}
                    onChange={handleDateChange}
                />
            )}
        </ThemedView>
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
    dateButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    dateButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    dateText: {
        marginLeft: 8,
        fontSize: 14,
    },
    clearButton: {
        marginLeft: 2,
    },
});
