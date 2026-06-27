import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/src/components/PrimaryButton";
import {
  Employee,
  ProjectStatus,
  employees,
  projects as initialProjects,
} from "@/src/data/mockData";
import { colors, radius } from "@/src/theme/colors";

const STATUS_META: Record<ProjectStatus, { bg: string; fg: string }> = {
  Active: { bg: colors.successSoft, fg: colors.success },
  "On Hold": { bg: colors.warningSoft, fg: "#B45309" },
  Completed: { bg: colors.infoSoft, fg: colors.info },
};

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const baseProject = initialProjects.find((p) => p.id === id);

  const [allocatedIds, setAllocatedIds] = useState<string[]>(
    baseProject?.allocatedEmployeeIds ?? []
  );
  const [pickerOpen, setPickerOpen] = useState(false);

  const allocated = useMemo(
    () => employees.filter((e) => allocatedIds.includes(e.id)),
    [allocatedIds]
  );
  const available = useMemo(
    () => employees.filter((e) => !allocatedIds.includes(e.id)),
    [allocatedIds]
  );

  if (!baseProject) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Project not found</Text>
      </SafeAreaView>
    );
  }

  const meta = STATUS_META[baseProject.status];

  const allocate = (empId: string) => {
    setAllocatedIds((prev) => [...prev, empId]);
    setPickerOpen(false);
  };

  const unallocate = (empId: string) => {
    setAllocatedIds((prev) => prev.filter((id) => id !== empId));
  };

  return (
    <View style={styles.container}>
      <View style={styles.heroWrap}>
        <Image source={{ uri: baseProject.cover }} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={["rgba(15,23,42,0.4)", "rgba(15,23,42,0.9)"]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView edges={["top"]} style={styles.heroTopRow}>
          <Pressable
            onPress={() => router.back()}
            style={styles.iconBtn}
            testID="project-detail-back"
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={22} color={colors.white} />
          </Pressable>
          <View style={[styles.heroStatusPill, { backgroundColor: meta.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: meta.fg }]} />
            <Text style={[styles.statusText, { color: meta.fg }]}>
              {baseProject.status}
            </Text>
          </View>
          <Pressable style={styles.iconBtn} testID="project-detail-more">
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={colors.white}
            />
          </Pressable>
        </SafeAreaView>

        <View style={styles.heroBottom}>
          <Text style={styles.heroName}>{baseProject.name}</Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaItem}>
              <Ionicons
                name="location-outline"
                size={14}
                color={colors.brandSoft}
              />
              <Text style={styles.heroMetaText}>{baseProject.location}</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={colors.brandSoft}
              />
              <Text style={styles.heroMetaText}>
                Started {baseProject.startDate}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <StatBox
            label="Allocated"
            value={`${allocated.length}`}
            icon="people"
            color={colors.brand}
            bg={colors.brandSoft}
          />
          <StatBox
            label="Active today"
            value={`${Math.min(allocated.length, 2)}`}
            icon="checkmark-circle"
            color={colors.success}
            bg={colors.successSoft}
          />
          <StatBox
            label="Pending"
            value={`${Math.max(0, allocated.length - 2)}`}
            icon="time"
            color="#B45309"
            bg={colors.warningSoft}
          />
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Allocated Employees</Text>
          <Pressable
            testID="add-allocation-button"
            onPress={() => setPickerOpen(true)}
            style={styles.addAllocBtn}
          >
            <Ionicons name="person-add" size={14} color={colors.brand} />
            <Text style={styles.addAllocText}>Allocate</Text>
          </Pressable>
        </View>

        {allocated.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="people-outline"
              size={36}
              color={colors.textMuted}
            />
            <Text style={styles.emptyTitle}>No employees allocated</Text>
            <Text style={styles.emptySub}>
              Tap “Allocate” to assign team members to this project.
            </Text>
          </View>
        ) : (
          allocated.map((e) => (
            <View key={e.id} style={styles.empRow}>
              <Image source={{ uri: e.photo }} style={styles.empAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.empName}>{e.name}</Text>
                <Text style={styles.empCode}>
                  {e.code} · {e.designation}
                </Text>
              </View>
              <Pressable
                onPress={() => unallocate(e.id)}
                testID={`unallocate-${e.id}`}
                style={styles.unallocBtn}
                hitSlop={6}
              >
                <Ionicons name="close" size={16} color={colors.danger} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setPickerOpen(false)}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>Allocate to {baseProject.name}</Text>
            <Pressable
              onPress={() => setPickerOpen(false)}
              testID="allocate-sheet-close"
              hitSlop={10}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 360 }}>
            {available.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={36}
                  color={colors.success}
                />
                <Text style={styles.emptyTitle}>All employees allocated</Text>
                <Text style={styles.emptySub}>
                  Every team member is already on this project.
                </Text>
              </View>
            ) : (
              available.map((e: Employee) => (
                <Pressable
                  key={e.id}
                  testID={`allocate-option-${e.id}`}
                  onPress={() => allocate(e.id)}
                  style={styles.empRow}
                >
                  <Image source={{ uri: e.photo }} style={styles.empAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.empName}>{e.name}</Text>
                    <Text style={styles.empCode}>
                      {e.code} · {e.designation}
                    </Text>
                  </View>
                  <View style={styles.addPill}>
                    <Ionicons name="add" size={14} color={colors.white} />
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>

          <PrimaryButton
            testID="allocate-sheet-done"
            label="Done"
            onPress={() => setPickerOpen(false)}
            style={{ marginTop: 8 }}
          />
        </View>
      </Modal>
    </View>
  );
}

function StatBox({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.statBox, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heroWrap: {
    height: 260,
    width: "100%",
    overflow: "hidden",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusDot: { width: 6, height: 6, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: "700" },
  heroBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 18,
    paddingHorizontal: 24,
  },
  heroName: {
    color: colors.white,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  heroMetaRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  heroMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  heroMetaText: { color: "#E2E8F0", fontSize: 12, fontWeight: "600" },

  scroll: { padding: 20, paddingBottom: 32 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: -28, marginBottom: 18 },
  statBox: {
    flex: 1,
    borderRadius: radius.lg,
    padding: 14,
    alignItems: "flex-start",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 2,
  },

  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  addAllocBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.brandSoft,
    borderRadius: 999,
  },
  addAllocText: { color: colors.brand, fontWeight: "700", fontSize: 12 },
  title: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },

  empRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  empAvatar: { width: 44, height: 44, borderRadius: 999 },
  empName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  empCode: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  unallocBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  empty: { alignItems: "center", paddingVertical: 40 },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 32,
  },

  backdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)" },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 12,
  },
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  addPill: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
});
