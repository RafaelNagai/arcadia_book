import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { ChapterPage } from '@/pages/ChapterPage'
import { CharacterListPage } from '@/pages/CharacterListPage'
import { CharacterPage } from '@/pages/CharacterPage'
import { CharacterCreatorPage } from '@/pages/CharacterCreatorPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="capitulo/:slug" element={<ChapterPage />} />
        <Route path="personagens" element={<CharacterListPage />} />
      </Route>
      {/* Character sheets and creator are standalone (no sidebar) for full-screen experience */}
      <Route path="ficha/:id" element={<CharacterPage />} />
      <Route path="criar-ficha" element={<CharacterCreatorPage />} />
      <Route path="editar-ficha/:id" element={<CharacterCreatorPage />} />
    </Routes>
  )
}

export default App
