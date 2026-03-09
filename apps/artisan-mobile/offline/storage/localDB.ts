import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "craftbridge.artisan.auth_token";
const UPLOAD_QUEUE_KEY = "craftbridge.artisan.upload_queue.v1";

export async function saveAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function readStoredAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

export async function clearStoredAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function readUploadQueue<T>(): Promise<T[]> {
  const serialized = await AsyncStorage.getItem(UPLOAD_QUEUE_KEY);
  if (!serialized) {
    return [];
  }

  try {
    const parsed = JSON.parse(serialized) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveUploadQueue<T>(items: T[]): Promise<void> {
  await AsyncStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(items));
}
