import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { CharacterPage } from './pages/CharacterPage'
import { SpellsPage } from './pages/SpellsPage'
import { InventoryPage } from './pages/InventoryPage'
import { CombatSheetPage } from './pages/CombatSheetPage'
import { NotesPage } from './pages/NotesPage'
import { DicePage } from './pages/DicePage'
import { SettingsPage } from './pages/SettingsPage'
import { CreateCharacterPage } from './pages/CreateCharacterPage'
import LevelUpPage from './pages/LevelUpPage'
import { CharacterProvider } from './contexts/CharacterContext'
import { ErrorBoundary } from './components/ErrorBoundary'

import { NotFoundPage } from './pages/NotFoundPage'

function App() {
    return (
        <ErrorBoundary>
            <Routes>
                <Route path="/create" element={<CreateCharacterPage />} />
                <Route
                    path="/*"
                    element={
                        <ErrorBoundary>
                            <CharacterProvider>
                                <Routes>
                                    <Route path="/level-up/:characterId" element={<LevelUpPage />} />
                                    <Route path="*" element={
                                        <Layout>
                                            <Routes>
                                                 <Route path="/" element={<HomePage />} />
                                                <Route path="/character/:id" element={<CharacterPage />} />
                                                <Route path="/spells" element={<SpellsPage />} />
                                                <Route path="/inventory" element={<InventoryPage />} />
                                                <Route path="/combat" element={<CombatSheetPage />} />
                                                <Route path="/features" element={<CombatSheetPage />} />
                                                <Route path="/combat-features" element={<CombatSheetPage />} />
                                                <Route path="/notes" element={<NotesPage />} />
                                                <Route path="/dice" element={<DicePage />} />
                                                <Route path="/settings" element={<SettingsPage />} />
                                                <Route path="*" element={<NotFoundPage />} />
                                            </Routes>
                                        </Layout>
                                    } />
                                </Routes>
                            </CharacterProvider>
                        </ErrorBoundary>
                    }
                />
            </Routes>
        </ErrorBoundary>
    )
}

export default App