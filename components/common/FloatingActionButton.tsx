import React, { useRef, useEffect } from "react";
import { View, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FloatingActionButtonProps {
  onCommentPress: () => void;
  onVotePress: () => void;
  onToggle: (isOpen: boolean) => void;
  isOpen: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onCommentPress,
  onVotePress,
  onToggle,
  isOpen,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const positionAnim1 = useRef(new Animated.Value(0)).current;
  const positionAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    toggleMenuAnimations(isOpen);
  }, [isOpen]);

  const toggleMenuAnimations = (shouldOpen: boolean) => {
    const toValue = shouldOpen ? 1 : 0;
    const position1 = shouldOpen ? -80 : 0;
    const position2 = shouldOpen ? -160 : 0;

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(positionAnim1, {
        toValue: position1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(positionAnim2, {
        toValue: position2,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      {/* Botón de Comentarios */}
      <Animated.View style={[styles.option, { transform: [{ translateY: positionAnim1 }, { scale: scaleAnim }], zIndex: 3 }]}>
        <TouchableOpacity style={styles.button} onPress={onCommentPress}>
          <Ionicons name="chatbubble" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Botón de Votar */}
      <Animated.View style={[styles.option, { transform: [{ translateY: positionAnim2 }, { scale: scaleAnim }], zIndex: 3 }]}>
        <TouchableOpacity style={styles.button} onPress={onVotePress}>
          <Ionicons name="thumbs-up" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Botón Principal */}
      <TouchableOpacity style={[styles.mainButton, { zIndex: 3 }]} onPress={() => onToggle(!isOpen)}>
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
    zIndex: 2,
  },
  option: {
    position: "absolute",
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
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
    elevation: 5,
  },
});

export default FloatingActionButton;
