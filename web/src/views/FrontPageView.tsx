import { Card } from "../components/Card";
import { Lobby } from "../components/Lobby/Lobby";
import { useAuth } from "../auth/useAuth";
import { LandingView } from "./LandingView";

export function FrontPageView() {
  const { user, isLoading } = useAuth();

  return (
    <>
      {!isLoading && user && (
        <Card>
          <Lobby user={user} />
        </Card>
      )}

      {!isLoading && !user && <LandingView />}
    </>
  );
}
