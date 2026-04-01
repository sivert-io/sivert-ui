import { Navigate } from "react-router";
import { useAuth } from "../auth/useAuth";
import { Card } from "../components/Card";
import { InputField } from "../components/InputField/InputField";

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
          <div className="flex flex-col gap-1">
            <h2 className="font-bold text-lg">CS2 Match Codes</h2>
            <p className="text-sm text-rose">
              Allows us to access your match history, your overall performance
              in those matches, download replays of your matches, and analyze
              your gameplay. <br />
              <br />
              <strong>We use this to determine your ELO.</strong>
            </p>
          </div>
          <InputField label="CSGO Share Key *" type="password" />
          <InputField label="CSGO Authentication Code *" type="password" />
        </div>
      </div>
    </Card>
  );
}
