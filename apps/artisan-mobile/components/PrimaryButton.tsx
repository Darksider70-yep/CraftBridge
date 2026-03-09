import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={styles.buttonLabel}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#9C4F2D",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    backgroundColor: "#CFAF99",
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
