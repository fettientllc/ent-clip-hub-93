
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Capture unhandled promise rejections for debugging
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});

// Initialize app
console.log('Initializing application...');
createRoot(document.getElementById("root")!).render(<App />);
