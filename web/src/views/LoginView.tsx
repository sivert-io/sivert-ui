import { Navigate } from "react-router";
import { useAuth } from "../auth/useAuth";
import { Card } from "../components/Card";

export function LoginView() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <Card>
      <h1>You are not signed in... 😅</h1>
    </Card>
  );
}
