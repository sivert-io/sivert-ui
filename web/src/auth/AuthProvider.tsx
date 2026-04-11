import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../lib/api";
import { AuthContext } from "./AuthContext";
import type { AuthUser, MeResponse } from "./types";

const POST_LOGIN_PATH_KEY = "flow.post_login_path";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);

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

  const signIn = useCallback((returnTo?: string) => {
    if (returnTo) {
      sessionStorage.setItem(POST_LOGIN_PATH_KEY, returnTo);
    }

    window.location.href = `${API_BASE_URL}/auth/steam`;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      sessionStorage.removeItem(POST_LOGIN_PATH_KEY);
    }
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
