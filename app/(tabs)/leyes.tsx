import { useState, useEffect } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View, TextInput, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDebounce } from "../../hooks/useDebounce";

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

export default function LeyesScreen() {
  const [leyes, setLeyes] = useState<Ley[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const fetchLeyes = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comisionId: null,
            congresistaId: null,
            estadoId: null,
            fecPresentacionDesde: null,
            fecPresentacionHasta: null,
            grupoParlamentarioId: null,
            legislaturaId: null,
            pageSize: 10,
            palabras: debouncedQuery || null,
            perLegId: null,
            perParId: 2021,
            pleyNum: null,
            proponenteId: null,
            rowStart: 0,
            tipoFirmanteId: null,
          }),
        });
        const data = await response.json();
        setLeyes(data.data.proyectos || []);
      } catch (error) {
        console.error("Error fetching leyes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeyes();
  }, [debouncedQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Buscar ley..."
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={leyes}
          keyExtractor={(item) => item.pleyNum.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.estado}>{item.desEstado}</Text>
              <Text style={styles.titulo}>{item.titulo}</Text>
              <Text style={styles.fecha}>📅 {new Date(item.fecPresentacion).toLocaleDateString()}</Text>
              <Text style={styles.autores}>🖊 {item.autores}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron leyes</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
  },
  itemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  estado: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007AFF",
  },
  titulo: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 4,
  },
  fecha: {
    fontSize: 14,
    color: "gray",
  },
  autores: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 30,
    paddingHorizontal: 12,
    marginVertical: 8,
  },
  icon: { marginHorizontal: 8 },
  input: { flex: 1, fontSize: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

