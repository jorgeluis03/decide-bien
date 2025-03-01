import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Linking, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchData } from "../../utils/fetchData";

const API_URL = "http://192.168.18.24:8080/api/v1/leyes/proyectos";

interface Firmante {
  firmanteId: number;
  nombre: string;
  dni: string;
  sexo: string;
  pagWeb: string;
}

interface Ley {
  titulo: string;
  desEstado: string;
  fecPresentacion: string;
  desProponente: string;
  desGpar: string;
  sumilla: string;
  firmantes: Firmante[];
}

export default function DetalleLeyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ley, setLey] = useState<Ley | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeyDetails = async () => {
      try {
        const data = await fetchData<{ code: number; data?: { general: any; firmantes: Firmante[] } }>(`${API_URL}/${id}`);
        if (data.code === 200 && data.data) {
          setLey({ ...data.data.general, firmantes: data.data.firmantes });
        } else {
          setError("No se encontraron detalles para esta ley.");
        }
      } catch (err) {
        setError("Error al cargar los detalles de la ley.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLeyDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>{ley?.titulo}</Text>
      <View style={styles.infoBox}>
        <Ionicons name="document-text" size={24} color="#007AFF" />
        <Text style={styles.subtitle}>{ley?.desEstado}</Text>
      </View>
      <View style={styles.infoBox}>
        <Ionicons name="calendar" size={24} color="#007AFF" />
        <Text style={styles.date}>{ley?.fecPresentacion}</Text>
      </View>
      <View style={styles.infoBox}>
        <Ionicons name="people" size={24} color="#007AFF" />
        <Text style={styles.proponente}>{ley?.desProponente}</Text>
      </View>
      <View style={styles.infoBox}>
        <Ionicons name="briefcase" size={24} color="#007AFF" />
        <Text style={styles.group}>{ley?.desGpar}</Text>
      </View>
      <Text style={styles.sumilla}>{ley?.sumilla}</Text>

      <Text style={styles.sectionTitle}>👥 Firmantes:</Text>
      {ley?.firmantes.map((firmante) => (
        <View key={firmante.firmanteId} style={styles.firmanteContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${firmante.nombre}&background=0a7ea4&color=fff` }}
              style={styles.image}
            />
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{firmante.nombre}</Text>
            <View style={styles.row}>
              <Text style={styles.detail}>DNI: {firmante.dni}</Text>
              <Text style={styles.detail}>{firmante.sexo === 'M' ? '♂️' : '♀️'}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => Linking.openURL(firmante.pagWeb)}>
              <Text style={styles.buttonText}>🔗 Ver perfil</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 16 },
  scrollContent: { paddingBottom: 32 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8, color: "#222" },
  infoBox: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  subtitle: { fontSize: 18, fontWeight: "600", color: "#007AFF", marginLeft: 8 },
  date: { fontSize: 14, color: "gray", marginLeft: 8 },
  proponente: { fontSize: 16, fontWeight: "bold", marginLeft: 8 },
  group: { fontSize: 16, fontStyle: "italic", marginLeft: 8 },
  sumilla: { fontSize: 14, marginTop: 8, textAlign: "justify", backgroundColor: "#e6f7ff", padding: 10, borderRadius: 6 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginTop: 16, marginBottom: 8 },
  firmanteContainer: { flexDirection: "row", paddingVertical: 12, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#ddd", backgroundColor: "#fff" },
  imageContainer: { alignItems: "center", marginRight: 16 },
  image: { width: 60, height: 60, borderRadius: 40, borderWidth: 2, borderColor: "#0a7ea4" },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold", color: "#333" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  detail: { fontSize: 14, color: "#555" },
  button: { marginTop: 8, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#0a7ea4", borderRadius: 6 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
