import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radius } from "@/src/theme/colors";

type Props = {
  label: string;
  required?: boolean;
  value?: string; // formatted dd MMM yyyy
  onChange: (v: string) => void;
  testID?: string;
  placeholder?: string;
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function DatePickerField({
  label,
  required,
  value,
  onChange,
  testID,
  placeholder = "Select date",
}: Props) {
  const [open, setOpen] = useState(false);
  const now = new Date();

  const initial = useMemo(() => {
    if (!value) {
      return {
        day: now.getDate(),
        month: now.getMonth(),
        year: now.getFullYear(),
      };
    }
    const parts = value.split(" ");
    const d = parseInt(parts[0], 10) || now.getDate();
    const m = Math.max(0, MONTHS.indexOf(parts[1] || ""));
    const y = parseInt(parts[2], 10) || now.getFullYear();
    return { day: d, month: m, year: y };
  }, [value]);

  const [day, setDay] = useState(initial.day);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);

  const days = useMemo(
    () =>
      Array.from(
        { length: new Date(year, month + 1, 0).getDate() },
        (_, i) => i + 1
      ),
    [year, month]
  );
  const years = useMemo(
    () => Array.from({ length: 80 }, (_, i) => now.getFullYear() - 60 + i),
    [now]
  );

  const confirm = () => {
    onChange(`${pad(day)} ${MONTHS[month]} ${year}`);
    setOpen(false);
  };

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
      </Text>
      <Pressable
        testID={testID}
        onPress={() => setOpen(true)}
        style={styles.field}
      >
        <Text style={[styles.value, !value && { color: colors.textMuted }]}>
          {value || placeholder}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Select date</Text>

          <View style={styles.wheels}>
            <Wheel
              data={days}
              selected={day}
              onSelect={setDay}
              format={(v) => pad(v)}
            />
            <Wheel
              data={MONTHS.map((_, i) => i)}
              selected={month}
              onSelect={setMonth}
              format={(v) => MONTHS[v]}
            />
            <Wheel
              data={years}
              selected={year}
              onSelect={setYear}
              format={(v) => `${v}`}
            />
          </View>

          <Pressable
            testID={`${testID}-confirm`}
            onPress={confirm}
            style={styles.confirmBtn}
          >
            <Text style={styles.confirmText}>Done</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function Wheel({
  data,
  selected,
  onSelect,
  format,
}: {
  data: number[];
  selected: number;
  onSelect: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <View style={styles.wheel}>
      <FlatList
        data={data}
        keyExtractor={(item) => `${item}`}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSel = item === selected;
          return (
            <Pressable
              onPress={() => onSelect(item)}
              style={[
                styles.wheelItem,
                isSel && { backgroundColor: colors.brandSoft },
              ]}
            >
              <Text
                style={[
                  styles.wheelText,
                  isSel && { color: colors.brand, fontWeight: "700" },
                ]}
              >
                {format(item)}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 6,
  },
  field: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: 20,
    paddingBottom: 32,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  wheels: {
    flexDirection: "row",
    height: 220,
    gap: 12,
  },
  wheel: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  wheelItem: {
    paddingVertical: 12,
    alignItems: "center",
  },
  wheelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  confirmBtn: {
    marginTop: 20,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
});
