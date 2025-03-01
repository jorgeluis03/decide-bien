import { View, Text, StyleSheet } from "react-native";

interface Props {
    ley: {
        desEstado: string;
        titulo: string;
        fecPresentacion: string;
        autores: string;
    };
}

export const LeyItem = ({ ley }: Props) => {
    return (
        <View style={styles.itemContainer}>
            <Text style={styles.estado}>{ley.desEstado}</Text>
            <Text style={styles.titulo}>{ley.titulo}</Text>
            <Text style={styles.fecha}>📅 {new Date(ley.fecPresentacion).toLocaleDateString()}</Text>
            <Text style={styles.autores}>🖊 {ley.autores}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    itemContainer: { paddingVertical: 12, paddingHorizontal: 10 },
    estado: { fontSize: 14, fontWeight: "bold", color: "#007AFF" },
    titulo: { fontSize: 16, fontWeight: "600", marginVertical: 4 },
    fecha: { fontSize: 14, color: "gray" },
    autores: { fontSize: 14, color: "#555", marginTop: 4 },
});
