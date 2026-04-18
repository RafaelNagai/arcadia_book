import { Routes, Route, useLocation } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { ChapterPage } from '@/pages/ChapterPage'
import { CharacterListPage } from '@/pages/CharacterListPage'
import { CharacterPage } from '@/pages/CharacterPage'
import { CharacterCreatorPage } from '@/pages/CharacterCreatorPage'
import { LoginPage } from '@/pages/LoginPage'
import { CampaignListPage } from '@/pages/CampaignListPage'
import { CampaignPage } from '@/pages/CampaignPage'
import { AuthProvider } from '@/lib/authContext'
import { Navbar } from '@/components/layout/Navbar'

const NAVBAR_PATHS = ['/personagens', '/campanhas']

function AppRoutes() {
  const location = useLocation()
  const showNavbar = NAVBAR_PATHS.some(p => location.pathname.startsWith(p))

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="personagens" element={<CharacterListPage />} />
        <Route path="campanhas" element={<CampaignListPage />} />
        <Route path="campanha/:id" element={<CampaignPage />} />
        <Route path="ficha/:id" element={<CharacterPage />} />
        <Route path="criar-ficha" element={<CharacterCreatorPage />} />
        <Route path="editar-ficha/:id" element={<CharacterCreatorPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route element={<AppShell />}>
          <Route path="capitulo/:slug" element={<ChapterPage />} />
        </Route>
      </Routes>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
