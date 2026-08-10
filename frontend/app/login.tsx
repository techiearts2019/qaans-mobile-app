import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

import { QaansLogo } from "@/src/components/QaansLogo";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { Toast } from "@/src/components/Toast";
import { api } from "@/src/lib/api";
import { colors, radius } from "@/src/theme/colors";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({ visible: false, message: "", type: "success" });

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const sendOtp = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await api.requestOtp(email.trim().toLowerCase());
      setToast({
        visible: true,
        message: "If eligible, an OTP was sent to your email",
        type: "success",
      });
      setTimeout(
        () =>
          router.push({
            pathname: "/otp",
            params: { email: email.trim().toLowerCase() },
          }),
        450
      );
    } catch (e) {
      const msg = (e as Error).message || "";
      console.warn("[login] request OTP failed:", msg, e);
      setToast({
        visible: true,
        message: msg.includes("429")
          ? "Too many requests. Please try again in a few minutes."
          : "Could not send OTP. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
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
          testID="login-back-button"
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.logoWrap}>
          <QaansLogo size={56} />
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Enter your supervisor email to receive a one-time verification code.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email address</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={colors.textSecondary}
            />
            <TextInput
              testID="login-email-input"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="you@company.com"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>
        </View>

        <PrimaryButton
          testID="login-send-otp-button"
          label="Send OTP"
          onPress={sendOtp}
          loading={loading}
          disabled={!isValid}
          iconRight="arrow-forward"
        />

        <Text style={styles.terms}>
          By continuing you agree to our{" "}
          <Text style={{ color: colors.brand, fontWeight: "600" }}>Terms</Text>{" "}
          &{" "}
          <Text style={{ color: colors.brand, fontWeight: "600" }}>
            Privacy Policy
          </Text>
          .
        </Text>
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
  logoWrap: { marginTop: 36, marginBottom: 24 },
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
  field: { marginBottom: 18 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  inputWrap: {
    height: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },
  input: { flex: 1, fontSize: 16, color: colors.textPrimary },
  terms: {
    textAlign: "center",
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 24,
    lineHeight: 18,
  },
});
