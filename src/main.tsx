import { installDevConsoleNoiseFilter } from '@/lib/devConsoleNoiseFilter'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from '@/app/provider'
import App from './App.tsx'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/components/ui/Toast/Toast'
import './index.css'

installDevConsoleNoiseFilter()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <ThemeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </Providers>
  </StrictMode>,
)
