import { createContext } from "react";
import type { AuthUser } from "./types";

export type AuthContextValue = {
  user: AuthUser | null;
  isSignedIn: boolean;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
  signIn: (returnTo?: string) => void;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
