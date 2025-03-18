import { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import PartidosScreen from '../elecciones/partidos';

const CandidatosScreen = () => (
  <ThemedView style={styles.screenContainer}>
    <ThemedText>Lista de Candidatos</ThemedText>
  </ThemedView>
);

const renderScene = SceneMap({
  partidos: PartidosScreen,
  candidatos: CandidatosScreen,
});

export default function EleccionesTab() {
  const layout = useWindowDimensions();
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState<string>("");
  const [routes] = useState([
    { key: 'candidatos', title: 'Candidatos' },
    { key: 'partidos', title: 'Partidos' },
  ]);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }]}>

      {!showSearch ? (
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerTitle}>Elecciones - 2026</ThemedText>
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
            onChangeText={() => { }}
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

      {/* ✅ Tab Navigation */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: Colors.light.tint }}
            style={{ backgroundColor: 'white' }}
            activeColor={Colors.light.tint}
            inactiveColor="gray"
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10, marginTop: 20 },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#f7f7f7", borderRadius: 30, paddingHorizontal: 12, marginVertical: 8, height: 40, width: "100%" },
  input: { flex: 1, fontSize: 16, height: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  separator: { height: 1, backgroundColor: "#E0E0E0", marginVertical: 8 },
});
