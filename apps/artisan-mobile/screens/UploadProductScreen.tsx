import { useState } from "react";
import NetInfo from "@react-native-community/netinfo";

import ProductUploader from "../components/ProductUploader";
import { ArtisanSession } from "../app/session";
import {
  getApiErrorMessage,
  setAuthToken,
  uploadProduct,
} from "../services/api";
import {
  QueuedProductUpload,
  enqueueProductUpload,
} from "../offline/queue/uploadQueue";

interface UploadProductScreenProps {
  session: ArtisanSession;
}

export default function UploadProductScreen({ session }: UploadProductScreenProps) {
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (payload: QueuedProductUpload) => {
    if (!session.authToken) {
      setStatusMessage("Save token on Home tab before uploading.");
      return;
    }

    setSubmitting(true);
    setAuthToken(session.authToken);

    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        await enqueueProductUpload(payload);
        setStatusMessage("No internet. Product saved to offline queue.");
        return;
      }

      await uploadProduct(payload);
      setStatusMessage("Product uploaded successfully.");
    } catch (error) {
      await enqueueProductUpload(payload);
      setStatusMessage(`Saved offline for retry: ${getApiErrorMessage(error)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProductUploader
      onSubmit={handleSubmit}
      submitting={submitting}
      statusMessage={statusMessage}
    />
  );
}
