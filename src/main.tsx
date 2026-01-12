import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker, showUpdateAvailableNotification } from "./lib/serviceWorker";

// Register service worker for offline functionality
if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_SW === 'true') {
  registerServiceWorker({
    onUpdate: (registration) => {
      showUpdateAvailableNotification(registration);
    },
    onSuccess: () => {
      if (import.meta.env.DEV) {
        console.log('App is ready for offline use');
      }
    },
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error('Service worker registration failed:', error);
      }
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
