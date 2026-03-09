import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";

interface UploadButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function UploadButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
  textStyle,
}: UploadButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#ffffff" : "#c75f47"}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text`],
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 56,
    marginVertical: 8,
  },
  primary: {
    backgroundColor: "#c75f47",
  },
  primaryText: {
    color: "#ffffff",
  },
  secondary: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#c75f47",
  },
  secondaryText: {
    color: "#c75f47",
  },
  danger: {
    backgroundColor: "#ef4444",
  },
  dangerText: {
    color: "#ffffff",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
});
