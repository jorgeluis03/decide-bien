import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { BASE_URL } from '@/constants/config';
import { Partido } from '@/types';

interface Props {
    partido: Partido;
}

export default function PartidoItem({ partido }: Props) {
    const proxyUrl = `${BASE_URL}/api/v1/proxy?url=`;
    const targetUrl = encodeURIComponent(partido.logo);

    return (
        <View style={styles.itemContainer}>
            <Image
                source={{ uri: proxyUrl + targetUrl }}
                style={styles.image}
            />

            <View style={styles.textContainer}>
                <ThemedText style={styles.title}>{partido.nombre}</ThemedText>
                <ThemedText style={styles.info}>Inscripción: {partido.fecha_inscripcion}</ThemedText>

                {partido.web && (
                    <TouchableOpacity onPress={() => Linking.openURL(partido.web)}>
                        <ThemedText style={styles.link}>🌐 {partido.web}</ThemedText>
                    </TouchableOpacity>
                )}

                {partido.email && (
                    <TouchableOpacity onPress={() => Linking.openURL(`mailto:${partido.email}`)}>
                        <ThemedText style={styles.link}>✉️ {partido.email}</ThemedText>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        alignItems: 'center',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    info: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
    },
    link: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
});
