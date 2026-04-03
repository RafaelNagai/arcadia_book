import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { ChapterPage } from '@/pages/ChapterPage'
import { CharacterListPage } from '@/pages/CharacterListPage'
import { CharacterPage } from '@/pages/CharacterPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="capitulo/:slug" element={<ChapterPage />} />
        <Route path="personagens" element={<CharacterListPage />} />
      </Route>
      {/* Character sheets are standalone (no sidebar) for full-screen hero */}
      <Route path="ficha/:id" element={<CharacterPage />} />
    </Routes>
  )
}

export default App
