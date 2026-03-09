import axios, { AxiosError } from "axios";

export interface DashboardOrder {
  order_id: string;
  product_id: string;
  product_title: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface DashboardSummary {
  artisan_id: string;
  artisan_name: string;
  total_products: number;
  total_orders: number;
  total_sales: number;
  recent_orders: DashboardOrder[];
}

export interface TopSellingProduct {
  product_id: string;
  title: string;
  units_sold: number;
  revenue: number;
}

export interface SalesSummary {
  artisan_id: string;
  artisan_name: string;
  total_revenue: number;
  orders_count: number;
  top_selling_product: TopSellingProduct | null;
  recent_orders: DashboardOrder[];
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
  thumbnail_url: string | null;
  caption: string | null;
  likes: number;
  views: number;
  created_at: string;
}

export interface Storefront {
  artisan: {
    id: string;
    user_id: string;
    name: string;
    bio: string | null;
    location: string | null;
    craft_type: string | null;
    profile_image: string | null;
    verified: boolean;
  };
  products: Product[];
  reels: Reel[];
}

export interface UploadProductInput {
  title: string;
  description?: string;
  price: number;
  category: string;
  image_uri: string;
  image_name?: string;
  image_type?: string;
}

export interface UploadReelInput {
  caption?: string;
  product_id?: string | null;
  video_uri: string;
  video_name?: string;
  video_type?: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export function setAuthToken(token: string | null): void {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }
  delete api.defaults.headers.common.Authorization;
}

export async function getArtisanDashboard(recentLimit = 5): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>("/artisan/dashboard", {
    params: { recent_limit: recentLimit },
  });
  return response.data;
}

export async function getArtisanSales(recentLimit = 10): Promise<SalesSummary> {
  const response = await api.get<SalesSummary>("/artisan/sales", {
    params: { recent_limit: recentLimit },
  });
  return response.data;
}

export async function uploadProduct(input: UploadProductInput): Promise<Product> {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("description", input.description ?? "");
  formData.append("price", String(input.price));
  formData.append("category", input.category);
  formData.append(
    "images",
    {
      uri: input.image_uri,
      name: input.image_name ?? "product.jpg",
      type: input.image_type ?? "image/jpeg",
    } as any,
  );

  const response = await api.post<Product>("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function uploadReel(input: UploadReelInput): Promise<Reel> {
  const formData = new FormData();
  if (input.caption) {
    formData.append("caption", input.caption);
  }
  if (input.product_id) {
    formData.append("product_id", input.product_id);
  }
  formData.append(
    "video",
    {
      uri: input.video_uri,
      name: input.video_name ?? "reel.mp4",
      type: input.video_type ?? "video/mp4",
    } as any,
  );

  const response = await api.post<Reel>("/reels/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function getStorefront(artisanId: string): Promise<Storefront> {
  const response = await api.get<Storefront>(`/artisan/${artisanId}/storefront`);
  return response.data;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    if (axiosError.response?.data?.detail) {
      return axiosError.response.data.detail;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
