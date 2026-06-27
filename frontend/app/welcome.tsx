import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DihadiLogo } from "@/src/components/DihadiLogo";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { colors, radius } from "@/src/theme/colors";

const HERO =
  "https://images.unsplash.com/photo-1585854467604-cf2080ccef31?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMGNsZWFuJTIwbW9kZXJuJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3ODI1NTEzODB8MA&ixlib=rb-4.1.0&q=85";

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container} testID="welcome-screen">
      <StatusBar style="light" />
      <View style={styles.hero}>
        <Image source={{ uri: HERO }} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={["rgba(15,23,42,0.35)", "rgba(15,23,42,0.85)"]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={["top"]} style={styles.heroContent}>
          <View style={styles.brandRow}>
            <DihadiLogo size={44} variant="brand" />
            <Text style={styles.brandText}>Dihadi</Text>
          </View>

          <View style={styles.featureRow}>
            <FeaturePill icon="scan-outline" label="Face Match" />
            <FeaturePill icon="time-outline" label="Live Sync" />
            <FeaturePill icon="shield-checkmark-outline" label="Secure" />
          </View>
        </SafeAreaView>
      </View>

      <SafeAreaView edges={["bottom"]} style={styles.bottom}>
        <View style={styles.handle} />
        <Text style={styles.title}>Effortless face{"\n"}attendance.</Text>
        <Text style={styles.subtitle}>
          Mark check-in & check-out instantly with face recognition. Track your
          team, salaries and records — all in one place.
        </Text>

        <View style={styles.bullets}>
          <Bullet text="Smart face detection in seconds" />
          <Bullet text="Manage employees, salary & records" />
          <Bullet text="Built for supervisors on the field" />
        </View>

        <PrimaryButton
          testID="welcome-get-started-button"
          label="Get Started"
          iconRight="arrow-forward"
          onPress={() => router.push("/login")}
        />
        <Text style={styles.footnote}>
          Trusted by supervisors across construction & services
        </Text>
      </SafeAreaView>
    </View>
  );
}

function FeaturePill({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={14} color={colors.white} />
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot}>
        <Ionicons name="checkmark" size={12} color={colors.white} />
      </View>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  hero: {
    height: "48%",
    width: "100%",
    overflow: "hidden",
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 18,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  featureRow: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  bottom: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: -28,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 16,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 10,
    lineHeight: 22,
  },
  bullets: {
    marginTop: 18,
    marginBottom: 22,
    gap: 10,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bulletDot: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  bulletText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  footnote: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 12,
    color: colors.textMuted,
  },
});
