import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { Layout } from '@/components/layout/Layout'
import { KitDndGamePage } from '@/pages/KitDndGamePage/KitDndGamePage'
import { NativeDndGamePage } from '@/pages/NativeDndGamePage/NativeDndGamePage'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Layout>
        <Routes>
          <Route path="/" element={<NativeDndGamePage />} />
          <Route path="/dnd-kit" element={<KitDndGamePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
