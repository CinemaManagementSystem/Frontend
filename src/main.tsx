import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from '@/app/provider'
import App from './App.tsx'
import { ThemeProvider } from '@/context/ThemeContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Providers>
  </StrictMode>,
)
