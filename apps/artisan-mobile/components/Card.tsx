import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8DDCC",
    padding: 14,
    marginBottom: 12,
  },
});
