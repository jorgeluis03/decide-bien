import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  query: string;
  setQuery: (text: string) => void;
}

export const SearchBar = ({ query, setQuery }: Props) => {
  return (
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
  );
};

const styles = StyleSheet.create({
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
});
