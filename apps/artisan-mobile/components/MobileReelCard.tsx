import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

interface MobileReelCardProps {
  id: string;
  caption: string;
  thumbnailUrl?: string;
  views: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export function MobileReelCard({
  id,
  caption,
  thumbnailUrl,
  views,
  onPress,
  style,
}: MobileReelCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, style]}
      activeOpacity={0.7}
    >
      {thumbnailUrl ? (
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.thumbnail}
        />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <Text style={styles.playIcon}>▶️</Text>
        </View>
      )}
      
      <View style={styles.overlay}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>👁️ {views}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.caption} numberOfLines={2}>
          {caption || "Untitled reel"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnail: {
    width: "100%",
    height: 160,
    backgroundColor: "#f3f4f6",
  },
  thumbnailPlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    fontSize: 40,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 12,
  },
  badge: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 12,
  },
  caption: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a1a",
  },
});
