import { Card } from "../components/Card";
import { InputField } from "../components/InputField/InputField";
import { Accordion } from "../components/Accordion";
import { Link } from "../components/Link";

export function SettingsView() {
  return (
    <Card>
      <div className="flex flex-col gap-8">
        <h1 className="font-bold text-xl">Settings</h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-sm">
            <h2 className="font-medium text-lg">CS2 Match Codes</h2>
            <Accordion label="What is this?">
              <div className="flex flex-col gap-4">
                <p>
                  CS2 Match Codes allow us to access your match history, your
                  overall performance in those matches, download replays of your
                  matches, and analyze your gameplay.
                </p>
                <p className="text-primary">
                  <strong>We use them to determine your ELO.</strong>
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

          <InputField
            label="CSGO Share Key *"
            type="password"
            placeholder="CSGO-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx"
          />
          <InputField
            label="CSGO Authentication Code *"
            type="password"
            placeholder="XXXX-XXXXX-XXXX"
          />
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="font-medium text-lg">Match Notification Sound</h2>
        </div>
      </div>
    </Card>
  );
}
