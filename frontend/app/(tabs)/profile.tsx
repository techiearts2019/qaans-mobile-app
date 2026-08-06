import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/src/components/PrimaryButton";
import { api, clearToken, Employee, Supervisor } from "@/src/lib/api";
import { colors, radius, shadow } from "@/src/theme/colors";

const MENU: {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  fg: string;
  path?: string;
}[] = [
  {
    key: "edit",
    title: "Edit Profile",
    icon: "person-circle-outline",
    bg: "#EFF6FF",
    fg: colors.brand,
  },
  {
    key: "team",
    title: "My Team",
    icon: "people-outline",
    bg: "#DCFCE7",
    fg: colors.success,
    path: "/employees",
  },
  {
    key: "salary",
    title: "Salary Records",
    icon: "wallet-outline",
    bg: "#F3E8FF",
    fg: "#7C3AED",
    path: "/salary-records",
  },
  {
    key: "settings",
    title: "App Settings",
    icon: "settings-outline",
    bg: colors.surfaceAlt,
    fg: colors.textSecondary,
  },
  {
    key: "help",
    title: "Help & Support",
    icon: "help-circle-outline",
    bg: "#FEF3C7",
    fg: "#B45309",
  },
];

export default function Profile() {
  const router = useRouter();
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [sup, emps] = await Promise.all([
        api.supervisor(),
        api.listEmployees(),
      ]);
      setSupervisor(sup);
      setEmployees(emps);
    } catch (e) {
      console.warn("profile load failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const activeCount = employees.filter((e) => e.status === "Active").length;

  if (loading || !supervisor) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="profile-screen">
      <LinearGradient
        colors={[colors.primary, "#1E293B"]}
        style={styles.headerBg}
      />
      <SafeAreaView edges={["top"]} style={{ paddingHorizontal: 20 }}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable
            style={styles.settingsBtn}
            testID="profile-settings-button"
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={18}
              color={colors.white}
            />
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.userCard, shadow.card]}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: supervisor.photo ?? undefined }}
                style={styles.avatar}
              />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color={colors.white} />
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.userName}>{supervisor.name}</Text>
              <Text style={styles.userRole}>{supervisor.designation}</Text>
              <View style={styles.codeBadge}>
                <Ionicons name="id-card" size={12} color={colors.brand} />
                <Text style={styles.codeBadgeText}>{supervisor.code}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <Stat label="Employees" value={`${employees.length}`} />
            <View style={styles.statDivider} />
            <Stat label="Active" value={`${activeCount}`} />
            <View style={styles.statDivider} />
            <Stat label="Joined" value="Jan 22" />
          </View>

          <View style={styles.contactRow}>
            <Ionicons
              name="mail-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={styles.contactText}>{supervisor.email}</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons
              name="call-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={styles.contactText}>{supervisor.phone}</Text>
          </View>

          <PrimaryButton
            testID="edit-profile-button"
            label="Edit Profile"
            variant="secondary"
            iconLeft="create-outline"
            onPress={() => {}}
            style={{ marginTop: 16, height: 46 }}
          />
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.menu}>
          {MENU.map((m, i) => (
            <Pressable
              key={m.key}
              testID={`profile-menu-${m.key}`}
              onPress={() => m.path && router.push(m.path as never)}
              style={[
                styles.menuRow,
                i < MENU.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={[styles.menuIcon, { backgroundColor: m.bg }]}>
                <Ionicons name={m.icon} size={18} color={m.fg} />
              </View>
              <Text style={styles.menuText}>{m.title}</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          ))}
        </View>

        <Pressable
          testID="logout-button"
          style={styles.logoutBtn}
          onPress={async () => {
            await clearToken();
            router.replace("/login");
          }}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <Text style={styles.version}>Dihadi · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { padding: 20, paddingTop: 24, paddingBottom: 32 },
  userCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.white,
  },
  verifiedBadge: {
    position: "absolute",
    right: -2,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  userRole: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  codeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.brandSoft,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  codeBadgeText: {
    fontSize: 11,
    color: colors.brand,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 18,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 12,
    borderRadius: radius.lg,
  },
  statDivider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: "600",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  contactText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 4,
  },
  menu: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  logoutBtn: {
    marginTop: 16,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.dangerSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: { color: colors.danger, fontWeight: "700", fontSize: 15 },
  version: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 12,
    color: colors.textMuted,
  },
});
