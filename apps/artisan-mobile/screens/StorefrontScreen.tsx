import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";

import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import { ArtisanSession } from "../app/session";
import {
  Storefront,
  getApiErrorMessage,
  getArtisanDashboard,
  getStorefront,
  setAuthToken,
  deleteProduct,
  deleteReel,
} from "../services/api";

interface StorefrontScreenProps {
  session: ArtisanSession;
}

export default function StorefrontScreen({ session }: StorefrontScreenProps) {
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadStorefront = async () => {
    if (!session.authToken) {
      setMessage("Save token on Home tab to load storefront.");
      return;
    }

    setLoading(true);
    setAuthToken(session.authToken);
    try {
      let artisanId = session.artisanId;
      if (!artisanId) {
        const dashboard = await getArtisanDashboard();
        artisanId = dashboard.artisan_id;
        session.setArtisanId(artisanId);
      }

      const data = await getStorefront(artisanId);
      setStorefront(data);
      setMessage(null);
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productTitle: string) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${productTitle}"?`,
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteProduct(productId);
              setMessage("Product deleted successfully");
              loadStorefront();
            } catch (error) {
              setMessage(getApiErrorMessage(error));
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const handleDeleteReel = async (reelId: string) => {
    Alert.alert(
      "Delete Reel",
      "Are you sure you want to delete this reel?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteReel(reelId);
              setMessage("Reel deleted successfully");
              loadStorefront();
            } catch (error) {
              setMessage(getApiErrorMessage(error));
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  useEffect(() => {
    loadStorefront();
  }, [session.authToken, session.artisanId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.title}>Storefront</Text>
        <Text style={styles.subtitle}>Profile, products, and reels from your artisan page.</Text>
        <PrimaryButton title="Refresh Storefront" onPress={loadStorefront} loading={loading} />
      </Card>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#9C4F2D" />
          <Text style={styles.loadingText}>Loading storefront...</Text>
        </View>
      ) : null}

      {storefront ? (
        <>
          <Card>
            <Text style={styles.profileName}>{storefront.artisan.name}</Text>
            <Text style={styles.profileMeta}>
              {storefront.artisan.craft_type ?? "Craft"} | {storefront.artisan.location ?? "Location"}
            </Text>
            <Text style={styles.profileBio}>{storefront.artisan.bio ?? "No bio yet."}</Text>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Products</Text>
            <View style={styles.productGrid}>
              {storefront.products.length === 0 ? (
                <Text style={styles.mutedText}>No products uploaded yet.</Text>
              ) : (
                storefront.products.map((product) => (
                  <View key={product.id} style={styles.productCard}>
                    {product.images[0] ? (
                      <Image source={{ uri: product.images[0].image_url }} style={styles.productImage} />
                    ) : (
                      <View style={styles.productImageFallback}>
                        <Text style={styles.productImageFallbackText}>No Image</Text>
                      </View>
                    )}
                    <Text style={styles.productTitle} numberOfLines={2}>
                      {product.title}
                    </Text>
                    <Text style={styles.productPrice}>Rs {product.price.toFixed(2)}</Text>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => handleDeleteProduct(product.id, product.title)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Reels</Text>
            {storefront.reels.length === 0 ? (
              <Text style={styles.mutedText}>No reels uploaded yet.</Text>
            ) : (
              storefront.reels.map((reel) => (
                <View key={reel.id} style={styles.reelItem}>
                  {reel.thumbnail_url ? (
                    <Image source={{ uri: reel.thumbnail_url }} style={styles.reelThumb} />
                  ) : (
                    <View style={styles.reelThumbFallback}>
                      <Text style={styles.productImageFallbackText}>No Preview</Text>
                    </View>
                  )}
                  <View style={styles.reelMeta}>
                    <Text style={styles.reelCaption}>{reel.caption ?? "No caption"}</Text>
                    <Text style={styles.reelStats}>
                      Likes {reel.likes} | Views {reel.views}
                    </Text>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => handleDeleteReel(reel.id)}
                    >
                      <Text style={styles.deleteButtonText}>Delete Reel</Text>
                    </Pressable>
                  </View>
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
    color: "#695B4C",
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
    color: "#604E3F",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1D1D1D",
    marginBottom: 4,
  },
  profileMeta: {
    fontSize: 14,
    color: "#624F3E",
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: "#4E4338",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1D1D1D",
    marginBottom: 8,
  },
  mutedText: {
    fontSize: 14,
    color: "#726452",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  productCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#E1D5C6",
    borderRadius: 12,
    backgroundColor: "#FFFDF8",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 110,
  },
  productImageFallback: {
    width: "100%",
    height: 110,
    backgroundColor: "#EFE5D7",
    alignItems: "center",
    justifyContent: "center",
  },
  productImageFallbackText: {
    fontSize: 12,
    color: "#7A6A58",
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C2C2C",
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7B3F23",
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 4,
  },
  reelItem: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#EFE4D5",
    paddingTop: 10,
    marginTop: 10,
  },
  reelThumb: {
    width: 84,
    height: 84,
    borderRadius: 10,
  },
  reelThumbFallback: {
    width: 84,
    height: 84,
    borderRadius: 10,
    backgroundColor: "#EFE5D7",
    alignItems: "center",
    justifyContent: "center",
  },
  reelMeta: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  reelCaption: {
    fontSize: 15,
    color: "#2C2C2C",
    fontWeight: "600",
  },
  reelStats: {
    fontSize: 13,
    color: "#6F5E4D",
    marginTop: 4,
  },
  deleteButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffebee",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ef5350",
  },
  deleteButtonText: {
    color: "#c33b2a",
    fontSize: 12,
    fontWeight: "600",
  },
  message: {
    marginTop: 8,
    color: "#7B3F23",
    fontSize: 14,
  },
});
