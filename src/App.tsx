import { Routes, Route, Navigate } from 'react-router-dom'
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
                    path="/level-up/:characterId"
                    element={
                        <CharacterProvider>
                            <LevelUpPage />
                        </CharacterProvider>
                    }
                />
                <Route
                    element={
                        <CharacterProvider>
                            <Layout />
                        </CharacterProvider>
                    }
                >
                    <Route index element={<HomePage />} />
                    <Route path="/character/:id" element={<CharacterPage />} />
                    <Route path="/spells" element={<SpellsPage />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/combat" element={<CombatSheetPage />} />
                    <Route path="/features" element={<Navigate to="/combat" replace />} />
                    <Route path="/combat-features" element={<Navigate to="/combat" replace />} />
                    <Route path="/notes" element={<NotesPage />} />
                    <Route path="/dice" element={<DicePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </ErrorBoundary>
    )
}

export default App
