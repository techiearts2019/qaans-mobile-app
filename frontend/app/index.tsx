import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { DihadiLogo } from "@/src/components/DihadiLogo";
import { colors } from "@/src/theme/colors";

export default function Splash() {
  const router = useRouter();
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 60,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const t = setTimeout(() => router.replace("/welcome"), 1900);
    return () => clearTimeout(t);
  }, [router, scale, opacity, dot]);

  return (
    <LinearGradient
      colors={[colors.primary, "#1E293B", "#0F172A"]}
      style={styles.container}
      testID="splash-screen"
    >
      <Animated.View
        style={{ transform: [{ scale }], opacity, alignItems: "center" }}
      >
        <DihadiLogo size={108} variant="brand" />
        <Text style={styles.brand}>Dihadi</Text>
        <View style={styles.tagWrap}>
          <Ionicons name="scan-outline" size={14} color={colors.brandSoft} />
          <Text style={styles.tagline}>Face Attendance for Teams</Text>
        </View>
      </Animated.View>

      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: dot.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                transform: [
                  {
                    translateY: dot.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -4 - i * 2],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    color: colors.white,
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 18,
  },
  tagWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  tagline: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  dotsRow: {
    position: "absolute",
    bottom: 72,
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.brand,
  },
});
