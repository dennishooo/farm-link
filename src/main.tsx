import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@/lib/i18n'
import App from './App'
import { initTheme } from '@/lib/theme'
import { useSessionStore } from '@/stores/session'

initTheme()
// Reclaim an online seat after a reload before anything renders.
useSessionStore.getState().resume()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
