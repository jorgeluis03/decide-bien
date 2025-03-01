import { useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

const mockLeyes: Ley[] = [
  {
    perParId: 2021,
    pleyNum: 10383,
    proyectoLey: "10383/2024-CR",
    desEstado: "PRESENTADO",
    fecPresentacion: "2025-02-28T00:00:00.000-0500",
    titulo: "LEY QUE FORTALECE LOS PRINCIPIOS DE TEMPORALIDAD Y ESPECIALIDAD...",
    desProponente: "Congreso",
    autores: "Cavero Alva, Alejandro Enrique; Málaga Trillo, George Edward...",
  },
  {
    perParId: 2021,
    pleyNum: 10382,
    proyectoLey: "10382/2024-CR",
    desEstado: "PRESENTADO",
    fecPresentacion: "2025-02-28T00:00:00.000-0500",
    titulo: "LEY QUE FORTALECE LA EJECUCIÓN PRESUPUESTAL EN MATERIA DE RIESGOS...",
    desProponente: "Congreso",
    autores: "Vergara Mendoza, Elvis Hernán; Alva Rojas, Carlos Enrique...",
  },
];

export default function LeyesScreen() {
  const [leyes, setLeyes] = useState<Ley[]>(mockLeyes);
  const [query, setQuery] = useState("");

  const filteredLeyes = leyes.filter(
    (ley) => ley.titulo.toLowerCase().includes(query.toLowerCase())
  );

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
      </View>
      <FlatList
        data={filteredLeyes}
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
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16 },
});
