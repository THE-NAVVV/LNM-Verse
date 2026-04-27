import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// --- YE CODE ADD KARO (Cache Killer) ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister(); // Purane workers ko hatao
      }
    });
    // Cache Storage bhi clear karne ki koshish karein
    if(caches) {
        caches.keys().then(names => {
            for (let name of names) caches.delete(name);
        });
    }
  });
}
// ---------------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)