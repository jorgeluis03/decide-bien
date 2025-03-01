import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Ley {
  desEstado: string;
  titulo: string;
  fecPresentacion: string;
  autores: string;
}

const LeyItem: React.FC<{ ley: Ley }> = ({ ley }) => {
  return (
    <View style={styles.itemContainer}>
      <Text style={styles.estado}>{ley.desEstado}</Text>
      <Text style={styles.titulo}>{ley.titulo}</Text>
      <Text style={styles.fecha}>
        📅 {new Date(ley.fecPresentacion).toLocaleDateString()}
      </Text>
      <Text style={styles.autores}>🖊 {ley.autores}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginVertical: 5,
  },
  estado: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007AFF",
  },
  titulo: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 4,
  },
  fecha: {
    fontSize: 14,
    color: "gray",
  },
  autores: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
});

export default LeyItem;
