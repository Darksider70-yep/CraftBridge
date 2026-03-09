import NetInfo from "@react-native-community/netinfo";

import {
  QueuedReelUpload,
  QueuedUploadTask,
  removeQueuedUpload,
  getQueuedUploads,
  markUploadFailure,
} from "../queue/uploadQueue";
import { QueuedProductUpload } from "../queue/uploadQueue";
import { getApiErrorMessage, setAuthToken, uploadProduct, uploadReel } from "../../services/api";

let activeSync = false;

async function syncTask(task: QueuedUploadTask, token: string): Promise<void> {
  setAuthToken(token);
  if (task.task_type === "product") {
    await uploadProduct(task.payload as QueuedProductUpload);
    return;
  }

  await uploadReel(task.payload as QueuedReelUpload);
}

export async function flushUploadQueue(token: string): Promise<number> {
  if (activeSync || !token) {
    return 0;
  }

  activeSync = true;
  let completed = 0;

  try {
    const queue = await getQueuedUploads();
    for (const task of queue) {
      try {
        await syncTask(task, token);
        await removeQueuedUpload(task.id);
        completed += 1;
      } catch (error) {
        await markUploadFailure(task.id, getApiErrorMessage(error));
      }
    }
  } finally {
    activeSync = false;
  }

  return completed;
}

export function startUploadQueueSync(
  getToken: () => string | null,
  onSync?: (completed: number) => void,
): () => void {
  const trySync = async () => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      return;
    }

    const token = getToken();
    if (!token) {
      return;
    }

    const completed = await flushUploadQueue(token);
    if (completed > 0) {
      onSync?.(completed);
    }
  };

  trySync();
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (!state.isConnected) {
      return;
    }
    trySync();
  });

  return () => {
    unsubscribe();
  };
}
