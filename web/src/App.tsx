import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { ChapterPage } from '@/pages/ChapterPage'
import { CharacterListPage } from '@/pages/CharacterListPage'
import { CharacterPage } from '@/pages/CharacterPage'
import { CharacterCreatorPage } from '@/pages/CharacterCreatorPage'
import { LoginPage } from '@/pages/LoginPage'
import { AuthProvider } from '@/lib/authContext'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Standalone pages — no sidebar */}
        <Route path="/" element={<HomePage />} />
        <Route path="personagens" element={<CharacterListPage />} />
        <Route path="ficha/:id" element={<CharacterPage />} />
        <Route path="criar-ficha" element={<CharacterCreatorPage />} />
        <Route path="editar-ficha/:id" element={<CharacterCreatorPage />} />
        <Route path="login" element={<LoginPage />} />
        {/* Book reader — with sidebar */}
        <Route element={<AppShell />}>
          <Route path="capitulo/:slug" element={<ChapterPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
