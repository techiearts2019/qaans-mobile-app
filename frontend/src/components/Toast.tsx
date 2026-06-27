import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { colors, radius, shadow } from "@/src/theme/colors";

type Props = {
  visible: boolean;
  message: string;
  type?: "success" | "error" | "info";
  onHide?: () => void;
};

export function Toast({ visible, message, type = "success", onHide }: Props) {
  const translate = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translate, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const t = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translate, {
            toValue: -80,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => onHide && onHide());
      }, 2400);
      return () => clearTimeout(t);
    }
  }, [visible, translate, opacity, onHide]);

  if (!visible) return null;

  const bg =
    type === "success"
      ? colors.success
      : type === "error"
      ? colors.danger
      : colors.brand;
  const icon =
    type === "success"
      ? "checkmark-circle"
      : type === "error"
      ? "alert-circle"
      : "information-circle";

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { transform: [{ translateY: translate }], opacity },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: bg }, shadow.strong]}>
        <Ionicons name={icon as never} size={20} color={colors.white} />
        <Text style={styles.text} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.lg,
    gap: 10,
  },
  text: {
    flex: 1,
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
