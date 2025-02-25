import { FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { candidatos } from '@/constants/Candidatos';
import CandidatoCard from '@/components/CandidatoCard';

export default function CandidatosScreen() {

  return (
    <SafeAreaView style={[styles.container]}>
      <FlatList
        data={candidatos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => <CandidatoCard candidato={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
});
