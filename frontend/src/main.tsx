// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { worker } from "./mocks/browser";

async function prepareApp() {
  // Start MSW in the browser to intercept mocked module endpoints
  try {
    await worker.start({
      onUnhandledRequest: "bypass",
    });
    console.log("[MSW] Mock Service Worker ready to intercept /api/*");
  } catch (err) {
    console.warn("[MSW] Failed to start mock service worker:", err);
  }
}

prepareApp().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
