import { Card } from "../components/Card";
import { Lobby } from "../components/Lobby/Lobby";
import { useAuth } from "../auth/useAuth";

export function FrontPageView() {
  const { user } = useAuth();

  return (
    <Card>
      <div className="flex flex-col items-center gap-4">
        {user && <Lobby user={user} />}
      </div>
    </Card>
  );
}
