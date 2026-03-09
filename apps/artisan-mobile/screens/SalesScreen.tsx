import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import SummaryStatCard from "../components/SummaryStatCard";
import { ArtisanSession } from "../app/session";
import {
  SalesSummary,
  getApiErrorMessage,
  getArtisanSales,
  setAuthToken,
} from "../services/api";

interface SalesScreenProps {
  session: ArtisanSession;
}

function currencyLabel(amount: number): string {
  return `Rs ${amount.toFixed(2)}`;
}

export default function SalesScreen({ session }: SalesScreenProps) {
  const [sales, setSales] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadSales = async () => {
    if (!session.authToken) {
      setMessage("Save token on Home tab to view sales.");
      return;
    }

    setLoading(true);
    setAuthToken(session.authToken);
    try {
      const response = await getArtisanSales(10);
      setSales(response);
      setMessage(null);
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [session.authToken]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.title}>Sales Analytics</Text>
        <Text style={styles.subtitle}>Monitor revenue and top-performing products.</Text>
        <PrimaryButton title="Refresh Sales Data" onPress={loadSales} loading={loading} />
      </Card>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#9C4F2D" />
          <Text style={styles.loadingText}>Loading sales data...</Text>
        </View>
      ) : null}

      {sales ? (
        <>
          <View style={styles.summaryRow}>
            <SummaryStatCard label="Revenue" value={currencyLabel(sales.total_revenue)} />
            <SummaryStatCard label="Orders" value={String(sales.orders_count)} />
          </View>

          <Card>
            <Text style={styles.sectionTitle}>Top Selling Product</Text>
            {sales.top_selling_product ? (
              <>
                <Text style={styles.topProductName}>{sales.top_selling_product.title}</Text>
                <Text style={styles.topProductMeta}>
                  Units sold: {sales.top_selling_product.units_sold}
                </Text>
                <Text style={styles.topProductMeta}>
                  Revenue: {currencyLabel(sales.top_selling_product.revenue)}
                </Text>
              </>
            ) : (
              <Text style={styles.mutedText}>No orders yet.</Text>
            )}
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            {sales.recent_orders.length === 0 ? (
              <Text style={styles.mutedText}>No recent orders.</Text>
            ) : (
              sales.recent_orders.map((order) => (
                <View key={order.order_id} style={styles.orderItem}>
                  <View style={styles.orderMeta}>
                    <Text style={styles.orderName}>{order.product_title}</Text>
                    <Text style={styles.orderDetail}>
                      Qty {order.quantity} | {order.status}
                    </Text>
                  </View>
                  <Text style={styles.orderAmount}>{currencyLabel(order.total_amount)}</Text>
                </View>
              ))
            )}
          </Card>
        </>
      ) : null}

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1D1D1D",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#665647",
    marginBottom: 10,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#5A4D3F",
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
  topProductName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2B2B2B",
    marginBottom: 6,
  },
  topProductMeta: {
    fontSize: 14,
    color: "#654F3E",
    marginBottom: 3,
  },
  mutedText: {
    fontSize: 14,
    color: "#6E604F",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEE3D4",
    paddingTop: 10,
    marginTop: 10,
  },
  orderMeta: {
    flex: 1,
    marginRight: 10,
  },
  orderName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2B2B2B",
  },
  orderDetail: {
    fontSize: 13,
    color: "#6E5B49",
    marginTop: 2,
  },
  orderAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#7C4023",
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    color: "#7B3F23",
  },
});
