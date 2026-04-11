import { Card } from "../components/Card";
import { InputField } from "../components/InputField/InputField";
import { Accordion } from "../components/Accordion";
import { Link } from "../components/Link";

export function SettingsView() {
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
