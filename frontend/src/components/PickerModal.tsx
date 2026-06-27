import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radius } from "@/src/theme/colors";

type Props = {
  visible: boolean;
  title: string;
  options: string[];
  value?: string;
  onClose: () => void;
  onSelect: (v: string) => void;
  testIDPrefix?: string;
};

export function PickerModal({
  visible,
  title,
  options,
  value,
  onClose,
  onSelect,
  testIDPrefix = "picker",
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet} testID={`${testIDPrefix}-modal`}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable
            onPress={onClose}
            testID={`${testIDPrefix}-close`}
            hitSlop={12}
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
        <ScrollView style={{ maxHeight: 360 }}>
          {options.map((opt) => {
            const selected = value === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => {
                  onSelect(opt);
                  onClose();
                }}
                testID={`${testIDPrefix}-option-${opt
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                style={({ pressed }) => [
                  styles.row,
                  selected && { backgroundColor: colors.brandSoft },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[
                    styles.rowText,
                    selected && { color: colors.brand, fontWeight: "700" },
                  ]}
                >
                  {opt}
                </Text>
                {selected ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.brand}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
});
