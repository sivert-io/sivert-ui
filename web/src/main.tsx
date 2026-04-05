// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import { App } from "./App.tsx";
import { AuthProvider } from "./auth/AuthProvider";
import { SocketProvider } from "./socket/SocketProvider";
import { NotificationsProvider } from "./notifications/NotificationsProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <NotificationsProvider>
            <div className="fixed inset-0 bg-background text-primary overflow-auto">
              <App />
            </div>
          </NotificationsProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
