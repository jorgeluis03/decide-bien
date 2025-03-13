import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, TouchableOpacity, Button, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchData } from "../../utils/fetchData";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import FirmantesLista from "@/components/screens/FirmantesLista";
import { useRouter } from "expo-router";
import DescargarPDFButton from "@/components/common/DescargarPDFButton";
import FloatingActionButton from "@/components/common/FloatingActionButton";
import { BASE_URL } from "@/constants/config";
import { useQuery } from "@tanstack/react-query";
const API_URL = `${BASE_URL}/api/v1/leyes/proyectos`;

interface Firmante {
  firmanteId: number;
  nombre: string;
  dni: string;
  sexo: string;
  pagWeb: string;
  foto_url: string;
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

const fetchLeyDetails = async (id: string) => {
  const data = await fetchData<{ code: number; data?: { general: any; firmantes: Firmante[], seguimientos: any } }>(`${API_URL}/${id}`);
  if (data.code === 200 && data.data) {
    return { ley: { ...data.data.general, firmantes: data.data.firmantes }, seguimientos: data.data.seguimientos };
  } else {
    throw new Error("No se encontraron detalles para esta ley.");
  }
};

export default function DetalleLeyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isFabOpen, setIsFabOpen] = useState(false);
  
  /* CACHÉ */
  const { data, isLoading, isError, error } = useQuery<{ ley: Ley; seguimientos: any[] }>({
    queryKey: ["ley", id],
    queryFn: () => fetchLeyDetails(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{(error as Error).message}</Text>
      </View>
    );
  }

  const ley = data?.ley;
  const seguimientos = data?.seguimientos;
  const seguimientoPresentado = seguimientos?.find(s => s.desEstado === "PRESENTADO");
  const proyectoArchivoId = seguimientoPresentado?.archivos?.[0]?.proyectoArchivoId;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }]}>
      {/* Overlay semitransparente */}
      {isFabOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsFabOpen(false)}
        />
      )}
      {/* Header e Icon Back*/}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Detalles de Ley</ThemedText>
      </ThemedView>

      {/* Contenido de la Ley */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.title}>{ley?.titulo}</ThemedText>
        {/* Descargar */}
        <DescargarPDFButton archivo={proyectoArchivoId} />

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

      {/* Boton flotante */}
      <FloatingActionButton
        onCommentPress={() => console.log("Abrir comentarios")}
        onVotePress={() => console.log("Votar por la ley")}
        onToggle={(isOpen) => setIsFabOpen(isOpen)}
        isOpen={isFabOpen}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 10 },
  scrollContent: { paddingBottom: 32, paddingHorizontal: 10 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#222" },
  infoBox: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  subtitle: { fontSize: 18, fontWeight: "600", color: "#007AFF", marginLeft: 8 },
  sumilla: { fontSize: 14, marginTop: 8, textAlign: "justify", backgroundColor: "#e6f7ff", padding: 10, borderRadius: 6 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, marginTop: 20, marginBottom: 10 },
  headerTitle: { flex: 1, fontSize: 24, fontWeight: "600", textAlign: "center", marginRight: 24 },
  date: { fontSize: 14, color: "gray", marginLeft: 8 },
  proponente: { fontSize: 16, fontWeight: "bold", marginLeft: 8 },
  group: { fontSize: 16, fontStyle: "italic", marginLeft: 8 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    zIndex: 1,
  },
});

