import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { AnimatePresence } from "motion/react";
import { Toaster } from "sonner";
import { AuthProvider } from "./auth/AuthProvider";
import { SocketProvider } from "./socket/SocketProvider";
import { NotificationsProvider } from "./notifications/NotificationsProvider";
import { MatchFoundProvider } from "./matchmaking/MatchFoundProvider";
import { LobbyProvider } from "./hooks/useLobby";
import { Navbar } from "./components/Navbar";
import { ScrollToTop } from "./components/ScrollToTop";
import { PageTransition } from "./components/PageTransition";
import { LandingView } from "./views/LandingView";
import { FrontPageView } from "./views/FrontPageView";
import { LoginView } from "./views/LoginView";
import { AboutView } from "./views/AboutView";
import { CreditsView } from "./views/CreditsView";
import { HostView } from "./views/HostView";
import { ServersView } from "./views/ServersView";
import { ServerApplyView } from "./views/ServerApplyView";
import { ServerDetailsView } from "./views/ServerDetailsView";
import { ProfileView } from "./views/ProfileView";
import { SettingsView } from "./views/SettingsView";
import { PrivacyPolicyView } from "./views/PrivacyPolicyView";
import { NotFoundView } from "./views/NotFoundView";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <FrontPageView />
            </PageTransition>
          }
        />
        <Route
          path="/landing"
          element={
            <PageTransition>
              <LandingView />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <LoginView />
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
          path="/credits"
          element={
            <PageTransition>
              <CreditsView />
            </PageTransition>
          }
        />
        <Route
          path="/host"
          element={
            <PageTransition>
              <HostView />
            </PageTransition>
          }
        />
        <Route
          path="/servers"
          element={
            <PageTransition>
              <ServersView />
            </PageTransition>
          }
        />
        <Route
          path="/servers/apply"
          element={
            <PageTransition>
              <ServerApplyView />
            </PageTransition>
          }
        />
        <Route
          path="/servers/:serverId"
          element={
            <PageTransition>
              <ServerDetailsView />
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
          path="/settings"
          element={
            <PageTransition>
              <SettingsView />
            </PageTransition>
          }
        />
        <Route
          path="/privacy"
          element={
            <PageTransition>
              <PrivacyPolicyView />
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
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <NotificationsProvider>
            <MatchFoundProvider>
              <LobbyProvider>
                <div className="min-h-screen bg-background text-primary">
                  <ScrollToTop />
                  <Navbar />

                  <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pt-20 pb-6 md:px-6">
                    <AnimatedRoutes />
                  </main>

                  <Toaster
                    richColors
                    closeButton
                    toastOptions={{
                      className: "app-toast",
                    }}
                  />
                </div>
              </LobbyProvider>
            </MatchFoundProvider>
          </NotificationsProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
