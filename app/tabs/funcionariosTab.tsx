import { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Platform
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import {
  CongresistasList,
  MinistrosList,
  GobernadoresList
} from '@/features/funcionarios/components';

// Componente principal de la pantalla
export default function FuncionariosTab() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'congresistas', title: 'Congresistas' },
    { key: 'ministros', title: 'Ministros' },
    { key: 'gobernadores', title: 'Gobernadores' },
  ]);

  const renderScene = SceneMap({
    congresistas: CongresistasList,
    ministros: MinistrosList,
    gobernadores: GobernadoresList,
  });

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }]}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Funcionarios Públicos</ThemedText>
      </ThemedView>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: Colors.common.primary }}
            style={{ backgroundColor: 'white' }}
            activeColor={Colors.common.primary}
            inactiveColor="gray"
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold"
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'none'
  }
});