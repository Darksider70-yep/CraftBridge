export interface ArtisanSession {
  authToken: string | null;
  artisanId: string | null;
  setAuthToken: (token: string) => Promise<void>;
  clearAuthToken: () => Promise<void>;
  setArtisanId: (artisanId: string | null) => void;
}
