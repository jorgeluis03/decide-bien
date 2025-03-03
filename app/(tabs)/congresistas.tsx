import { useState, useEffect } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    Image,
    View,
    Text
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchData } from "../../utils/fetchData";

const API_URL = "http://192.168.18.24:8080/api/v1/congresistas";
const PAGE_SIZE = 10;

interface Congresista {
    nombre: string;
    partido: string;
    email: string;
    fotoUrl: string;
}

export default function CongresistasScreen() {
    const [congresistas, setCongresistas] = useState<Congresista[]>([]);
    const [query, setQuery] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const debouncedQuery = useDebounce(query, 500);

    const fetchCongresistas = async (reset = false) => {
        if (!hasMore && !reset) return;

        try {
            if (reset) {
                setLoading(true);
                setPage(0);
                setHasMore(true);
            } else {
                setLoadingMore(true);
            }

            const currentPage = reset ? 0 : page;
            const response = await fetchData(`${API_URL}?page=${currentPage}`);

            // Verifica si la respuesta es válida
            if (!response || !Array.isArray(response)) {
                throw new Error("Respuesta de API no válida");
            }

            setCongresistas(reset ? response : [...(congresistas || []), ...response]);

            if (response.length < PAGE_SIZE) {
                setHasMore(false);
            } else {
                setPage(currentPage + 1);
            }
        } catch (error) {
            console.error("Error fetching congresistas:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCongresistas(true);
    }, [debouncedQuery]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) fetchCongresistas(false);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchCongresistas(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="gray" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Buscar congresista..."
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                    returnKeyType="search"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery("")}>
                        <Ionicons name="close" size={20} color="gray" style={styles.icon} />
                    </TouchableOpacity>
                )}
            </View>

            {loading && congresistas.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <FlatList
                    data={congresistas}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.itemContainer}>
                            <Image source={require('@/assets/images/perfil.png')} style={styles.image} />
                            <View style={styles.textContainer}>
                                <Text style={styles.name}>{item.nombre}</Text>
                                <Text style={styles.party}>{item.partido}</Text>
                                <Text style={styles.email}>{item.email}</Text>
                            </View>
                        </View>
                    )}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.1}
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
    searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#f7f7f7", borderRadius: 30, paddingHorizontal: 12, marginVertical: 8 },
    icon: { marginHorizontal: 8 },
    input: { flex: 1, fontSize: 16 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    itemContainer: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 10, alignItems: "center" },
    textContainer: { marginLeft: 10 },
    name: { fontSize: 16, fontWeight: "bold" },
    party: { fontSize: 14, color: "gray" },
    email: { fontSize: 14, color: "#555" },
    image: { width: 50, height: 50, borderRadius: 25 },
});
