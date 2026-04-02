import { Link, Navigate } from "react-router";
import { useAuth } from "../auth/useAuth";
import { Card } from "../components/Card";
import { InputField } from "../components/InputField/InputField";
import { Accordion } from "../components/Accordion";

export function SettingsView() {
  const { isSignedIn, isLoading } = useAuth();

  if (!isLoading && !isSignedIn) {
    return <Navigate to="/login" replace />;
  }

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
                <p className=" text-rose">
                  <strong>We use them to determine your ELO.</strong>
                </p>
                <Link
                  className="w-fit"
                  target="_blank"
                  to="https://help.steampowered.com/en/wizard/HelpWithGameIssue/?appid=730&issueid=128"
                >
                  Get your codes here
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
      </div>
    </Card>
  );
}
