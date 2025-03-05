import { TouchableOpacity, Text, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Buffer } from "buffer";

const DescargarPDFButton = ({ archivo }: { archivo: any }) => {
    const abrirEnNavegador = async () => {

        const archivoBase64 = Buffer.from(archivo.toString()).toString("base64");

        const url = `https://wb2server.congreso.gob.pe/spley-portal-service/archivo/${archivoBase64}/pdf`;

        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            alert("No se pudo abrir el enlace.");
        }
    };

    return (
        <TouchableOpacity style={styles.button} onPress={abrirEnNavegador}>
            <Ionicons name="download-outline" size={20} color="white" />
            <Text style={styles.text}>Abrir Proyecto de Ley</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#007AFF",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: "center",
        marginVertical: 10,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
        elevation: 5,
    },
    text: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
});

export default DescargarPDFButton;
