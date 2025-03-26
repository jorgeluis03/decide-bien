import { Image, StyleSheet, Platform, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ui/ParallaxScrollView';
import { HelloWave } from '@/components/ui/HelloWave';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const navigateTo = (route: string) => {
    
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.headerLogo}
        />
      }>
      <ThemedView style={styles.welcomeContainer}>
        <ThemedText type="title">Bienvenido, {user?.displayName || 'Usuario'}</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedText style={styles.sectionTitle}>Tu participación ciudadana</ThemedText>

      {/* Cards for main sections */}
      <ThemedView style={styles.cardsContainer}>
        {/* Leyes Card */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigateTo('/tabs/leyesTab')}
        >
          <ThemedView style={styles.cardHeader}>
            <Ionicons name="book-outline" size={24} color={Colors.common.primary} />
            <ThemedText style={styles.cardTitle}>Proyectos de Ley</ThemedText>
          </ThemedView>
          <ThemedText style={styles.cardDescription}>
            Consulta, vota y comenta sobre los proyectos de ley actuales en el Congreso
          </ThemedText>
        </TouchableOpacity>

        {/* Elecciones Card */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigateTo('/tabs/eleccionesTab')}
        >
          <ThemedView style={styles.cardHeader}>
            <Ionicons name="checkmark-circle-outline" size={24} color={Colors.common.primary} />
            <ThemedText style={styles.cardTitle}>Elecciones 2026</ThemedText>
          </ThemedView>
          <ThemedText style={styles.cardDescription}>
            Información sobre partidos políticos y candidatos para las próximas elecciones
          </ThemedText>
        </TouchableOpacity>

        {/* Funcionarios Card */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigateTo('/tabs/funcionariosTab')}
        >
          <ThemedView style={styles.cardHeader}>
            <Ionicons name="people-outline" size={24} color={Colors.common.primary} />
            <ThemedText style={styles.cardTitle}>Funcionarios Públicos</ThemedText>
          </ThemedView>
          <ThemedText style={styles.cardDescription}>
            Conoce y califica a congresistas, ministros y gobernadores regionales
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedText style={styles.sectionTitle}>Sobre esta aplicación</ThemedText>
      <ThemedView style={styles.aboutCard}>
        <ThemedText style={styles.aboutText}>
          Decide Bien te permite estar informado y participar activamente en la democracia peruana. 
          Conoce las leyes que se están debatiendo, vota para expresar tu opinión, y mantente 
          actualizado sobre las próximas elecciones.
        </ThemedText>
      </ThemedView>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color="white" />
        <ThemedText style={styles.logoutText}>Cerrar sesión</ThemedText>
      </TouchableOpacity>
      
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerLogo: {
    height: 120,
    width: 120,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: Colors.common.primary,
  },
  cardDescription: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  aboutCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  aboutText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});