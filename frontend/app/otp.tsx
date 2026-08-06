import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/src/components/PrimaryButton";
import { Toast } from "@/src/components/Toast";
import { api, setToken } from "@/src/lib/api";
import { colors, radius } from "@/src/theme/colors";

const LEN = 6;

export default function Otp() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(""));
  const [resendIn, setResendIn] = useState(30);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({ visible: false, message: "", type: "success" });
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const setAt = (i: number, val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[i] = cleaned;
    setDigits(next);
    if (cleaned && i < LEN - 1) inputs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, key: string) => {
    if (key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const code = digits.join("");
  const isComplete = code.length === LEN;

  const verify = async () => {
    if (!isComplete || !email) return;
    setLoading(true);
    try {
      const res = await api.verifyOtp(email, code);
      await setToken(res.access_token);
      router.replace("/(tabs)/dashboard");
    } catch {
      setToast({
        visible: true,
        message: "Invalid or expired OTP. Please try again.",
        type: "error",
      });
      setDigits(Array(LEN).fill(""));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email) return;
    try {
      await api.requestOtp(email);
      setToast({
        visible: true,
        message: "New OTP sent",
        type: "success",
      });
      setDigits(Array(LEN).fill(""));
      setResendIn(30);
      inputs.current[0]?.focus();
    } catch {
      setToast({
        visible: true,
        message: "Could not resend OTP. Try again shortly.",
        type: "error",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        bottomOffset={24}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          testID="otp-back-button"
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.iconWrap}>
          <Ionicons name="mail-open-outline" size={32} color={colors.brand} />
        </View>

        <Text style={styles.title}>Verification code</Text>
        <Text style={styles.subtitle}>
          We&apos;ve sent a {LEN}-digit code to{" "}
          <Text style={{ color: colors.textPrimary, fontWeight: "700" }}>
            {email || "your email"}
          </Text>
        </Text>

        <View style={styles.otpRow}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(r) => {
                inputs.current[i] = r;
              }}
              testID={`otp-input-${i}`}
              value={d}
              onChangeText={(v) => setAt(i, v)}
              onKeyPress={(e) => handleKey(i, e.nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              style={[styles.otpBox, d ? styles.otpBoxFilled : null]}
              selectionColor={colors.brand}
            />
          ))}
        </View>

        <PrimaryButton
          testID="otp-verify-button"
          label="Verify & Continue"
          onPress={verify}
          loading={loading}
          disabled={!isComplete}
          iconRight="arrow-forward"
        />

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn&apos;t get the code?</Text>
          {resendIn > 0 ? (
            <Text style={styles.timer}>Resend in {resendIn}s</Text>
          ) : (
            <Pressable testID="otp-resend-button" onPress={resend}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAwareScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() =>
          setToast({ visible: false, message: "", type: "success" })
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { paddingHorizontal: 24, paddingBottom: 24, flexGrow: 1 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 36,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 22,
    marginBottom: 28,
  },
  otpRow: { flexDirection: "row", gap: 8, marginBottom: 28 },
  otpBox: {
    flex: 1,
    height: 60,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 18,
  },
  resendText: { color: colors.textSecondary, fontSize: 14 },
  timer: { color: colors.textMuted, fontSize: 14, fontWeight: "600" },
  resendLink: { color: colors.brand, fontSize: 14, fontWeight: "700" },
});
