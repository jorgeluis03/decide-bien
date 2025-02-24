import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5} from '@expo/vector-icons';
import { PerfilCandidato } from '@/constants/Candidatos';

type InfoRowProps = {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    value: string;
};

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
        <MaterialCommunityIcons name={icon} size={22} color="#2C3E50" />
        <Text style={styles.infoText}>
            <Text style={styles.bold}>{label}:</Text> {value}
        </Text>
    </View>
);

type CardSectionProps = {
    title: string;
    icon: keyof typeof FontAwesome5.glyphMap;
    content: string | string[];
};

const CardSection: React.FC<CardSectionProps> = ({ title, icon, content }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <FontAwesome5 name={icon} size={18} color="#2C3E50" />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {Array.isArray(content) ? (
            content.map((item, index) => <Text key={index} style={styles.sectionText}>• {item}</Text>)
        ) : (
            <Text style={styles.sectionText}>{content}</Text>
        )}
    </View>
);

const PerfilScreen: React.FC = () => {
    return (
        <ScrollView style={styles.container}>
            {/* Encabezado con la imagen */}
            <View style={styles.header}>
                <Image source={{ uri: 'https://via.placeholder.com/120' }} style={styles.profileImage} />
                <Text style={styles.name}>{PerfilCandidato.nombre}</Text>
                <Text style={styles.profession}>{PerfilCandidato.profesion}</Text>
            </View>

            {/* Información personal */}
            <View style={styles.personalInfo}>
                <InfoRow icon="calendar" label="Edad" value={`${PerfilCandidato.edad} años`} />
                <InfoRow icon="flag" label="Nacionalidad" value={PerfilCandidato.nacionalidad} />
                <InfoRow icon="map-marker" label="Lugar de Nacimiento" value={PerfilCandidato.lugar_de_nacimiento} />
                <InfoRow icon="heart" label="Estado Civil" value={PerfilCandidato.estado_civil} />
                <InfoRow icon="account-group" label="Familia" value={PerfilCandidato.familia} />
            </View>

            {/* Secciones organizadas */}
            <CardSection title="Experiencia Profesional" icon="briefcase" content={PerfilCandidato.experiencia_profesional} />
            <CardSection title="Experiencia Política" icon="landmark" content={PerfilCandidato.experiencia_politica} />
            <CardSection title="Educación" icon="graduation-cap" content={PerfilCandidato.educacion} />
            <CardSection title="Organizaciones" icon="users" content={PerfilCandidato.participacion_organizaciones} />
            <CardSection title="Ideología" icon="balance-scale" content={PerfilCandidato.ideologia} />
            <CardSection title="Intereses" icon="lightbulb" content={PerfilCandidato.intereses} />
            <CardSection title="Hobbies" icon="running" content={PerfilCandidato.hobbies} />
            <CardSection title="Motivaciones" icon="bullseye" content={PerfilCandidato.motivaciones} />
            <CardSection title="Valores" icon="gem" content={PerfilCandidato.valores} />
            <CardSection title="Visión de Futuro" icon="eye" content={PerfilCandidato.vision_de_futuro} />
            <CardSection title="Publicaciones" icon="book" content={PerfilCandidato.publicaciones} />
            <CardSection title="Reconocimientos" icon="award" content={PerfilCandidato.reconocimientos} />

            {/* Redes sociales */}
            <View style={styles.socialMedia}>
                <TouchableOpacity onPress={() => Linking.openURL(PerfilCandidato.redes_sociales.twitter)}>
                    <MaterialCommunityIcons name="twitter" size={30} color="#1DA1F2" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL(PerfilCandidato.redes_sociales.facebook)}>
                    <MaterialCommunityIcons name="facebook" size={30} color="#1877F2" />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ECEFF1',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#2C3E50',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: 'white',
        marginBottom: 10,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    profession: {
        fontSize: 16,
        color: '#D0D3D4',
    },
    personalInfo: {
        padding: 15,
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 16,
        marginLeft: 10,
        color: '#2C3E50',
    },
    bold: {
        fontWeight: 'bold',
    },
    section: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#D0D3D4',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#2C3E50',
    },
    sectionText: {
        fontSize: 14,
        color: '#2C3E50',
    },
    socialMedia: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 20,
        backgroundColor: '#FFFFFF',
    },
});

export default PerfilScreen;
