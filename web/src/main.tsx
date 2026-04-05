import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import { App } from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import { SocketProvider } from "./socket/SocketProvider";
import { NotificationsProvider } from "./notifications/NotificationsProvider";
import { MatchFoundProvider } from "./matchmaking/MatchFoundProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <MatchFoundProvider>
            <NotificationsProvider>
              <div className="min-h-screen bg-background text-primary">
                <App />
              </div>
            </NotificationsProvider>
          </MatchFoundProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
