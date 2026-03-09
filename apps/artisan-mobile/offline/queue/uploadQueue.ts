import { readUploadQueue, saveUploadQueue } from "../storage/localDB";

export interface QueuedProductUpload {
  title: string;
  description: string;
  price: number;
  category: string;
  image_uri: string;
  image_name?: string;
  image_type?: string;
}

export interface QueuedReelUpload {
  caption?: string;
  product_id?: string | null;
  video_uri: string;
  video_name?: string;
  video_type?: string;
}

export interface QueuedUploadTask {
  id: string;
  task_type: "product" | "reel";
  payload: QueuedProductUpload | QueuedReelUpload;
  created_at: string;
  attempts: number;
  last_error: string | null;
}

function createTaskId(prefix: "product" | "reel"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getQueuedUploads(): Promise<QueuedUploadTask[]> {
  return readUploadQueue<QueuedUploadTask>();
}

export async function enqueueProductUpload(
  payload: QueuedProductUpload,
): Promise<QueuedUploadTask> {
  const queue = await getQueuedUploads();
  const task: QueuedUploadTask = {
    id: createTaskId("product"),
    task_type: "product",
    payload,
    created_at: new Date().toISOString(),
    attempts: 0,
    last_error: null,
  };
  queue.push(task);
  await saveUploadQueue(queue);
  return task;
}

export async function enqueueReelUpload(payload: QueuedReelUpload): Promise<QueuedUploadTask> {
  const queue = await getQueuedUploads();
  const task: QueuedUploadTask = {
    id: createTaskId("reel"),
    task_type: "reel",
    payload,
    created_at: new Date().toISOString(),
    attempts: 0,
    last_error: null,
  };
  queue.push(task);
  await saveUploadQueue(queue);
  return task;
}

export async function removeQueuedUpload(taskId: string): Promise<void> {
  const queue = await getQueuedUploads();
  const updatedQueue = queue.filter((item) => item.id !== taskId);
  await saveUploadQueue(updatedQueue);
}

export async function markUploadFailure(taskId: string, errorMessage: string): Promise<void> {
  const queue = await getQueuedUploads();
  const updatedQueue = queue.map((item) => {
    if (item.id !== taskId) {
      return item;
    }
    return {
      ...item,
      attempts: item.attempts + 1,
      last_error: errorMessage,
    };
  });
  await saveUploadQueue(updatedQueue);
}
