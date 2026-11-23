import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/theme.css'
import App from './ui/App.tsx'
import { applySettings, loadSettings } from './ui/settings'

applySettings(loadSettings())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
