import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchData } from "../../utils/fetchData";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import FirmantesLista from "@/components/screens/FirmantesLista";
import { useRouter } from "expo-router";

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
  const router = useRouter();
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
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }]}>
      {/* Header e Icon Back*/}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Detalles de Ley</ThemedText>
      </ThemedView>

      {/* Contenido de la Ley */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.title}>{ley?.titulo}</ThemedText>
        <ThemedView style={styles.infoBox}>
          <Ionicons name="document-text" size={24} color="#007AFF" />
          <ThemedText style={styles.subtitle}>{ley?.desEstado}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoBox}>
          <Ionicons name="calendar" size={24} color="#007AFF" />
          <ThemedText style={styles.date}>{ley?.fecPresentacion}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoBox}>
          <Ionicons name="people" size={24} color="#007AFF" />
          <ThemedText style={styles.proponente}>{ley?.desProponente}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoBox}>
          <Ionicons name="briefcase" size={24} color="#007AFF" />
          <ThemedText style={styles.group}>{ley?.desGpar}</ThemedText>
        </ThemedView>
        <ThemedText style={styles.sumilla}>{ley?.sumilla}</ThemedText>

        {/* Firmantes */}
        {ley?.firmantes && <FirmantesLista firmantes={ley.firmantes} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 10 },
  scrollContent: { paddingBottom: 32, paddingHorizontal: 10 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8, color: "#222" },
  infoBox: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  subtitle: { fontSize: 18, fontWeight: "600", color: "#007AFF", marginLeft: 8 },
  sumilla: { fontSize: 14, marginTop: 8, textAlign: "justify", backgroundColor: "#e6f7ff", padding: 10, borderRadius: 6 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, marginTop: 20, marginBottom: 10 },
  headerTitle: { flex: 1, fontSize: 24, fontWeight: "600", textAlign: "center", marginRight: 24 },
  date: { fontSize: 14, color: "gray", marginLeft: 8 },
  proponente: { fontSize: 16, fontWeight: "bold", marginLeft: 8 },
  group: { fontSize: 16, fontStyle: "italic", marginLeft: 8 },
});

