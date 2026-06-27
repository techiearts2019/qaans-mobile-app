import { View, Text, StyleSheet } from "react-native";

import { colors, radius, shadow } from "@/src/theme/colors";

type Props = {
  size?: number;
  variant?: "brand" | "light" | "dark";
};

export function DihadiLogo({ size = 64, variant = "brand" }: Props) {
  const bg =
    variant === "brand"
      ? colors.brand
      : variant === "light"
      ? colors.white
      : colors.primary;
  const fg =
    variant === "light" ? colors.brand : colors.white;

  return (
    <View
      testID="dihadi-logo"
      style={[
        styles.box,
        {
          width: size,
          height: size,
          backgroundColor: bg,
          borderRadius: size * 0.26,
        },
        shadow.card,
      ]}
    >
      <Text
        style={[
          styles.letter,
          { color: fg, fontSize: size * 0.55, lineHeight: size * 0.62 },
        ]}
      >
        D
      </Text>
      <View
        style={[
          styles.dot,
          {
            backgroundColor: variant === "light" ? colors.brand : colors.white,
            width: size * 0.14,
            height: size * 0.14,
            borderRadius: size * 0.07,
            right: size * 0.16,
            bottom: size * 0.18,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  letter: {
    fontWeight: "800",
    letterSpacing: -1,
  },
  dot: {
    position: "absolute",
  },
});

export const _radius = radius;
