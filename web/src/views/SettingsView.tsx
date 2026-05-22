import { Card } from "../components/Card";
import { InputField } from "../components/InputField/InputField";
import { Accordion } from "../components/Accordion";
import { Link } from "../components/Link";
import { Button } from "../components/Button";
import { usePushNotifications } from "../push";
import { toast } from "sonner";

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

            {!isSupported ? (
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
