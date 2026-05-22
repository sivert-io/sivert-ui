export type BrowserInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export function isStandaloneApp() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari standalone mode
    ("standalone" in window.navigator && window.navigator.standalone === true)
  );
}

export function isIosDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  return /iphone|ipad|ipod/.test(userAgent);
}

export function canUseNativeInstallPrompt() {
  return !isIosDevice();
}

export function getInstallDismissedAt() {
  return localStorage.getItem("flow-install-dismissed-at");
}

export function setInstallDismissedNow() {
  localStorage.setItem("flow-install-dismissed-at", new Date().toISOString());
}

export function shouldShowInstallPromptAgain() {
  const dismissedAt = getInstallDismissedAt();

  if (!dismissedAt) {
    return true;
  }

  const dismissedTime = new Date(dismissedAt).getTime();

  if (Number.isNaN(dismissedTime)) {
    return true;
  }

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  return Date.now() - dismissedTime > sevenDaysMs;
}
