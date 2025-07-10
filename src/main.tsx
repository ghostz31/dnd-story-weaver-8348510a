import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './auth/AuthContext'
import { initializeMonsters, initializeCompleteMonsterDatabase } from './lib/api.ts'

// Initialiser la base de données des monstres
initializeMonsters()
// Initialiser la base de données complète en arrière-plan
initializeCompleteMonsterDatabase().catch(error => {
  console.error("Erreur lors de l'initialisation de la base de données complète:", error)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
