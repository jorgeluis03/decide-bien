import React, { useState, useRef, useEffect } from "react";
import { View, TouchableOpacity, Animated, StyleSheet, Dimensions, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FloatingActionButtonProps {
  onCommentPress: () => void;
  onVotePress: () => void;
  onToggle?: (isOpen: boolean) => void;
  isOpen?: boolean;
}

const { height } = Dimensions.get("window");

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onCommentPress,
  onVotePress,
  onToggle,
  isOpen: isOpenProp = false,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenProp);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const positionAnim1 = useRef(new Animated.Value(0)).current;
  const positionAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setIsOpen(isOpenProp);
    toggleMenuAnimations(isOpenProp);
  }, [isOpenProp]);

  const toggleMenuAnimations = (shouldOpen: boolean) => {
    const toValue = shouldOpen ? 1 : 0;
    const position1 = shouldOpen ? -80 : 0;
    const position2 = shouldOpen ? -160 : 0;

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

    if (onToggle) {
      onToggle(newIsOpen);
    }
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
    zIndex: 2,
  },
  option: {
    position: "absolute",
    bottom: 0,
    right: 0,
    flexDirection: "row-reverse",
    alignItems: "center",
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