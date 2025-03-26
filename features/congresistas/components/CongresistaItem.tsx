import React from "react";
import { Image, TouchableOpacity, View, StyleSheet, ImageSourcePropType } from "react-native";
import { ThemedText } from '@/components/ThemedText';

interface CongresistaItemProps {
    congresista: {
        id?: string;
        nombre: string;
        partido: string;
        email: string;
        fotoUrl: string;
        votacionObtenida: number;
        periodoInicio: string;
        periodoTermino: string;
        distritoElectoral: string;
        condicion: string;
    };
    onPress?: () => void;
}

const CongresistaItem: React.FC<CongresistaItemProps> = ({ congresista, onPress }) => {
    // Función para formatear fechas (YYYY-MM-DD a DD/MM/YYYY)
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const periodoFormateado = `${formatDate(congresista.periodoInicio)} - ${formatDate(congresista.periodoTermino)}`;

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: congresista.fotoUrl }} 
                    style={[
                        styles.image,
                        congresista.condicion === "en Ejercicio" 
                            ? styles.activeImage 
                            : styles.inactiveImage
                    ]}
                />
                <View style={[
                    styles.statusIndicator,
                    congresista.condicion === "en Ejercicio" 
                        ? styles.activeStatus 
                        : styles.inactiveStatus
                ]}>
                    <ThemedText style={styles.statusText}>
                        {congresista.condicion === "en Ejercicio" ? "Activo" : congresista.condicion}
                    </ThemedText>
                </View>
            </View>
            
            <View style={styles.info}>
                <ThemedText style={styles.name}>{congresista.nombre}</ThemedText>
                <ThemedText style={styles.partido}>{congresista.partido}</ThemedText>
                
                <View style={styles.row}>
                    <View style={styles.detailContainer}>
                        <ThemedText style={styles.detailLabel}>Distrito</ThemedText>
                        <ThemedText style={styles.detailValue}>{congresista.distritoElectoral}</ThemedText>
                    </View>
                    
                    <View style={styles.detailContainer}>
                        <ThemedText style={styles.detailLabel}>Votos</ThemedText>
                        <ThemedText style={styles.detailValue}>{congresista.votacionObtenida.toLocaleString()}</ThemedText>
                    </View>
                </View>
                
                <ThemedText style={styles.periodo}>{periodoFormateado}</ThemedText>
            </View>
        </TouchableOpacity>
    );
};

export default CongresistaItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        padding: 16,
        alignItems: "center",
        backgroundColor: "#fff",
        shadowColor: "#000",
    },
    imageContainer: {
        position: "relative",
        alignItems: "center",
        marginRight: 16,
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 2,
    },
    activeImage: {
        borderColor: "#1e88e5",
    },
    inactiveImage: {
        borderColor: "#9e9e9e",
        opacity: 0.8,
    },
    statusIndicator: {
        position: "absolute",
        bottom: 0,
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    activeStatus: {
        backgroundColor: "#4caf50",
    },
    inactiveStatus: {
        backgroundColor: "#9e9e9e",
    },
    statusText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    partido: {
        fontSize: 14,
        color: "#1e88e5",
        fontWeight: "500",
        marginBottom: 8,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    detailContainer: {
        flex: 1,
        marginRight: 8,
    },
    detailLabel: {
        fontSize: 12,
        color: "#757575",
    },
    detailValue: {
        fontSize: 14,
        color: "#424242",
        fontWeight: "500",
    },
    periodo: {
        fontSize: 13,
        color: "#616161",
        marginTop: 4,
    },
});