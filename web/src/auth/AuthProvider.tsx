import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { AuthContext } from "./AuthContext";
import type { AuthUser, MeResponse } from "./types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data: MeResponse = await response.json();
      setUser(data.authenticated ? data.user : null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(() => {
    window.location.href = `${API_BASE_URL}/auth/steam`;
  }, []);

  const signOut = useCallback(async () => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  const value = useMemo(
    () => ({
      user,
      isSignedIn: Boolean(user),
      isLoading,
      refreshAuth,
      signIn,
      signOut,
    }),
    [user, isLoading, refreshAuth, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
