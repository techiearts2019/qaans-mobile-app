import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PickerModal } from "@/src/components/PickerModal";
import { colors, radius } from "@/src/theme/colors";

type BaseProps = {
  label: string;
  required?: boolean;
  testID?: string;
};

type InputProps = BaseProps & {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

export function TextField({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  autoCapitalize,
  testID,
}: InputProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
      </Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize ?? "sentences"}
        style={[
          styles.input,
          multiline && {
            height: 96,
            textAlignVertical: "top",
            paddingTop: 14,
          },
        ]}
      />
    </View>
  );
}

type DropdownProps = BaseProps & {
  value?: string;
  options: string[];
  onSelect: (v: string) => void;
  placeholder?: string;
};

export function DropdownField({
  label,
  required,
  value,
  options,
  onSelect,
  placeholder = "Select",
  testID,
}: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={{ color: colors.danger }}> *</Text> : null}
      </Text>
      <Pressable
        testID={testID}
        onPress={() => setOpen(true)}
        style={styles.input}
      >
        <Text
          style={[
            styles.dropdownText,
            !value && { color: colors.textMuted },
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={18}
          color={colors.textSecondary}
        />
      </Pressable>

      <PickerModal
        visible={open}
        title={label}
        options={options}
        value={value}
        onSelect={onSelect}
        onClose={() => setOpen(false)}
        testIDPrefix={testID || label.toLowerCase().replace(/\s+/g, "-")}
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
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    fontSize: 15,
    color: colors.textPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
