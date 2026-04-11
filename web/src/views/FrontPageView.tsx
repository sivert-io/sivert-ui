import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/Card";
import { Lobby } from "../components/Lobby/Lobby";
import { useAuth } from "../auth/useAuth";
import { LandingView } from "./LandingView";
import { motion } from "motion/react";

const POST_LOGIN_PATH_KEY = "flow.post_login_path";

function AuthLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className="text-sm text-primary/70"
      />
    </div>
  );
}

export function FrontPageView() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const nextPath = sessionStorage.getItem(POST_LOGIN_PATH_KEY);
    if (!nextPath) return;

    sessionStorage.removeItem(POST_LOGIN_PATH_KEY);
    navigate(nextPath, { replace: true });
  }, [user, navigate]);

  if (isLoading) return <AuthLoader />;

  if (user) {
    return (
      <Card>
        <Lobby user={user} />
      </Card>
    );
  }

  return <LandingView />;
}
