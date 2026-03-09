import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import SummaryStatCard from "../components/SummaryStatCard";
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
  const [draftToken, setDraftToken] = useState("");
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!session.authToken) {
      setDashboard(null);
      return;
    }

    setLoading(true);
    try {
      const data = await getArtisanDashboard(5);
      setDashboard(data);
      session.setArtisanId(data.artisan_id);
      setMessage(null);
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const saveToken = async () => {
    const cleaned = draftToken.trim();
    if (!cleaned) {
      setMessage("Paste your artisan access token.");
      return;
    }
    await session.setAuthToken(cleaned);
    setDraftToken("");
    setMessage("Token saved on device.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.title}>Artisan Home</Text>
        <Text style={styles.subtitle}>Track products, orders, and revenue in one place.</Text>

        {!session.authToken ? (
          <>
            <TextInput
              style={styles.tokenInput}
              placeholder="Paste access token"
              value={draftToken}
              onChangeText={setDraftToken}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#8C7A66"
            />
            <PrimaryButton title="Save Token" onPress={saveToken} />
          </>
        ) : (
          <View style={styles.actions}>
            <PrimaryButton title="Refresh Dashboard" onPress={loadDashboard} loading={loading} />
            <PrimaryButton title="Clear Token" onPress={session.clearAuthToken} />
          </View>
        )}
      </Card>

      {loading ? (
        <View style={styles.loaderRow}>
          <ActivityIndicator size="small" color="#9C4F2D" />
          <Text style={styles.loaderText}>Loading dashboard...</Text>
        </View>
      ) : null}

      {dashboard ? (
        <>
          <View style={styles.summaryRow}>
            <SummaryStatCard
              label="Total Products"
              value={String(dashboard.total_products)}
            />
            <SummaryStatCard label="Total Orders" value={String(dashboard.total_orders)} />
          </View>
          <SummaryStatCard label="Total Sales" value={formatCurrency(dashboard.total_sales)} />

          <Card>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            {dashboard.recent_orders.length === 0 ? (
              <Text style={styles.mutedText}>No orders yet.</Text>
            ) : (
              dashboard.recent_orders.map((order) => (
                <View key={order.order_id} style={styles.orderRow}>
                  <View style={styles.orderTextWrap}>
                    <Text style={styles.orderTitle}>{order.product_title}</Text>
                    <Text style={styles.orderMeta}>
                      Qty {order.quantity} | {order.status}
                    </Text>
                  </View>
                  <Text style={styles.orderAmount}>{formatCurrency(order.total_amount)}</Text>
                </View>
              ))
            )}
          </Card>
        </>
      ) : null}

      {message ? <Text style={styles.messageText}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1D1D1D",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#675846",
    marginBottom: 14,
  },
  tokenInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#D4C6B5",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#FFFCF6",
    marginBottom: 10,
  },
  actions: {
    gap: 8,
  },
  loaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  loaderText: {
    color: "#5A4D3F",
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1D1D1D",
    marginBottom: 8,
  },
  mutedText: {
    color: "#6F6354",
    fontSize: 14,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEE3D4",
    paddingTop: 10,
    marginTop: 10,
  },
  orderTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  orderTitle: {
    fontSize: 15,
    color: "#1E1E1E",
    fontWeight: "600",
  },
  orderMeta: {
    fontSize: 13,
    color: "#6D5C4A",
    marginTop: 2,
  },
  orderAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#69341C",
  },
  messageText: {
    marginTop: 8,
    fontSize: 14,
    color: "#7D3F24",
  },
});
