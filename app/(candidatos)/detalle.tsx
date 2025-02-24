import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function DetalleCandidatoScreen() {
  const { id } = useLocalSearchParams(); // Obtiene el ID del candidato desde la URL

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle del Candidato</Text>
      <Text>ID: {id}</Text>
      {/* Aquí podrías buscar la info del candidato usando el ID */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
