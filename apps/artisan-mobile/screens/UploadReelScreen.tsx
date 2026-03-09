import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";
import NetInfo from "@react-native-community/netinfo";

import Card from "../components/Card";
import FormField from "../components/FormField";
import PrimaryButton from "../components/PrimaryButton";
import { ArtisanSession } from "../app/session";
import {
  Product,
  getApiErrorMessage,
  getArtisanDashboard,
  getStorefront,
  setAuthToken,
  uploadReel,
} from "../services/api";
import { QueuedReelUpload, enqueueReelUpload } from "../offline/queue/uploadQueue";

interface UploadReelScreenProps {
  session: ArtisanSession;
}

function ReelPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer({ uri }, (createdPlayer) => {
    createdPlayer.loop = true;
    createdPlayer.play();
  });

  return <VideoView player={player} nativeControls style={styles.video} />;
}

export default function UploadReelScreen({ session }: UploadReelScreenProps) {
  const [caption, setCaption] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoName, setVideoName] = useState("reel.mp4");
  const [videoType, setVideoType] = useState("video/mp4");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      if (!session.authToken) {
        return;
      }
      setAuthToken(session.authToken);
      setLoadingProducts(true);
      try {
        let artisanId = session.artisanId;
        if (!artisanId) {
          const dashboard = await getArtisanDashboard();
          artisanId = dashboard.artisan_id;
          session.setArtisanId(artisanId);
        }
        const storefront = await getStorefront(artisanId);
        setProducts(storefront.products);
      } catch (error) {
        setStatusMessage(getApiErrorMessage(error));
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [session]);

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.75,
    });
    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    setVideoUri(asset.uri);
    setVideoName(asset.fileName ?? "reel.mp4");
    setVideoType(asset.mimeType ?? "video/mp4");
    setUploadedPreviewUrl(null);
    setStatusMessage(null);
  };

  const captureVideo = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setStatusMessage("Camera permission is needed to record reel video.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: 45,
      quality: 0.75,
    });
    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    setVideoUri(asset.uri);
    setVideoName(asset.fileName ?? "captured-reel.mp4");
    setVideoType(asset.mimeType ?? "video/mp4");
    setUploadedPreviewUrl(null);
    setStatusMessage(null);
  };

  const submit = async () => {
    if (!session.authToken) {
      setStatusMessage("Save token on Home tab before uploading.");
      return;
    }
    if (!videoUri) {
      setStatusMessage("Choose or record a video first.");
      return;
    }

    const payload: QueuedReelUpload = {
      caption: caption.trim() || undefined,
      product_id: selectedProductId,
      video_uri: videoUri,
      video_name: videoName,
      video_type: videoType,
    };

    setSubmitting(true);
    setAuthToken(session.authToken);
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        await enqueueReelUpload(payload);
        setStatusMessage("No internet. Reel saved to offline queue.");
        return;
      }

      const reel = await uploadReel(payload);
      setUploadedPreviewUrl(reel.video_url);
      setCaption("");
      setStatusMessage("Reel uploaded successfully.");
    } catch (error) {
      await enqueueReelUpload(payload);
      setStatusMessage(`Saved offline for retry: ${getApiErrorMessage(error)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.title}>Upload Reel</Text>
        <Text style={styles.subtitle}>
          Upload short videos and connect them to one of your products.
        </Text>

        <FormField
          label="Caption"
          value={caption}
          onChangeText={setCaption}
          placeholder="Showing hand carving process"
          maxLength={300}
        />

        <Text style={styles.label}>Link to Product (Optional)</Text>
        {loadingProducts ? (
          <Text style={styles.helperText}>Loading your products...</Text>
        ) : products.length === 0 ? (
          <Text style={styles.helperText}>
            No products found yet. Upload a product first.
          </Text>
        ) : (
          <View style={styles.productList}>
            {products.map((product) => (
              <Pressable
                key={product.id}
                style={[
                  styles.productChip,
                  selectedProductId === product.id && styles.productChipActive,
                ]}
                onPress={() => setSelectedProductId(product.id)}
              >
                <Text
                  style={[
                    styles.productChipText,
                    selectedProductId === product.id && styles.productChipTextActive,
                  ]}
                >
                  {product.title}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.mediaActions}>
          <Pressable onPress={captureVideo} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Record Video</Text>
          </Pressable>
          <Pressable onPress={pickVideo} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
          </Pressable>
        </View>

        {videoUri ? (
          <View style={styles.previewBlock}>
            <Text style={styles.previewLabel}>Selected Preview</Text>
            <ReelPreview uri={videoUri} />
          </View>
        ) : null}

        {uploadedPreviewUrl ? (
          <View style={styles.previewBlock}>
            <Text style={styles.previewLabel}>Uploaded Preview</Text>
            <ReelPreview uri={uploadedPreviewUrl} />
          </View>
        ) : null}

        {statusMessage ? <Text style={styles.status}>{statusMessage}</Text> : null}
        <PrimaryButton title="Submit Reel" onPress={submit} loading={submitting} />
      </Card>
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
    color: "#1E1E1E",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#695846",
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#352B1E",
    marginBottom: 6,
  },
  helperText: {
    fontSize: 13,
    color: "#75614D",
    marginBottom: 10,
  },
  productList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  productChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1C3AF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFDF8",
  },
  productChipActive: {
    backgroundColor: "#9C4F2D",
    borderColor: "#9C4F2D",
  },
  productChipText: {
    fontSize: 13,
    color: "#5A4C3D",
    fontWeight: "600",
  },
  productChipTextActive: {
    color: "#FFFFFF",
  },
  mediaActions: {
    gap: 8,
    marginBottom: 12,
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CABAA6",
    backgroundColor: "#F7EFE2",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7A3E22",
  },
  previewBlock: {
    marginBottom: 10,
  },
  previewLabel: {
    fontSize: 13,
    color: "#7A6A58",
    marginBottom: 4,
  },
  video: {
    width: "100%",
    height: 210,
    borderRadius: 12,
    backgroundColor: "#000000",
  },
  status: {
    color: "#7B3F23",
    fontSize: 14,
    marginBottom: 10,
  },
});
