import { FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { candidatos } from '@/constants/Candidatos';
import CandidatoCard from '@/components/CandidatoCard';
import { Link } from 'expo-router';

export default function CandidatosScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <FlatList
          data={candidatos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => <CandidatoCard candidato={item} />}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContainer: {
    padding: 16,
  },
});