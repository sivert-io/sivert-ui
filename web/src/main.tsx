import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import { App } from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <main className="bg-background fixed inset-0 text-lavender">
        <App />
      </main>
    </BrowserRouter>
  </StrictMode>,
);
