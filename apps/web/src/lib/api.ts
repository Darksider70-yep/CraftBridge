import axios, { AxiosProgressEvent } from "axios";

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "buyer" | "artisan" | "admin";
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface RegisterInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: "buyer" | "artisan" | "admin";
}

export interface ArtisanProfile {
  id: string;
  user_id: string;
  name: string;
  bio: string | null;
  location: string | null;
  craft_type: string | null;
  profile_image: string | null;
  verified: boolean;
}

export interface ProductImage {
  id: string;
  image_url: string;
}

export interface RelatedReel {
  id: string;
  video_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  likes: number;
  views: number;
}

export interface Product {
  id: string;
  artisan_id: string;
  artisan_name: string | null;
  title: string;
  description: string | null;
  price: number;
  category: string;
  created_at: string;
  images: ProductImage[];
  related_reels: RelatedReel[];
}

export interface Reel {
  id: string;
  artisan_id: string;
  artisan_name: string | null;
  product_id: string | null;
  video_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  likes: number;
  views: number;
  created_at: string;
}

export interface Storefront {
  artisan: ArtisanProfile;
  products: Product[];
  reels: Reel[];
}

export interface CreateOrderInput {
  product_id: string;
  quantity: number;
}

export interface Order {
  id: string;
  buyer_id: string;
  product_id: string;
  quantity: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  created_at: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

export interface UploadProductInput {
  title: string;
  description?: string;
  price: number;
  category: string;
  images: File[];
}

export interface UploadProductOptions {
  token: string;
  onUploadProgress?: (percent: number) => void;
}

export async function getProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>("/products");
  return response.data;
}

export async function getProduct(productId: string): Promise<Product> {
  const response = await api.get<Product>(`/products/${productId}`);
  return response.data;
}

export async function getProductDetails(productId: string): Promise<Product> {
  return getProduct(productId);
}

export async function uploadProduct(
  input: UploadProductInput,
  options: UploadProductOptions,
): Promise<Product> {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("description", input.description ?? "");
  formData.append("price", String(input.price));
  formData.append("category", input.category);
  for (const image of input.images) {
    formData.append("images", image);
  }

  const response = await api.post<Product>("/products", formData, {
    headers: {
      Authorization: `Bearer ${options.token}`,
    },
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (!options.onUploadProgress || !event.total) {
        return;
      }
      const percent = Math.round((event.loaded / event.total) * 100);
      options.onUploadProgress(percent);
    },
  });
  return response.data;
}

export async function getStorefront(artisanId: string): Promise<Storefront> {
  const response = await api.get<Storefront>(`/artisan/${artisanId}/storefront`);
  return response.data;
}

export async function getReelsFeed(limit = 20): Promise<Reel[]> {
  const response = await api.get<Reel[]>("/reels/feed", {
    params: { limit },
  });
  return response.data;
}

export async function likeReel(reelId: string): Promise<Reel> {
  const response = await api.post<Reel>(`/reels/${reelId}/like`);
  return response.data;
}

export async function viewReel(reelId: string): Promise<Reel> {
  const response = await api.post<Reel>(`/reels/${reelId}/view`);
  return response.data;
}

export async function createOrder(
  input: CreateOrderInput,
  token: string,
): Promise<Order> {
  const response = await api.post<Order>("/orders", input, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getArtisans(): Promise<ArtisanProfile[]> {
  const response = await api.get<ArtisanProfile[]>("/artisans");
  return response.data;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", { email, password });
  return response.data;
}

export async function registerUser(input: RegisterInput): Promise<UserProfile> {
  const response = await api.post<UserProfile>("/auth/register", input);
  return response.data;
}

export async function getMe(token: string): Promise<UserProfile> {
  const response = await api.get<UserProfile>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function deleteProduct(productId: string, token: string): Promise<void> {
  await api.delete(`/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function deleteReel(reelId: string, token: string): Promise<void> {
  await api.delete(`/reels/${reelId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
