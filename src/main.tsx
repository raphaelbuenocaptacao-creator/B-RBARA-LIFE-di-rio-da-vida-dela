import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import './profile.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const isSecureContext = location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname)
    if (!isSecureContext) return

    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js?v=barbara-life-shell-v3`, {
      scope: import.meta.env.BASE_URL,
      updateViaCache: 'none',
    }).then((registration) => registration.update()).catch(() => {
      // PWA registration failure should never block access to the app.
    })
  })
}
