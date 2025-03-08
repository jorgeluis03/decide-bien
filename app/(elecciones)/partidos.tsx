import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import partidosData from '@/constants/partidos.json';
import PartidoItem from '@/components/screens/PartidoItem';

interface Personero {
    tipo: string;
    nombre: string;
}

interface Partido {
    numero: string;
    nombre: string;
    fecha_inscripcion: string;
    direccion: string;
    telefonos: string;
    web: string;
    email: string;
    personeros: Personero[];
}

export default function PartidosScreen() {
    const [partidos, setPartidos] = useState<Partido[]>([]);

    useEffect(() => {
        setPartidos(partidosData);
    }, []);

    return (
        <ThemedView>
            <FlatList
                data={partidos}
                keyExtractor={(item) => item.numero}
                renderItem={({ item }) => <PartidoItem partido={item} />}
            />
        </ThemedView>
    );
}


