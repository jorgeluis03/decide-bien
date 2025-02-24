import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { TabView, SceneMap, TabBar, NavigationState, SceneRendererProps } from 'react-native-tab-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PerfilScreen from './PerfilScreen';
import MiembrosScreen from './MiembrosScreen';

// Definir tipos para las rutas
interface Route {
  key: string;
  title: string;
  icon: string;
}

// Definir tipos para la navegación
interface State extends NavigationState<Route> { }

// Rutas de la aplicación
const PropuestasRoute: React.FC = React.memo(() => (
  <View style={styles.scene}>
    <Text style={styles.text}>📜 Propuestas del Candidato</Text>
  </View>
));

const MiembrosRoute: React.FC = React.memo(() => (
  <MiembrosScreen />
));

const PerfilRoute: React.FC = React.memo(() => (
  <PerfilScreen />
));

const DetalleCandidatoScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [index, setIndex] = useState<number>(0);
  const [routes] = useState<Route[]>([
    { key: 'propuestas', title: 'Propuestas', icon: 'file-document-outline' },
    { key: 'miembros', title: 'Miembros', icon: 'account-group-outline' },
    { key: 'perfil', title: 'Perfil', icon: 'account-circle-outline' },
  ]);

  const renderScene = SceneMap({
    propuestas: PropuestasRoute,
    miembros: MiembrosRoute,
    perfil: PerfilRoute,
  });

  const renderTabBar = (props: SceneRendererProps & { navigationState: State }) => {
    return (
      <TabBar
        {...props}
        style={styles.tabBar}
        indicatorStyle={styles.indicator}
        renderLabel={({ route, focused }) => (
          <View style={styles.tabItem}>
            <MaterialCommunityIcons
              name={route.icon}
              size={24}
              color={focused ? '#ffffff' : '#bbbbbb'}
            />
            <Text style={[styles.tabText, focused && styles.tabTextActive]}>
              {route.title}
            </Text>
          </View>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={renderTabBar}
      />
    </View>
  );
};

export default DetalleCandidatoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#3498db',
    elevation: 4,
  },
  indicator: {
    backgroundColor: '#ffffff',
    height: 2,
    borderRadius: 2,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 14,
    marginLeft: 6,
    color: '#bbbbbb',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  scene: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
