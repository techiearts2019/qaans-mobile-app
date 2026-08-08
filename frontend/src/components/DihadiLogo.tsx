import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { radius } from "@/src/theme/colors";

type Props = {
  size?: number;
  variant?: "brand" | "light" | "dark";
};

// Use the project logo asset. Static require so Metro bundles it.
const LOGO_SOURCE = require("@/assets/images/qaans-logo.png");

export function DihadiLogo({ size = 64 }: Props) {
  return (
    <View
      testID="dihadi-logo"
      style={[
        styles.box,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <Image
        source={LOGO_SOURCE}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export const _radius = radius;
