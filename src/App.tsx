import { BrowserRouter } from 'react-router-dom'

import { AppRoutes } from '@/routes/AppRoutes'
import { ChatWidget } from '@/components/ChatWidget'

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
      <ChatWidget />
    </BrowserRouter>
  )
}

export default App
