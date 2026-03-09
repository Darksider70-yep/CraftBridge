import { StyleSheet, Text, View } from "react-native";

import Card from "./Card";

interface SummaryStatCardProps {
  label: string;
  value: string;
}

export default function SummaryStatCard({ label, value }: SummaryStatCardProps) {
  return (
    <Card style={styles.card}>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 94,
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    color: "#685948",
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E1E1E",
  },
});
