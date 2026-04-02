import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { ChapterPage } from '@/pages/ChapterPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="capitulo/:slug" element={<ChapterPage />} />
      </Route>
    </Routes>
  )
}

export default App
