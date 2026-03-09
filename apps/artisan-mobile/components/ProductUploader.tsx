import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

import Card from "./Card";
import FormField from "./FormField";
import PrimaryButton from "./PrimaryButton";
import { QueuedProductUpload } from "../offline/queue/uploadQueue";

interface ProductUploaderProps {
  onSubmit: (payload: QueuedProductUpload) => Promise<void>;
  submitting: boolean;
  statusMessage: string | null;
}

export default function ProductUploader({
  onSubmit,
  submitting,
  statusMessage,
}: ProductUploaderProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("product.jpg");
  const [imageType, setImageType] = useState<string>("image/jpeg");
  const [error, setError] = useState<string | null>(null);

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    setImageUri(asset.uri);
    setImageName(asset.fileName ?? "gallery-image.jpg");
    setImageType(asset.mimeType ?? "image/jpeg");
    setError(null);
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Camera permission is needed to take a product photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    setImageUri(asset.uri);
    setImageName(asset.fileName ?? "camera-image.jpg");
    setImageType(asset.mimeType ?? "image/jpeg");
    setError(null);
  };

  const submit = async () => {
    const parsedPrice = Number(price);
    if (title.trim().length < 2) {
      setError("Title must be at least 2 characters.");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("Price must be a valid number greater than 0.");
      return;
    }
    if (category.trim().length < 2) {
      setError("Category must be at least 2 characters.");
      return;
    }
    if (!imageUri) {
      setError("Add one product photo from camera or gallery.");
      return;
    }

    setError(null);
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      price: parsedPrice,
      category: category.trim(),
      image_uri: imageUri,
      image_name: imageName,
      image_type: imageType,
    });

    setTitle("");
    setDescription("");
    setPrice("");
    setCategory("");
    setImageUri(null);
    setImageName("product.jpg");
    setImageType("image/jpeg");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.heading}>Upload Product</Text>
        <Text style={styles.subheading}>Use clear photos and simple product details.</Text>

        <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Handwoven Basket" />
        <FormField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Short product details"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={styles.multilineInput}
        />
        <FormField
          label="Price"
          value={price}
          onChangeText={setPrice}
          placeholder="499"
          keyboardType="decimal-pad"
        />
        <FormField
          label="Category"
          value={category}
          onChangeText={setCategory}
          placeholder="Home Decor"
        />

        <View style={styles.photoActions}>
          <Pressable onPress={pickFromCamera} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Take Photo</Text>
          </Pressable>
          <Pressable onPress={pickFromGallery} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
          </Pressable>
        </View>

        {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} /> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}

        <PrimaryButton title="Submit Product" onPress={submit} loading={submitting} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E1E1E",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: "#6B5D4C",
    marginBottom: 14,
  },
  multilineInput: {
    minHeight: 96,
    paddingTop: 10,
  },
  photoActions: {
    gap: 8,
    marginBottom: 12,
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C9B9A4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7EFE2",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#7B3F23",
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "#B33A3A",
    fontSize: 14,
    marginBottom: 10,
  },
  statusText: {
    color: "#2A6637",
    fontSize: 14,
    marginBottom: 10,
  },
});
