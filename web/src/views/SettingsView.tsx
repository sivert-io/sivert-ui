import { Card } from "../components/Card";
import { InputField } from "../components/InputField/InputField";
import { Accordion } from "../components/Accordion";
import { Link } from "../components/Link";
import { Button } from "../components/Button";
import { usePushNotifications } from "../push";
import { toast } from "sonner";
import { useInstallApp } from "../pwa";

export function SettingsView() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    enablePushNotifications,
    disablePushNotifications,
    sendTestNotification,
  } = usePushNotifications();

  const { isInstalled, isIos, canPromptInstall, promptInstall } =
    useInstallApp();

  const pushStatus = !isSupported
    ? "Unsupported"
    : permission === "denied"
      ? "Blocked"
      : isSubscribed
        ? "Enabled"
        : "Disabled";

  async function handleSendTestNotification() {
    try {
      await sendTestNotification();
      toast("Test notification sent");
    } catch (testError) {
      toast(
        testError instanceof Error
          ? testError.message
          : "Failed to send test notification",
      );
    }
  }

  async function handleInstallApp() {
    try {
      await promptInstall();
    } catch (installError) {
      console.error(installError);
      toast(
        installError instanceof Error
          ? installError.message
          : "Failed to install FLOW",
      );
    }
  }

  return (
    <Card>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <h1 className="text-xl font-bold">Settings</h1>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-sm">
            <h2 className="text-lg font-medium">CS2 Match Codes</h2>
            <Accordion label="What is this?">
              <div className="flex flex-col gap-4">
                <p>
                  CS2 match codes allow FLOW to access your match history and
                  match-related performance data.
                </p>
                <p className="text-primary">
                  <strong>We use them to help calculate your ELO.</strong>
                </p>
                <p>
                  Only provide these if you want to enable the related FLOW
                  features.
                </p>
                <Link
                  target="_blank"
                  rel="noreferrer"
                  to="https://help.steampowered.com/en/wizard/HelpWithGameIssue/?appid=730&issueid=128"
                >
                  <span>Get your codes here</span>
                </Link>
              </div>
            </Accordion>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="CSGO Share Key"
              type="password"
              placeholder="CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx"
            />
            <InputField
              label="CSGO Authentication Code"
              type="password"
              placeholder="XXXX-XXXXX-XXXX"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-black/10 p-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium">Install FLOW</h2>
            <p className="text-sm text-foreground-muted">
              Install FLOW as an app for a better mobile experience and easier
              access to push notifications.
            </p>
          </div>

          {isInstalled ? (
            <p className="text-sm font-medium text-primary">
              FLOW is already installed as an app.
            </p>
          ) : isIos ? (
            <div className="flex flex-col gap-3 text-sm">
              <p className="text-foreground-muted">
                On iPhone, FLOW needs to be added to your Home Screen before
                push notifications can work.
              </p>

              <ol className="list-inside list-decimal space-y-1 text-foreground-muted">
                <li>Open FLOW in Safari.</li>
                <li>Tap the Share button.</li>
                <li>Choose Add to Home Screen.</li>
                <li>Open FLOW from the new Home Screen icon.</li>
                <li>Come back here and enable push notifications.</li>
              </ol>
            </div>
          ) : canPromptInstall ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-foreground-muted">
                Your browser supports installing FLOW as an app.
              </p>

              <div>
                <Button color="primary" onClick={handleInstallApp}>
                  Install app
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground-muted">
              If your browser supports installation, use the install icon in the
              address bar or browser menu.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-black/10 p-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium">Push Notifications</h2>
            <p className="text-sm text-foreground-muted">
              Receive notifications for match found and lobby invites on this
              device.
            </p>
          </div>

          <div className="flex flex-col gap-1 text-sm">
            <p>
              Status:{" "}
              <span className="font-bold text-primary">{pushStatus}</span>
            </p>

            {permission === "denied" ? (
              <p className="text-warning">
                Notifications are blocked in your browser settings. Enable them
                for this site before trying again.
              </p>
            ) : null}

            {!isSupported && isIos ? (
              <p className="text-warning">
                On iPhone, push notifications only work after FLOW has been
                added to your Home Screen and opened from the Home Screen icon.
              </p>
            ) : null}

            {!isSupported && !isIos ? (
              <p className="text-warning">
                This browser does not support web push notifications.
              </p>
            ) : null}

            {error ? <p className="text-danger">{error}</p> : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {isSubscribed ? (
              <Button
                color="danger"
                variant="outline"
                onClick={disablePushNotifications}
                disabled={isLoading}
              >
                {isLoading ? "Disabling..." : "Disable push"}
              </Button>
            ) : (
              <Button
                color="primary"
                onClick={enablePushNotifications}
                disabled={isLoading || !isSupported || permission === "denied"}
              >
                {isLoading ? "Enabling..." : "Enable push"}
              </Button>
            )}

            <Button
              color="secondary"
              variant="outline"
              onClick={handleSendTestNotification}
              disabled={!isSubscribed || permission !== "granted"}
            >
              Test notification
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Match Notification Sound</h2>
          <p className="text-sm text-foreground-muted">
            Configure the sound played when a match is found or an invite is
            received.
          </p>
        </div>
      </div>
    </Card>
  );
}
