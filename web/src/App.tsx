import { Routes, Route, useLocation } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { ChapterPage } from '@/pages/ChapterPage'
import { CharacterListPage } from '@/pages/CharacterListPage'
import { CharacterPage } from '@/pages/CharacterPage'
import { CharacterCreatorPage } from '@/pages/CharacterCreatorPage'
import { LoginPage } from '@/pages/LoginPage'
import { EsqueciSenhaPage } from '@/pages/EsqueciSenhaPage'
import { RedefinirSenhaPage } from '@/pages/RedefinirSenhaPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { CampaignListPage } from '@/pages/CampaignListPage'
import { CampaignPage } from '@/pages/CampaignPage'
import { NavioListPage } from '@/pages/NavioListPage'
import { ShipPage } from '@/pages/ShipPage'
import { PresetShipPage } from '@/pages/PresetShipPage'
import { CreatureListPage } from '@/pages/CreatureListPage'
import { CreaturePage } from '@/pages/CreaturePage'
import { CustomCreaturePage } from '@/pages/CustomCreaturePage'
import { CustomCreatureFormPage } from '@/pages/CustomCreatureFormPage'
import { AuthProvider } from '@/lib/authContext'
import { Navbar } from '@/components/layout/Navbar'

const NAVBAR_PATHS = ['/personagens', '/navios', '/campanhas', '/criaturas']

function AppRoutes() {
  const location = useLocation()
  const showNavbar = NAVBAR_PATHS.some(p => location.pathname.startsWith(p))

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="personagens" element={<CharacterListPage />} />
        <Route path="navios" element={<NavioListPage />} />
        <Route path="navio/arcadia/:slug" element={<PresetShipPage />} />
        <Route path="navio/:id" element={<ShipPage />} />
        <Route path="campanhas" element={<CampaignListPage />} />
        <Route path="campanha/:id" element={<CampaignPage />} />
        <Route path="ficha/:id" element={<CharacterPage />} />
        <Route path="criar-ficha" element={<CharacterCreatorPage />} />
        <Route path="editar-ficha/:id" element={<CharacterCreatorPage />} />
        <Route path="criaturas" element={<CreatureListPage />} />
        <Route path="criaturas/nova" element={<CustomCreatureFormPage />} />
        <Route path="criaturas/:id/editar" element={<CustomCreatureFormPage />} />
        <Route path="criatura/custom/:id" element={<CustomCreaturePage />} />
        <Route path="criatura/:slug" element={<CreaturePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="esqueci-senha" element={<EsqueciSenhaPage />} />
        <Route path="redefinir-senha" element={<RedefinirSenhaPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
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
