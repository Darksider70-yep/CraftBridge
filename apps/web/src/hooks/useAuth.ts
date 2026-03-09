"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getMe, login as loginRequest, UserProfile } from "@/lib/api";

const TOKEN_KEY = "craftbridge.jwt";

interface LoginCredentials {
  email: string;
  password: string;
}

interface UseAuthResult {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async (nextToken: string) => {
    const profile = await getMe(nextToken);
    setUser(profile);
  }, []);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    loadUser(storedToken)
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [loadUser]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await loginRequest(credentials.email, credentials.password);
      window.localStorage.setItem(TOKEN_KEY, response.access_token);
      setToken(response.access_token);
      setUser(response.user);
    },
    [],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return;
    }
    await loadUser(token);
  }, [loadUser, token]);

  return useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
      refreshUser,
    }),
    [token, user, isLoading, login, logout, refreshUser],
  );
}
