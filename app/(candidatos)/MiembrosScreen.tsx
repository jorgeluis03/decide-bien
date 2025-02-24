import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { CandidatosCongreso } from "@/constants/Candidatos";
import CongresistaItem from "@/components/CongresistaItem";

export default function MiembrosScreen() {
    return (
        <FlatList
            data={CandidatosCongreso}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => <CongresistaItem congresista={item} />}
        />
    );
}

const styles = StyleSheet.create({
    listContainer: {
        padding: 16,
    },
});
