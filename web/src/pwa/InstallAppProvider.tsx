import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/useAuth";
import {
  canUseNativeInstallPrompt,
  isIosDevice,
  isStandaloneApp,
  setInstallDismissedNow,
  shouldShowInstallPromptAgain,
  type BrowserInstallPromptEvent,
} from "./browser";
import { InstallAppContext } from "./InstallAppContext";

export function InstallAppProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoading } = useAuth();

  const [deferredPrompt, setDeferredPrompt] =
    useState<BrowserInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(isStandaloneApp());
  const [isDismissed, setIsDismissed] = useState(
    !shouldShowInstallPromptAgain(),
  );

  const isIos = isIosDevice();

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BrowserInstallPromptEvent);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");

    function handleDisplayModeChange() {
      setIsInstalled(isStandaloneApp());
    }

    mediaQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  const canPromptInstall =
    canUseNativeInstallPrompt() && deferredPrompt !== null;

  const shouldShowInstallBanner =
    !isLoading &&
    isSignedIn &&
    !isInstalled &&
    !isDismissed &&
    (canPromptInstall || isIos);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const dismissInstallBanner = useCallback(() => {
    setInstallDismissedNow();
    setIsDismissed(true);
  }, []);

  const value = useMemo(
    () => ({
      isInstalled,
      isIos,
      canPromptInstall,
      shouldShowInstallBanner,
      deferredPrompt,
      promptInstall,
      dismissInstallBanner,
    }),
    [
      isInstalled,
      isIos,
      canPromptInstall,
      shouldShowInstallBanner,
      deferredPrompt,
      promptInstall,
      dismissInstallBanner,
    ],
  );

  return (
    <InstallAppContext.Provider value={value}>
      {children}
    </InstallAppContext.Provider>
  );
}
