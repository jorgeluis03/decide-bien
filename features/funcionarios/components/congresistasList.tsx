import { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchData } from '@/utils/fetchData';
import { BASE_URL } from "@/constants/config";
import CongresistaItem from "@/features/congresistas/components/CongresistaItem";
// Actualizar la interfaz para coincidir con los datos reales de la API
interface Congresista {
  id: string;
  nombre: string;
  partido: string;
  email: string;
  fotoUrl: string;
  votacionObtenida: number;
  periodoInicio: string;
  periodoTermino: string;
  distritoElectoral: string;
  condicion: string;
}

export default function CongresistasList() {
  const [congresistas, setCongresistas] = useState<Congresista[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const router = useRouter();

  useEffect(() => {
    fetchCongresistas(true);
  }, [debouncedQuery]);

  const fetchCongresistas = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      
      const currentPage = reset ? 0 : page;
      const response = await fetchData<Congresista[]>(
        `${BASE_URL}/api/v1/congresistas?query=${encodeURIComponent(debouncedQuery)}&page=${currentPage}`
      );
      
      if (!response || !Array.isArray(response)) {
        throw new Error("Respuesta de API no válida");
      }
      
      setCongresistas(reset ? response : [...congresistas, ...response]);
      
      if (response.length < 10) { // Assuming PAGE_SIZE is 10
        setHasMore(false);
      } else {
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.error('Error fetching congresistas:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCongresistas(true);
  };
  
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchCongresistas(false);
    }
  };

  const navigateToCongresistaDetail = (congresista: Congresista) => {
    router.push({
      pathname: "/funcionarios/congresista",
      params: { id: congresista.id }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, partido o distrito..."
          placeholderTextColor="#9e9e9e"
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.common.primary} />
          <ThemedText style={styles.loadingText}>Cargando congresistas...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={congresistas}
          keyExtractor={(item) => item.id || item.nombre}
          renderItem={({ item }) => (
            <CongresistaItem 
              congresista={item}
              onPress={() => navigateToCongresistaDetail(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              colors={[Colors.common.primary]}
              tintColor={Colors.common.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListFooterComponent={() =>
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.common.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={80} color="#bdbdbd" />
              <ThemedText style={styles.emptyTitle}>No se encontraron congresistas</ThemedText>
              <ThemedText style={styles.emptyText}>
                Intenta con otra búsqueda o revisa tu conexión a internet
              </ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    height: 46,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 16,
    color: "#f7f7f7",
  },
  listContent: {
    paddingHorizontal: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#757575",
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: "#616161",
  },
  emptyText: {
    fontSize: 14,
    color: "#9e9e9e",
    textAlign: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#757575",
  }
});