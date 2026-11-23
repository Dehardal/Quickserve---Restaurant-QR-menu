import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { applyBrandTheme } from './utils/theme'

// Immediately initialize custom branding from cached restaurant if present
try {
  const cached = localStorage.getItem('cached_restaurant');
  if (cached) {
    const parsed = JSON.parse(cached);
    if (parsed?.branding) {
      applyBrandTheme(parsed.branding);
    }
  }
} catch (e) {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
