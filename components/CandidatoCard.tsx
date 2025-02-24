import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Link } from 'expo-router';

type Candidato = {
  id: string;
  nombre: string;
  foto: any;
  partido: string;
  colorPartido?: string;
  ideologia: string;
  edad: number;
  profesion: string;
  trayectoria?: string;
};

type CandidatoCardProps = {
  candidato: Candidato;
};

export default function CandidatoCard ({ candidato }: CandidatoCardProps) {
  return (
    <View style={styles.card}>
      <Image source={candidato.foto} style={styles.image} />

      <View style={styles.info}>
        <ThemedText style={styles.name}>{candidato.nombre}</ThemedText>

        {/* Badges para partido e ideología */}
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { backgroundColor: candidato.colorPartido || '#3498db' }]}>
            <ThemedText style={styles.badgeText}>{candidato.partido}</ThemedText>
          </View>
          <View style={[styles.badge, styles.ideologyBadge]}>
            <ThemedText style={styles.badgeText}>{candidato.ideologia}</ThemedText>
          </View>
        </View>

        {/* Información adicional */}
        <ThemedText style={styles.detail}>🎂 {candidato.edad} años</ThemedText>
        <ThemedText style={styles.detail}>🎓 {candidato.profesion}</ThemedText>

        {/* Trayectoria (opcional si existe) */}
        {candidato.trayectoria && (
          <ThemedText style={styles.trayectoria}>{candidato.trayectoria}</ThemedText>
        )}

        {/* Botón interactivo con Link de expo-router */}
        <Link href={`/(candidatos)/detalle?id=${candidato.id}`} asChild>
          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>Ver detalles</ThemedText>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#0a7ea4',
  },
  info: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  detail: {
    fontSize: 14,
    color: '#555',
    marginVertical: 2,
  },
  trayectoria: {
    fontSize: 13,
    color: '#777',
    fontStyle: 'italic',
    marginTop: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
  },
  ideologyBadge: {
    backgroundColor: '#FFD700',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  button: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0a7ea4',
    borderRadius: 6,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
