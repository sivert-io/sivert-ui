import { Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "./components/Navbar";
import { SettingsView } from "./views/SettingsView";
import { ProfileView } from "./views/ProfileView";
import { LoginView } from "./views/LoginView";
import { NotFoundView } from "./views/NotFoundView";
import { FrontPageView } from "./views/FrontPageView";
import { useAuth } from "./auth/useAuth";
import { AboutView } from "./views/AboutView";
import { PrivacyPolicyView } from "./views/PrivacyPolicyView";

function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar isInQueue={false} />
      <main className="w-full">
        <div className="max-w-7xl w-full mx-auto px-4 pt-24 pb-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function AuthLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className="text-sm text-primary/70"
      >
        Checking sign-in status...
      </motion.div>
    </div>
  );
}

function ProtectedRoute() {
  const { isSignedIn, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoader />;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function PublicOnlyRoute() {
  const { isSignedIn, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoader />;
  }

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<FrontPageView />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginView />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/profile" element={<ProfileView />} />
          </Route>

          <Route path="/privacy" element={<PrivacyPolicyView />} />
          <Route path="/about" element={<AboutView />} />
          <Route path="/profile/:steamId" element={<ProfileView />} />
          <Route path="*" element={<NotFoundView />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
