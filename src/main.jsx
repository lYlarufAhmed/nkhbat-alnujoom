import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)

// Dismiss splash screen — minimum 2s visible, never longer than needed
const MIN_SPLASH_MS = 2000
const elapsed = Date.now() - (window.__splashStart || Date.now())
const remaining = Math.max(MIN_SPLASH_MS - elapsed, 0)

setTimeout(() => {
  const splash = document.getElementById('app-splash')
  if (splash) {
    splash.classList.add('splash-hidden')
    setTimeout(() => splash.remove(), 400)
  }
}, remaining)

// Register service worker for PWA installability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { })
  })
}