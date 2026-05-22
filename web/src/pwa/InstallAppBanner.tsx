import { useState } from "react";
import { MdClose, MdIosShare } from "react-icons/md";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useInstallApp } from "./useInstallApp";

export function InstallAppBanner() {
  const {
    isIos,
    canPromptInstall,
    shouldShowInstallBanner,
    promptInstall,
    dismissInstallBanner,
  } = useInstallApp();

  const [showIosInstructions, setShowIosInstructions] = useState(false);

  if (!shouldShowInstallBanner) {
    return null;
  }

  async function handleInstallClick() {
    if (canPromptInstall) {
      await promptInstall();
      return;
    }

    if (isIos) {
      setShowIosInstructions(true);
    }
  }

  return (
    <Card className="fixed right-2 top-1/2 -translate-y-1/2 left-2 w-sm z-50 border border-primary/25 bg-background/95 p-4 shadow-xl backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold">Install FLOW</h2>
          <p className="text-sm text-foreground-muted">
            Add FLOW to your home screen to use it like an app and enable mobile
            push notifications.
          </p>
        </div>

        <button
          type="button"
          onClick={dismissInstallBanner}
          className="rounded-full p-1 text-foreground-muted transition hover:bg-white/10 hover:text-foreground"
          aria-label="Dismiss install prompt"
        >
          <MdClose size={20} />
        </button>
      </div>

      {showIosInstructions ? (
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
          <p className="font-bold">Install on iPhone</p>
          <ol className="list-inside list-decimal space-y-1 text-foreground-muted">
            <li>Open FLOW in Safari.</li>
            <li>
              Tap the share button <MdIosShare className="inline" />.
            </li>
            <li>Choose Add to Home Screen.</li>
            <li>Open FLOW from the new Home Screen icon.</li>
            <li>Enable push notifications in Settings.</li>
          </ol>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={handleInstallClick}>
          {isIos ? "Show install steps" : "Install app"}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          color="secondary"
          onClick={dismissInstallBanner}
        >
          Not now
        </Button>
      </div>
    </Card>
  );
}
