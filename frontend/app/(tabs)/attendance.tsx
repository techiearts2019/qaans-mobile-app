import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/src/components/PrimaryButton";
import { api, Employee } from "@/src/lib/api";
import { colors, radius, shadow } from "@/src/theme/colors";

type Phase = "idle" | "scanning" | "matched";

export default function FaceAttendance() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [phase, setPhase] = useState<Phase>("scanning");
  const [matchedIndex, setMatchedIndex] = useState(0);
  const [action, setAction] = useState<"Check-in" | "Check-out">("Check-in");
  const [isFocused, setIsFocused] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // animations
  const scanLine = useRef(new Animated.Value(0)).current;
  const ringPulse = useRef(new Animated.Value(0)).current;
  const cornerOpacity = useRef(new Animated.Value(0.7)).current;

  // Pause / resume scanning when the screen gains or loses focus
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      setPhase("scanning");
      // Reload employees list on focus (in case new ones were added)
      api
        .listEmployees()
        .then(setEmployees)
        .catch((e) => console.warn("faces load failed", e));
      return () => {
        setIsFocused(false);
        setPhase("idle");
        try {
          Speech.stop();
        } catch {
          // noop
        }
      };
    }, [])
  );

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission, requestPermission]);

  // scan animation loop
  useEffect(() => {
    if (phase !== "scanning") return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(scanLine, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(ringPulse, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cornerOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(cornerOpacity, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [phase, scanLine, ringPulse, cornerOpacity]);

  // simulated face match every 4-5s
  useEffect(() => {
    if (!isFocused) return;
    if (phase !== "scanning") return;
    if (employees.length === 0) return;
    const t = setTimeout(async () => {
      const idx = Math.floor(Math.random() * employees.length);
      const emp = employees[idx];
      const type: "Check-in" | "Check-out" =
        Math.random() > 0.5 ? "Check-in" : "Check-out";
      setMatchedIndex(idx);
      setAction(type);
      setPhase("matched");
      // Persist the mark to the backend (fire-and-forget)
      api
        .markAttendance({
          employee_id: emp.id,
          type,
          status: "On Time",
        })
        .catch((e) => console.warn("mark attendance failed", e));
      try {
        Speech.speak(`${emp.name_hi ?? emp.name} की हाजिरी लग गई है`, {
          language: "hi-IN",
          rate: 0.95,
        });
      } catch {
        // speech may not be supported on some platforms; ignore
      }
    }, 4200);
    return () => clearTimeout(t);
  }, [phase, isFocused, employees]);

  const resumeScan = () => {
    Speech.stop();
    setPhase("scanning");
  };

  if (!permission) {
    return <View style={styles.permWrap} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permWrap}>
        <StatusBar style="light" />
        <View style={styles.permIcon}>
          <Ionicons name="camera-outline" size={40} color={colors.brand} />
        </View>
        <Text style={styles.permTitle}>Camera access needed</Text>
        <Text style={styles.permSub}>
          Dihadi uses your camera to recognise employee faces and mark
          attendance instantly. No data is uploaded.
        </Text>
        <View style={{ width: "100%", gap: 10, marginTop: 24 }}>
          <PrimaryButton
            testID="grant-camera-permission"
            label="Allow Camera"
            onPress={requestPermission}
            iconRight="camera"
          />
          {!permission.canAskAgain ? (
            <PrimaryButton
              testID="open-settings-button"
              label="Open Settings"
              variant="ghost"
              onPress={() => {
                if (typeof window !== "undefined") {
                  // web fallback - no-op
                }
              }}
            />
          ) : null}
          <PrimaryButton
            testID="cancel-camera-button"
            label="Go Back"
            variant="ghost"
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const matched = employees[matchedIndex];

  if (phase === "matched" && !matched) {
    setPhase("scanning");
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {isFocused ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing={facing}
          testID="face-camera-view"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.black }]} />
      )}
      {/* darken overlay */}
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.85)"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <Pressable
          testID="close-attendance-button"
          onPress={() => router.replace("/(tabs)/dashboard")}
          style={styles.iconBtn}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>

        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {phase === "matched" ? "Match found" : "Scanning…"}
          </Text>
        </View>

        <Pressable
          testID="flip-camera-button"
          onPress={() =>
            setFacing((f) => (f === "front" ? "back" : "front"))
          }
          style={styles.iconBtn}
          hitSlop={10}
        >
          <Ionicons name="camera-reverse-outline" size={20} color={colors.white} />
        </Pressable>
      </SafeAreaView>

      {/* Frame */}
      <View style={styles.frameWrap} pointerEvents="none">
        <Animated.View
          style={[
            styles.ring,
            {
              opacity: ringPulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.15, 0.45],
              }),
              transform: [
                {
                  scale: ringPulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1.08],
                  }),
                },
              ],
            },
          ]}
        />
        <View style={styles.frame}>
          {/* Corners */}
          {(["tl", "tr", "bl", "br"] as const).map((pos) => (
            <Animated.View
              key={pos}
              style={[
                styles.corner,
                cornerPos[pos],
                { opacity: cornerOpacity },
              ]}
            />
          ))}

          {phase === "scanning" ? (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [
                    {
                      translateY: scanLine.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 240],
                      }),
                    },
                  ],
                },
              ]}
            />
          ) : null}
        </View>
        <Text style={styles.frameHint}>
          {phase === "scanning"
            ? "Align your face inside the frame"
            : "Face matched successfully"}
        </Text>
      </View>

      {/* Bottom action row */}
      <View style={styles.bottomBar} pointerEvents="box-none">
        <View style={styles.modeRow}>
          {(["Check-in", "Check-out"] as const).map((m) => {
            const active = action === m;
            return (
              <Pressable
                key={m}
                testID={`mode-${m.toLowerCase()}`}
                onPress={() => setAction(m)}
                style={[styles.modeBtn, active && styles.modeBtnActive]}
              >
                <Ionicons
                  name={m === "Check-in" ? "log-in-outline" : "log-out-outline"}
                  size={16}
                  color={active ? colors.white : "#CBD5E1"}
                />
                <Text
                  style={[styles.modeText, active && { color: colors.white }]}
                >
                  {m}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.bottomHint}>
          Auto-detecting faces · {employees.length} employees enrolled
        </Text>
      </View>

      {/* Match modal */}
      <Modal visible={phase === "matched" && !!matched} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.matchCard}>
            <View style={styles.matchTopRow}>
              <View style={styles.badgeGreen}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={colors.success}
                />
                <Text style={styles.badgeGreenText}>Attendance marked</Text>
              </View>
              <Pressable
                onPress={resumeScan}
                hitSlop={10}
                testID="close-match-modal"
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.matchAvatarWrap}>
              <Image
                source={{ uri: matched?.photo ?? undefined }}
                style={styles.matchAvatar}
              />
              <View style={styles.matchTick}>
                <Ionicons name="checkmark" size={18} color={colors.white} />
              </View>
            </View>

            <Text style={styles.matchName}>{matched?.name}</Text>
            <Text style={styles.matchNameHi}>{matched?.name_hi}</Text>

            <View style={styles.matchMeta}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="id-card-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.metaText}>{matched?.code}</Text>
              </View>
              <View style={styles.metaSep} />
              <View style={styles.metaItem}>
                <Ionicons
                  name="briefcase-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.metaText}>{matched?.designation ?? "—"}</Text>
              </View>
            </View>

            <View style={styles.matchActionRow}>
              <View style={styles.actionPill}>
                <Ionicons
                  name={
                    action === "Check-in"
                      ? "log-in-outline"
                      : "log-out-outline"
                  }
                  size={14}
                  color={colors.brand}
                />
                <Text style={styles.actionPillText}>{action}</Text>
              </View>
              <View style={styles.timePill}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.timePillText}>
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.audioHint}>
              <Ionicons
                name="volume-high-outline"
                size={14}
                color={colors.brand}
              />
              <Text style={styles.audioHintText}>
                Announced in Hindi · हाजिरी लग गई है
              </Text>
            </View>

            <PrimaryButton
              testID="continue-scan-button"
              label="Continue Scanning"
              onPress={resumeScan}
              iconRight="scan-outline"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const cornerPos = {
  tl: { top: -1, left: -1, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 18 },
  tr: { top: -1, right: -1, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 18 },
  bl: { bottom: -1, left: -1, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 18 },
  br: { bottom: -1, right: -1, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 18 },
} as const;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  permWrap: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 48,
    alignItems: "center",
  },
  permIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  permTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    marginTop: 18,
  },
  permSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
    zIndex: 5,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.success,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  frameWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.brand,
  },
  frame: {
    width: 260,
    height: 260,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: colors.brand,
  },
  scanLine: {
    position: "absolute",
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: colors.brand,
    shadowColor: colors.brand,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    borderRadius: 2,
  },
  frameHint: {
    color: colors.white,
    fontSize: 14,
    marginTop: 24,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 32,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modeRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  modeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  modeBtnActive: { backgroundColor: colors.brand },
  modeText: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "700",
  },
  bottomHint: {
    color: "#E2E8F0",
    fontSize: 12,
    marginTop: 12,
    fontWeight: "500",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  matchCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: 20,
    ...shadow.strong,
  },
  matchTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgeGreen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeGreenText: { color: colors.success, fontWeight: "700", fontSize: 12 },
  matchAvatarWrap: {
    alignSelf: "center",
    marginTop: 16,
    position: "relative",
  },
  matchAvatar: {
    width: 96,
    height: 96,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: colors.successSoft,
  },
  matchTick: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.white,
  },
  matchName: {
    textAlign: "center",
    marginTop: 14,
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  matchNameHi: {
    textAlign: "center",
    marginTop: 2,
    fontSize: 18,
    color: colors.brand,
    fontWeight: "700",
  },
  matchMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 8,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: colors.textSecondary, fontSize: 12, fontWeight: "500" },
  metaSep: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  matchActionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  actionPillText: { color: colors.brand, fontWeight: "700", fontSize: 13 },
  timePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  timePillText: {
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 13,
  },
  audioHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
    marginBottom: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.brandSoft,
    borderRadius: radius.md,
    alignSelf: "center",
  },
  audioHintText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "600",
  },
});
