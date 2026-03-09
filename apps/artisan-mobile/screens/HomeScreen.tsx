import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Pressable,
} from "react-native";

import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import { StatCard } from "../components/StatCard";
import { ArtisanSession } from "../app/session";
import {
  DashboardSummary,
  getApiErrorMessage,
  getArtisanDashboard,
} from "../services/api";

interface HomeScreenProps {
  session: ArtisanSession;
}

function formatCurrency(amount: number): string {
  return `Rs ${amount.toFixed(2)}`;
}

export default function HomeScreen({ session }: HomeScreenProps) {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!session.authToken) {
      setDashboard(null);
      setError("Please log in to continue.");
      setLoading(false);
      return;
    }

    try {
      const data = await getArtisanDashboard(5);
      setDashboard(data);
      session.setArtisanId(data.artisan_id);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard();
  }, [loadDashboard]);

  // Loading state
  if (loading && !dashboard) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.loadingIcon}>
          <Text style={{ fontSize: 48 }}>🎨</Text>
        </View>
        <ActivityIndicator size="large" color="#c75f47" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  // Error state
  if (error && !dashboard) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorIcon}>
          <Text style={{ fontSize: 56 }}>⚠️</Text>
        </View>
        <Text style={styles.errorTitle}>Unable to Load Dashboard</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <PrimaryButton title="Try Again" onPress={loadDashboard} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c75f47" />
      }
      scrollEventThrottle={16}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back! 👋</Text>
          <Text style={styles.title}>Your Dashboard</Text>
        </View>
      </View>

      {dashboard && (
        <>
          {/* Key Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricColumn}>
              <StatCard
                icon="📦"
                label="Products"
                value={String(dashboard.total_products)}
                color="primary"
                style={{ marginBottom: 0 }}
              />
            </View>
            <View style={styles.metricColumn}>
              <StatCard
                icon="🛒"
                label="Orders"
                value={String(dashboard.total_orders)}
                color="accent"
                style={{ marginBottom: 0 }}
              />
            </View>
          </View>

          {/* Total Sales Card */}
          <StatCard
            icon="💰"
            label="Total Sales"
            value={formatCurrency(dashboard.total_sales)}
            subtext="Monthly revenue"
            color="success"
          />

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtonsContainer}>
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionButtonIcon}>+</Text>
                <Text style={styles.actionButtonText}>Upload Product</Text>
              </Pressable>
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionButtonIcon}>🎬</Text>
                <Text style={styles.actionButtonText}>Create Reel</Text>
              </Pressable>
            </View>
          </View>

          {/* Recent Orders Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <Text style={styles.viewAllLink}>View All →</Text>
            </View>

            {dashboard.recent_orders.length === 0 ? (
              <Card variant="filled">
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📭</Text>
                  <Text style={styles.emptyText}>No Orders Yet</Text>
                  <Text style={styles.emptySubtext}>
                    Your orders will appear here as customers purchase
                  </Text>
                </View>
              </Card>
            ) : (
              <View style={styles.ordersList}>
                {dashboard.recent_orders.slice(0, 3).map((order) => (
                  <Card key={order.order_id} variant="elevated">
                    <View style={styles.orderContent}>
                      <View style={styles.orderInfo}>
                        <Text style={styles.orderTitle}>{order.product_title}</Text>
                        <Text style={styles.orderMeta}>
                          Qty: {order.quantity} • {order.status}
                        </Text>
                      </View>
                      <View style={styles.orderRight}>
                        <Text style={styles.orderAmount}>
                          {formatCurrency(order.total_amount)}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </View>

          {/* Stats Summary */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <Card variant="elevated">
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {((dashboard.total_orders / Math.max(dashboard.total_products, 1)) * 100).toFixed(0)}%
                  </Text>
                  <Text style={styles.statLabel}>Conversion Rate</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {dashboard.total_orders > 0
                      ? (dashboard.total_sales / dashboard.total_orders).toFixed(0)
                      : "0"}
                  </Text>
                  <Text style={styles.statLabel}>Avg Order Value</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Card variant="outlined">
              <View style={styles.helpContent}>
                <Text style={styles.helpIcon}>💡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.helpTitle}>Pro Tip</Text>
                  <Text style={styles.helpText}>
                    Add more product photos to increase sales by 45%
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Refresh Button */}
          <View style={styles.actions}>
            <PrimaryButton
              title={refreshing ? "Refreshing..." : "↻ Refresh Dashboard"}
              onPress={loadDashboard}
              loading={refreshing}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fafaf9",
  },
  loadingIcon: {
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  errorMessage: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 28,
    textAlign: "center",
    lineHeight: 22,
  },
  container: {
    padding: 16,
    paddingBottom: 36,
    backgroundColor: "#fafaf9",
  },
  header: {
    marginBottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 14,
    fontWeight: "600",
    color: "#c75f47",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  metricColumn: {
    flex: 1,
  },
  quickActions: {
    marginBottom: 28,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f4f8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.3,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: "600",
    color: "#c75f47",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 28,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  ordersList: {
    gap: 12,
  },
  orderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderInfo: {
    flex: 1,
  },
  orderRight: {
    alignItems: "flex-end",
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  orderMeta: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#c75f47",
  },
  statsSection: {
    marginBottom: 28,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e7eb",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#c75f47",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  helpSection: {
    marginBottom: 28,
  },
  helpContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  helpIcon: {
    fontSize: 32,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  helpText: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
  actions: {
    marginTop: 8,
  },
});

