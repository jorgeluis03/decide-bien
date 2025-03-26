import { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchData } from '@/utils/fetchData';
import { BASE_URL } from "@/constants/config";
import { Funcionario } from '../types/funcionario';
import FuncionarioItem from './funcionarioItem';

export default function MinistrosList() {
  const [ministros, setMinistros] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const router = useRouter();

  useEffect(() => {
    fetchMinistros();
  }, [debouncedQuery]);

  const fetchMinistros = async () => {
    try {
      setLoading(true);
      const response = await fetchData<Funcionario[]>(`${BASE_URL}/api/v1/ministros?query=${encodeURIComponent(debouncedQuery)}`);
      setMinistros(response || []);
    } catch (error) {
      console.error('Error fetching ministros:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMinistros();
  };

  return (
    <View style={styles.tabContent}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar ministro..."
        value={query}
        onChangeText={setQuery}
        clearButtonMode="while-editing"
      />
      
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.common.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={ministros}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FuncionarioItem 
              item={item} 
              onPress={() => {}} 
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={60} color="#ccc" />
              <ThemedText style={styles.emptyText}>No se encontraron ministros</ThemedText>
            </ThemedView>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: 16
  },
  searchInput: {
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  loader: {
    marginTop: 20
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyText: {
    marginTop: 12,
    color: '#999',
    textAlign: 'center'
  }
});