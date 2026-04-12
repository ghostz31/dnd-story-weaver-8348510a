import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { CharacterPage } from './pages/CharacterPage'
import { SpellsPage } from './pages/SpellsPage'
import { InventoryPage } from './pages/InventoryPage'
import { CombatPage } from './pages/CombatPage'
import { NotesPage } from './pages/NotesPage'
import { CreateCharacterPage } from './pages/CreateCharacterPage'
import LevelUpPage from './pages/LevelUpPage'
import { CharacterProvider } from './contexts/CharacterContext'

function App() {
  return (
    <Routes>
      <Route path="/create" element={<CreateCharacterPage />} />
      <Route
        path="/*"
        element={
          <CharacterProvider>
            <Routes>
              {/* Le wizard de montée de niveau est en plein écran (hors Layout) */}
              <Route path="/level-up" element={<LevelUpPage />} />

              {/* Les autres pages utilisent le Layout standard avec BottomNav */}
              <Route path="*" element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/character/:id" element={<CharacterPage />} />
                    <Route path="/spells" element={<SpellsPage />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/combat" element={<CombatPage />} />
                    <Route path="/notes" element={<NotesPage />} />
                  </Routes>
                </Layout>
              } />
            </Routes>
          </CharacterProvider>
        }
      />
    </Routes>
  )
}

export default App
