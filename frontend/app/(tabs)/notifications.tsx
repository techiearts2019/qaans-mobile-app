import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { notifications as initial } from "@/src/data/mockData";
import { colors, radius } from "@/src/theme/colors";

const TYPE_META: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; bg: string; fg: string }
> = {
  attendance: { icon: "checkmark-done", bg: "#DCFCE7", fg: colors.success },
  employee: { icon: "person-add", bg: "#EFF6FF", fg: colors.brand },
  salary: { icon: "wallet", bg: "#F3E8FF", fg: "#7C3AED" },
  system: { icon: "settings", bg: colors.surfaceAlt, fg: colors.textSecondary },
};

export default function Notifications() {
  const [items, setItems] = useState(initial);

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    setItems((s) => s.map((n) => ({ ...n, read: true })));
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {unread > 0 ? `${unread} new updates` : "You're all caught up"}
          </Text>
        </View>
        <Pressable
          testID="mark-all-read-button"
          onPress={markAllRead}
          style={styles.action}
        >
          <Ionicons
            name="checkmark-done-outline"
            size={16}
            color={colors.brand}
          />
          <Text style={styles.actionText}>Mark all read</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {items.map((n) => {
          const meta = TYPE_META[n.type];
          return (
            <Pressable
              key={n.id}
              testID={`notification-${n.id}`}
              onPress={() =>
                setItems((s) =>
                  s.map((x) => (x.id === n.id ? { ...x, read: true } : x))
                )
              }
              style={[styles.card, !n.read && styles.cardUnread]}
            >
              <View style={[styles.iconBox, { backgroundColor: meta.bg }]}>
                <Ionicons name={meta.icon} size={20} color={meta.fg} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {n.title}
                  </Text>
                  {!n.read ? <View style={styles.dot} /> : null}
                </View>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {n.description}
                </Text>
                <Text style={styles.cardTime}>{n.time}</Text>
              </View>
            </Pressable>
          );
        })}

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="notifications-off-outline"
              size={36}
              color={colors.textMuted}
            />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  actionText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
  },
  scroll: { padding: 20, paddingTop: 8, paddingBottom: 32 },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: radius.xl,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardUnread: {
    backgroundColor: "#F5F9FF",
    borderColor: "#DBEAFE",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.brand,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  cardTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
    fontWeight: "600",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 12,
  },
});
