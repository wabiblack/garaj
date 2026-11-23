import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/theme.css'
import App from './ui/App.tsx'
import { applySettings, loadSettings } from './ui/settings'

applySettings(loadSettings())

// Android'de ana ekrandan açılınca yönü dikeye kilitler (manifest de portrait). Desteklemeyen tarayıcı sessizce geçer.
try {
  const o = screen.orientation as ScreenOrientation & { lock?(o: string): Promise<void> }
  o.lock?.('portrait').catch(() => {})
} catch {
  // yön kilidi yok
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
