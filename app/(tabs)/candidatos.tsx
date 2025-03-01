import { useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View, Image } from "react-native";
import SearchScreen from "@/components/SearchScreen";

export default function CandidatosScreen() {
  const [cocktails, setCocktails] = useState<any[]>([]);

  return (
    <SafeAreaView style={styles.container}>
      <SearchScreen onSearchResults={setCocktails} />

      <FlatList
        data={cocktails}
        keyExtractor={(item) => item.idDrink.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron cócteles</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.strDrinkThumb }} style={styles.image} />
            <Text style={styles.name}>{item.strDrink}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {
    fontSize: 18,
  },
});
