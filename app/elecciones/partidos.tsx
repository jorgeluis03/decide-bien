import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import partidosData from '@/constants/partidos.json';
import PartidoItem from '@/components/screens/PartidoItem';
import { Partido } from '@/types';

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


