import { TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { ThemedText } from "@/components/ThemedText";

interface LeyItemProps {
  pleyNum: number;
  desEstado: string;
  titulo: string;
  fecPresentacion: string;
  autores: string;
}

export default function LeyItem({ pleyNum, desEstado, titulo, fecPresentacion, autores }: LeyItemProps) {
  return (
    <Link href={`/(leyes)/detalle?id=${pleyNum}`} asChild>
      <TouchableOpacity style={styles.itemContainer}>
        <ThemedText style={styles.estado}>{desEstado}</ThemedText>
        <ThemedText style={styles.titulo}>{titulo}</ThemedText>
        <ThemedText style={styles.fecha}>📅 {new Date(fecPresentacion).toLocaleDateString()}</ThemedText>
        <ThemedText style={styles.autores}>🖊 {autores}</ThemedText>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  itemContainer: { paddingVertical: 12, paddingHorizontal: 10 },
  estado: { fontSize: 14, fontWeight: "bold", color: "#007AFF" },
  titulo: { fontSize: 16, fontWeight: "600", marginVertical: 4 },
  fecha: { fontSize: 14, color: "gray" },
  autores: { fontSize: 14, color: "#555", marginTop: 4 },
});
