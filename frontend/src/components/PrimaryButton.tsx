import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { colors, radius } from "@/src/theme/colors";

type Props = {
  label: string;
  onPress: () => void;
  testID?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  iconRight?: keyof typeof Ionicons.glyphMap;
  iconLeft?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  testID,
  loading,
  disabled,
  variant = "primary",
  iconRight,
  iconLeft,
  style,
}: Props) {
  const bg =
    variant === "primary"
      ? colors.primary
      : variant === "secondary"
      ? colors.brandSoft
      : variant === "danger"
      ? colors.danger
      : "transparent";
  const fg =
    variant === "primary"
      ? colors.white
      : variant === "secondary"
      ? colors.brand
      : variant === "danger"
      ? colors.white
      : colors.primary;
  const borderColor =
    variant === "ghost" ? colors.border : "transparent";

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor,
          opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {iconLeft ? (
            <Ionicons
              name={iconLeft}
              size={18}
              color={fg}
              style={{ marginRight: 8 }}
            />
          ) : null}
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
          {iconRight ? (
            <Ionicons
              name={iconRight}
              size={18}
              color={fg}
              style={{ marginLeft: 8 }}
            />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
