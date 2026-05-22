import { createContext } from "react";
import type { BrowserInstallPromptEvent } from "./browser";

export type InstallAppContextValue = {
  isInstalled: boolean;
  isIos: boolean;
  canPromptInstall: boolean;
  shouldShowInstallBanner: boolean;
  deferredPrompt: BrowserInstallPromptEvent | null;
  promptInstall: () => Promise<void>;
  dismissInstallBanner: () => void;
};

export const InstallAppContext = createContext<InstallAppContextValue | null>(
  null,
);
