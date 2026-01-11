import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker, showUpdateAvailableNotification } from "./lib/serviceWorker";

// Register service worker for offline functionality
registerServiceWorker({
  onUpdate: (registration) => {
    showUpdateAvailableNotification(registration);
  },
  onSuccess: () => {
    console.log('App is ready for offline use');
  },
  onError: (error) => {
    console.error('Service worker registration failed:', error);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
