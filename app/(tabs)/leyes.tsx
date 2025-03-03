import { useState, useEffect } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchData } from "../../utils/fetchData";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from "expo-router";
import { StatusBar, Platform } from "react-native";


interface Ley {
  perParId: number;
  pleyNum: number;
  proyectoLey: string;
  desEstado: string;
  fecPresentacion: string;
  titulo: string;
  desProponente: string;
  autores: string;
}

const API_URL = "http://192.168.18.24:8080/api/v1/leyes/proyectos";
const PAGE_SIZE = 10;

export default function LeyesScreen() {
  const [leyes, setLeyes] = useState<Ley[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [rowStart, setRowStart] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  const fetchLeyes = async (reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const body = {
        comisionId: null,
        congresistaId: null,
        estadoId: null,
        fecPresentacionDesde: null,
        fecPresentacionHasta: null,
        grupoParlamentarioId: null,
        legislaturaId: null,
        pageSize: PAGE_SIZE,
        palabras: debouncedQuery || null,
        perLegId: null,
        perParId: 2021,
        pleyNum: null,
        proponenteId: null,
        rowStart: reset ? 0 : rowStart,
        tipoFirmanteId: null,
      };

      const data = await fetchData<{ data: { proyectos: Ley[]; rowsTotal: number } }>(
        API_URL,
        "POST",
        undefined,
        body
      );

      const proyectos = data.data?.proyectos || [];
      const total = data.data?.rowsTotal || 0;

      setTotalRows(total);
      setLeyes(reset ? proyectos : [...leyes, ...proyectos]);
      setRowStart(reset ? PAGE_SIZE : rowStart + PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching leyes:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeyes(true);
  }, [debouncedQuery]);

  const handleLoadMore = () => {
    if (!loadingMore && leyes.length < totalRows) fetchLeyes(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeyes(true);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      {/* Header con botón de búsqueda */}
      {!showSearch ? (
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Proyectos de Ley</ThemedText>
          <TouchableOpacity onPress={() => setShowSearch(true)}>
            <Ionicons name="search" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ) : (
        <ThemedView style={styles.searchBar}>
          <TextInput
            style={styles.input}
            placeholder="Buscar ley..."
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
            autoFocus
          />
          <TouchableOpacity onPress={() => {
            setQuery("");
            setShowSearch(false);
          }}>
            <Ionicons name="close" size={24} color="gray" />
          </TouchableOpacity>
        </ThemedView>
      )}

      {loading && leyes.length === 0 ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </ThemedView>
      ) : (
        <FlatList
          data={leyes}
          keyExtractor={(item) => item.pleyNum.toString()}
          renderItem={({ item }) => (
            <Link href={`/(leyes)/detalle?id=${item.pleyNum}`} asChild>
              <TouchableOpacity style={styles.itemContainer}>
                <ThemedText style={styles.estado}>{item.desEstado}</ThemedText>
                <ThemedText style={styles.titulo}>{item.titulo}</ThemedText>
                <ThemedText style={styles.fecha}>
                  📅 {new Date(item.fecPresentacion).toLocaleDateString()}
                </ThemedText>
                <ThemedText style={styles.autores}>🖊 {item.autores}</ThemedText>
              </TouchableOpacity>
            </Link>
          )}
          ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
          ListEmptyComponent={() => (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No se encontraron leyes</ThemedText>
            </ThemedView>
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListFooterComponent={() =>
            loadingMore ? <ActivityIndicator size="small" color="#007AFF" /> : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10, marginTop: 20 },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 30,
    paddingHorizontal: 12,
    marginVertical: 8,
    height: 40,
    width: "100%",
  },
  
  input: {
    flex: 1,
    fontSize: 16,
    height: 40,
  },

  emptyContainer: { alignItems: "center", marginTop: 20 },
  emptyText: { fontSize: 16, color: "gray" },
  itemContainer: { paddingVertical: 12, paddingHorizontal: 10 },
  estado: { fontSize: 14, fontWeight: "bold", color: "#007AFF" },
  titulo: { fontSize: 16, fontWeight: "600", marginVertical: 4 },
  fecha: { fontSize: 14, color: "gray" },
  autores: { fontSize: 14, color: "#555", marginTop: 4 },
  separator: { height: 1, backgroundColor: "#E0E0E0", marginVertical: 8 },
  icon: { marginHorizontal: 8 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});