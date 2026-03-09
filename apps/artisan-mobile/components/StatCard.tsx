import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  subtext?: string;
  style?: ViewStyle;
  color?: "primary" | "success" | "accent" | "warning";
}

export function StatCard({ 
  icon, 
  label, 
  value, 
  subtext, 
  style,
  color = "primary" 
}: StatCardProps) {
  const colorMap = {
    primary: "#c75f47",
    success: "#10b981",
    accent: "#1f3447",
    warning: "#f59e0b",
  };

  const accentColor = colorMap[color];

  return (
    <View style={[styles.card, style]}>
      {/* Icon Container with background */}
      <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Value */}
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>

      {/* Subtext */}
      {subtext && <Text style={styles.subtext}>{subtext}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f4f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
  },
  label: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: "500",
  },
});
