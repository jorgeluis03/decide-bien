import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Funcionario } from '../types';

interface FuncionarioItemProps {
  item: Funcionario;
  onPress: () => void;
}

export default function FuncionarioItem({ item, onPress }: FuncionarioItemProps) {
  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      <Image 
        source={item.foto ? { uri: item.foto } : require('@/assets/images/perfil.png')} 
        style={styles.avatar} 
      />
      <View style={styles.infoContainer}>
        <ThemedText style={styles.nombre}>{item.nombre}</ThemedText>
        <ThemedText style={styles.cargo}>{item.cargo}</ThemedText>
        <ThemedText style={styles.entidad}>{item.entidad}</ThemedText>
        
        {/* Calificación con estrellas */}
        <View style={styles.ratingContainer}>
          {Array(5).fill(0).map((_, i) => (
            <Ionicons 
              key={i}
              name={i < Math.round(item.calificacion) ? "star" : "star-outline"} 
              size={16} 
              color="#FFD700" 
            />
          ))}
          <ThemedText style={styles.ratingText}>
            ({item.numCalificaciones})
          </ThemedText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center'
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12
  },
  infoContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  cargo: {
    fontSize: 14,
    color: '#555'
  },
  entidad: {
    fontSize: 13,
    color: '#777',
    marginBottom: 4
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  ratingText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4
  }
});