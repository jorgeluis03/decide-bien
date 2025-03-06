import React, { useState, useRef, useEffect } from "react";
import { View, TouchableOpacity, Animated, StyleSheet, Dimensions, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FloatingActionButtonProps {
  onCommentPress: () => void;
  onVotePress: () => void;
  onToggle?: (isOpen: boolean) => void; // Nueva prop para notificar al padre
  isOpen?: boolean; // Prop para controlar el estado desde el padre
}

const { height } = Dimensions.get("window");

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onCommentPress,
  onVotePress,
  onToggle,
  isOpen: isOpenProp = false, // Valor por defecto
}) => {
  const [isOpen, setIsOpen] = useState(isOpenProp); // Estado interno
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const positionAnim1 = useRef(new Animated.Value(0)).current; // Para el botón de comentarios
  const positionAnim2 = useRef(new Animated.Value(0)).current; // Para el botón de votar

  // Sincronizar el estado interno con la prop isOpen
  useEffect(() => {
    setIsOpen(isOpenProp);
    toggleMenuAnimations(isOpenProp);
  }, [isOpenProp]);

  const toggleMenuAnimations = (shouldOpen: boolean) => {
    const toValue = shouldOpen ? 1 : 0;
    const position1 = shouldOpen ? -80 : 0; // Ajusta según sea necesario
    const position2 = shouldOpen ? -160 : 0; // Ajusta según sea necesario

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue,
        useNativeDriver: true,
      }),
      Animated.spring(positionAnim1, {
        toValue: position1,
        useNativeDriver: true,
      }),
      Animated.spring(positionAnim2, {
        toValue: position2,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleMenu = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    toggleMenuAnimations(newIsOpen);

    // Notificar al padre sobre el cambio de estado
    if (onToggle) {
      onToggle(newIsOpen);
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón de Comentarios */}
      <Animated.View style={[styles.option, { transform: [{ translateY: positionAnim1 }, { scale: scaleAnim }], zIndex: 3 }]}>
        <Text style={styles.optionText}>Comentarios</Text>
        <TouchableOpacity style={styles.button} onPress={onCommentPress}>
          <Ionicons name="chatbubble" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Botón de Votar */}
      <Animated.View style={[styles.option, { transform: [{ translateY: positionAnim2 }, { scale: scaleAnim }], zIndex: 3 }]}>
        <Text style={styles.optionText}>Votar</Text>
        <TouchableOpacity style={styles.button} onPress={onVotePress}>
          <Ionicons name="thumbs-up" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Botón Principal */}
      <TouchableOpacity style={[styles.mainButton, { zIndex: 3 }]} onPress={toggleMenu}>
        <Ionicons name={isOpen ? "close" : "add"} size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    right: 20,
    alignItems: "center",
    zIndex: 2, // El FAB y sus opciones están por encima del overlay
  },
  option: {
    position: "absolute",
    bottom: 0,
    right: 0, // Alinear a la derecha
    flexDirection: "row-reverse", // Texto a la izquierda del ícono
    alignItems: "center", // Centrar verticalmente
    width: 160, // Ancho suficiente para el texto y el ícono
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    marginRight: 10,
  },
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  optionText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "semibold",
  },
});

export default FloatingActionButton;