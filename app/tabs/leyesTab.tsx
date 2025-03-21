import { useState, useEffect } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Animated,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchData } from "../../utils/fetchData";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import DateFilter from "@/components/screens/DateFilter";
import LeyItem from "@/components/screens/LeyItem";
import { BASE_URL } from "@/constants/config";
import { LeyResumen } from "@/features/leyes/types";
import { EstadoFilter } from "@/features/leyes/components";

const API_URL = `${BASE_URL}/api/v1/leyes/proyectos`;
const PAGE_SIZE = 10;

export default function LeyesTab() {
  const [leyes, setLeyes] = useState<LeyResumen[]>([]);
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [rowStart, setRowStart] = useState<number>(0);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<number | null>(null);

  const debouncedQuery = useDebounce(query, 500);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const fetchLeyes = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setLeyes([]);
        setRowStart(0);
      } else {
        setLoadingMore(true);
      }

      const body = {
        pageSize: PAGE_SIZE,
        palabras: debouncedQuery || null,
        rowStart: reset ? 0 : rowStart,
        perParId: 2021,
        fecPresentacionDesde: startDate ? startDate.toISOString().split("T")[0] : null,
        fecPresentacionHasta: endDate ? endDate.toISOString().split("T")[0] : null,
        estadoId: estadoSeleccionado || null,
      };

      const data = await fetchData<{ data: { proyectos: LeyResumen[]; rowsTotal: number } }>(API_URL, "POST", undefined, body);
      const proyectos = data?.data?.proyectos || [];
      const total = data?.data?.rowsTotal || 0;

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
  }, [debouncedQuery, startDate, endDate, estadoSeleccionado]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadMoreLeyes = () => {
    if (!loadingMore && leyes.length < totalRows) {
      fetchLeyes(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }]}>
      {!showSearch ? (
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerTitle}>Proyectos de Ley</ThemedText>
          <TouchableOpacity onPress={() => setShowSearch(true)}>
            <Ionicons name="search" size={24} color="black" />
          </TouchableOpacity>
        </ThemedView>
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
            clearButtonMode="while-editing"
          />
          <TouchableOpacity onPress={() => { setQuery(""); setShowSearch(false); }}>
            <Ionicons name="close" size={24} color="gray" />
          </TouchableOpacity>
        </ThemedView>
      )}

      {/* Filtro por fechas */}
      <DateFilter
        onDateChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />

      {/* Estados de las leyes */}
      <EstadoFilter onEstadoChange={(estado) => setEstadoSeleccionado(estado)} />

      {/* Lista de leyes */}
      {loading && leyes.length === 0 ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </ThemedView>
      ) : (
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          <FlatList
            data={leyes}
            keyExtractor={(item) => item.pleyNum.toString()}
            renderItem={({ item }) => <LeyItem {...item} />}
            ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchLeyes(true)} />}
            ListFooterComponent={() => loadingMore && <ActivityIndicator size="small" color="#007AFF" />}
            onEndReached={loadMoreLeyes}
            onEndReachedThreshold={0.5}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10, marginTop: 20 },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#f7f7f7", borderRadius: 30, paddingHorizontal: 12, marginVertical: 8, height: 40, width: "100%" },
  input: { flex: 1, fontSize: 16, height: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  separator: { height: 1, backgroundColor: "#E0E0E0", marginVertical: 8 },
});
