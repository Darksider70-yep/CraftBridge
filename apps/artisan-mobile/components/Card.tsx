import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: "elevated" | "outlined" | "filled";
}

export default function Card({ children, style, variant = "elevated" }: CardProps) {
  return (
    <View style={[styles.card, styles[`card_${variant}`], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  card_elevated: {
    borderWidth: 1,
    borderColor: "#f0f4f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  card_outlined: {
    borderWidth: 1.5,
    borderColor: "#c75f47",
  },
  card_filled: {
    backgroundColor: "#fafaf9",
    borderWidth: 0,
  },
});
