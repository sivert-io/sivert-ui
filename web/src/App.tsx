import { Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Navbar } from "./components/Navbar";
import { SettingsView } from "./views/SettingsView";
import { ProfileView } from "./views/ProfileView";
import { LoginView } from "./views/LoginView";
import { NotFoundView } from "./views/NotFoundView";
import { FrontPageView } from "./views/FrontPageView";
import { useAuth } from "./auth/useAuth";
import { AboutView } from "./views/AboutView";
import { PrivacyPolicyView } from "./views/PrivacyPolicyView";
import { PageTransition } from "./components/PageTransition";
import { Toaster } from "sonner";
import { useNotifications } from "./notifications/useNotifications";

function RealtimeEffects() {
  useNotifications();
  return null;
}

function AppLayout() {
  return (
    <div className="min-h-screen">
      <Toaster
        toastOptions={{
          classNames: {
            toast: "app-toast",
            title: "app-toast-title",
            description: "app-toast-description",
            closeButton: "app-toast-close",
            actionButton: "app-toast-action",
            cancelButton: "app-toast-cancel",
          },
        }}
      />
      <RealtimeEffects />
      <Navbar isInQueue={false} />
      <main className="w-full overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl px-4 pt-24 pb-12">
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

  if (isLoading) return <AuthLoader />;
  if (!isSignedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function PublicOnlyRoute() {
  const { isSignedIn, isLoading } = useAuth();

  if (isLoading) return <AuthLoader />;
  if (isSignedIn) return <Navigate to="/" replace />;

  return <Outlet />;
}

export function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={
              <PageTransition>
                <FrontPageView />
              </PageTransition>
            }
          />

          <Route element={<PublicOnlyRoute />}>
            <Route
              path="/login"
              element={
                <PageTransition>
                  <LoginView />
                </PageTransition>
              }
            />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route
              path="/settings"
              element={
                <PageTransition>
                  <SettingsView />
                </PageTransition>
              }
            />
            <Route
              path="/profile"
              element={
                <PageTransition>
                  <ProfileView />
                </PageTransition>
              }
            />
          </Route>

          <Route
            path="/privacy"
            element={
              <PageTransition>
                <PrivacyPolicyView />
              </PageTransition>
            }
          />
          <Route
            path="/about"
            element={
              <PageTransition>
                <AboutView />
              </PageTransition>
            }
          />
          <Route
            path="/profile/:steamId"
            element={
              <PageTransition>
                <ProfileView />
              </PageTransition>
            }
          />
          <Route
            path="*"
            element={
              <PageTransition>
                <NotFoundView />
              </PageTransition>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
