import { Card } from "../components/Card";
import { Lobby } from "../components/Lobby/Lobby";
import { useAuth } from "../auth/useAuth";
import { LandingView } from "./LandingView";
import { motion } from "motion/react";

function AuthLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className="text-sm text-primary/70"
      ></motion.div>
    </div>
  );
}

export function FrontPageView() {
  const { user, isLoading } = useAuth();

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
