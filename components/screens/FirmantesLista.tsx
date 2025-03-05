import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

interface Firmante {
  firmanteId: number;
  nombre: string;
  dni: string;
  sexo: string;
  pagWeb: string;
}

interface FirmantesListProps {
  firmantes: Firmante[];
}

export default function FirmantesLista({ firmantes }: FirmantesListProps) {
  return (
    <View>
      <ThemedText style={styles.sectionTitle}>👥 Firmantes:</ThemedText>
      {firmantes.map((firmante) => (
        <ThemedView key={firmante.firmanteId} style={styles.firmanteContainer}>
          <ThemedView style={styles.imageContainer}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${firmante.nombre}&background=0a7ea4&color=fff` }}
              style={styles.image}
            />
          </ThemedView>
          <ThemedView style={styles.info}>
            <ThemedText style={styles.name}>{firmante.nombre}</ThemedText>
            <ThemedView style={styles.row}>
              <ThemedText style={styles.detail}>DNI: {firmante.dni}</ThemedText>
              <ThemedText style={styles.detail}>{firmante.sexo === "M" ? "♂️" : "♀️"}</ThemedText>
            </ThemedView>
            <TouchableOpacity style={styles.button} onPress={() => Linking.openURL(firmante.pagWeb)}>
              <ThemedText style={styles.buttonText}>🔗 Ver perfil</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginTop: 16, marginBottom: 8 },
  firmanteContainer: { flexDirection: "row", paddingVertical: 12, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#ddd", backgroundColor: "#fff" },
  imageContainer: { alignItems: "center", marginRight: 16 },
  image: { width: 50, height: 50, borderRadius: 40, borderWidth: 2, borderColor: "#0a7ea4" },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold", color: "#333" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  detail: { fontSize: 14, color: "#555" },
  button: { marginTop: 8, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#0a7ea4", borderRadius: 6 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
