import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Project,
  ProjectStatus,
  employees,
  projects,
} from "@/src/data/mockData";
import { colors, radius } from "@/src/theme/colors";

const FILTERS: ("All" | ProjectStatus)[] = [
  "All",
  "Active",
  "On Hold",
  "Completed",
];

const STATUS_META: Record<ProjectStatus, { bg: string; fg: string }> = {
  Active: { bg: colors.successSoft, fg: colors.success },
  "On Hold": { bg: colors.warningSoft, fg: "#B45309" },
  Completed: { bg: colors.infoSoft, fg: colors.info },
};

export default function ProjectsList() {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const counts = useMemo(() => {
    return {
      All: projects.length,
      Active: projects.filter((p) => p.status === "Active").length,
      "On Hold": projects.filter((p) => p.status === "On Hold").length,
      Completed: projects.filter((p) => p.status === "Completed").length,
    } as Record<string, number>;
  }, []);

  const list = useMemo(
    () =>
      filter === "All" ? projects : projects.filter((p) => p.status === filter),
    [filter]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          testID="projects-back-button"
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Projects</Text>
          <Text style={styles.subtitle}>
            {projects.length} projects · {counts.Active} active
          </Text>
        </View>
        <Pressable style={styles.addBtn} testID="projects-add-button">
          <Ionicons name="add" size={20} color={colors.white} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <Pressable
              key={f}
              testID={`project-filter-${f.toLowerCase().replace(/\s+/g, "-")}`}
              onPress={() => setFilter(f)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, active && { color: colors.white }]}
              >
                {f}
              </Text>
              <View
                style={[
                  styles.chipCount,
                  active && { backgroundColor: "rgba(255,255,255,0.18)" },
                ]}
              >
                <Text
                  style={[
                    styles.chipCountText,
                    active && { color: colors.white },
                  ]}
                >
                  {counts[f]}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {list.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            onPress={() => router.push(`/projects/${p.id}`)}
          />
        ))}

        {list.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="briefcase-outline"
              size={36}
              color={colors.textMuted}
            />
            <Text style={styles.emptyText}>No projects in this list</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProjectCard({
  project,
  onPress,
}: {
  project: Project;
  onPress: () => void;
}) {
  const meta = STATUS_META[project.status];
  const allocated = project.allocatedEmployeeIds.length;
  const stackEmps = employees.filter((e) =>
    project.allocatedEmployeeIds.includes(e.id)
  );

  return (
    <Pressable
      style={styles.card}
      testID={`project-card-${project.id}`}
      onPress={onPress}
    >
      <View style={styles.cover}>
        <Image source={{ uri: project.cover }} style={StyleSheet.absoluteFill} />
        <View
          style={[
            styles.statusPill,
            { backgroundColor: meta.bg, position: "absolute", top: 12, right: 12 },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: meta.fg }]} />
          <Text style={[styles.statusText, { color: meta.fg }]}>
            {project.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>
          {project.name}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons
            name="location-outline"
            size={13}
            color={colors.textSecondary}
          />
          <Text style={styles.metaText} numberOfLines={1}>
            {project.location}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color={colors.textSecondary}
          />
          <Text style={styles.metaText}>Started {project.startDate}</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.avatarStack}>
            {stackEmps.slice(0, 3).map((e, i) => (
              <Image
                key={e.id}
                source={{ uri: e.photo }}
                style={[
                  styles.stackAvatar,
                  { marginLeft: i === 0 ? 0 : -10 },
                ]}
              />
            ))}
            {allocated === 0 ? (
              <View style={styles.stackEmpty}>
                <Ionicons
                  name="person-outline"
                  size={12}
                  color={colors.textMuted}
                />
              </View>
            ) : null}
          </View>
          <Text style={styles.allocText}>
            {allocated === 0
              ? "No employees allocated"
              : `${allocated} ${allocated === 1 ? "employee" : "employees"} allocated`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  chipRow: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    height: 36,
    flexShrink: 0,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  chipCount: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    minWidth: 22,
    alignItems: "center",
  },
  chipCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  list: { padding: 20, paddingTop: 4, paddingBottom: 40, gap: 14 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 12,
  },
  cover: {
    width: "100%",
    height: 120,
    backgroundColor: colors.surfaceAlt,
    position: "relative",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusDot: { width: 6, height: 6, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: "700" },
  cardBody: { padding: 14 },
  cardName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  avatarStack: { flexDirection: "row", alignItems: "center" },
  stackAvatar: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.white,
  },
  stackEmpty: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  allocText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },

  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 14, color: colors.textMuted, marginTop: 12 },
});
