import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDebounce } from "../hooks/useDebounce"; // Hook personalizado

const SearchScreen = ({ onSearchResults }: { onSearchResults: (results: any[]) => void }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) {
      fetchResults(debouncedQuery);
    } else {
      onSearchResults([]); // Resetear resultados si no hay búsqueda
    }
  }, [debouncedQuery]);

  const fetchResults = useCallback(async (searchTerm: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`);
      const data = await response.json();
      onSearchResults(data.drinks || []);
    } catch (error) {
      console.error("Error fetching search results:", error);
      onSearchResults([]); // Evita que la app se quede sin actualizar los resultados en caso de error
    }
    setLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Buscar cóctel..."
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

      {loading && <ActivityIndicator size="small" color="gray" style={styles.loader} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 30,
    paddingHorizontal: 12,
    alignSelf: "center",
    marginVertical: 8,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16 },
  loader: { marginTop: 10, alignSelf: "center" },
});

export default SearchScreen;
