import axios, { AxiosProgressEvent } from "axios";

export interface UserProfile {
  id: string;
  email: string;
  role: "buyer" | "artisan" | "admin";
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
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
}

export interface Reel {
  id: string;
  artisan_id: string;
  artisan_name: string | null;
  product_id: string | null;
  video_url: string;
  caption: string | null;
  created_at: string;
}

export interface Storefront {
  artisan: ArtisanProfile;
  products: Product[];
  reels: Reel[];
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

export async function getArtisans(): Promise<ArtisanProfile[]> {
  const response = await api.get<ArtisanProfile[]>("/artisans");
  return response.data;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", { email, password });
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
