import React, { useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import axios from 'axios';

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

interface Props {
    partido: Partido;
}

export default function PartidoItem({ partido }: Props) {
    const proxyUrl = "http://192.168.18.24:8080/api/v1/proxy?url=";
    const targetUrl = encodeURIComponent("https://www.congreso.gob.pe/Storage/tbl_congresistas/fld_47_Fotografia_file/1160-n5Ta8Yr8Pg9Vj5N.jpg");

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
