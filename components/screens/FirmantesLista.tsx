import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { BASE_URL } from '@/constants/config';

interface Firmante {
  firmanteId: number;
  nombre: string;
  dni: string;
  sexo: string;
  pagWeb: string;
  foto_url: string;
}

interface FirmantesListProps {
  firmantes: Firmante[];
}

export default function FirmantesLista({ firmantes }: FirmantesListProps) {
  const proxyUrl = `${BASE_URL}/api/v1/proxy?url=`;
  return (
    <View>
      <ThemedText style={styles.sectionTitle}>👥 Firmantes:</ThemedText>
      {firmantes.map((firmante) => (
        <ThemedView key={firmante.firmanteId} style={styles.firmanteContainer}>
          <ThemedView style={styles.imageContainer}>
            <Image
              source={{ uri: proxyUrl + encodeURIComponent(firmante.foto_url) }}
              style={styles.image}
            />
          </ThemedView>
          <ThemedView style={styles.info}>
            <ThemedText style={styles.name}>{firmante.nombre}</ThemedText>
            <ThemedView style={styles.row}>
              <ThemedText style={styles.detail}>DNI: {firmante.dni}</ThemedText>
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
  image: { width: 60, height: 60, borderRadius: 40, borderWidth: 2, borderColor: "#0a7ea4" },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold", color: "#333" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  detail: { fontSize: 14, color: "#555" },
  button: { paddingVertical: 6 },
  buttonText: { color: "#000", fontWeight: "bold", fontSize: 16, fontStyle: "italic" },
});
