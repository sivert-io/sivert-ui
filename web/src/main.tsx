import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import { App } from "./App.tsx";
import { AuthProvider } from "./auth/AuthProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <main className="bg-background fixed inset-0 text-lavender">
          <App />
        </main>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
