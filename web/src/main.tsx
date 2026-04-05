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
        <div className="fixed inset-0 bg-background text-primary">
          <App />
        </div>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
