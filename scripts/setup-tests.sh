#!/bin/bash

# Script d'installation automatique des tests
# Usage: ./scripts/setup-tests.sh

echo "🧪 Configuration des Tests - D&D Story Weaver"
echo "=============================================="

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez installer Node.js d'abord."
    exit 1
fi

echo "📦 Installation des dépendances de test..."

# Installer les dépendances
npm install --save-dev \
    @testing-library/jest-dom@^6.4.2 \
    @testing-library/react@^14.2.1 \
    @testing-library/user-event@^14.5.2 \
    @types/jest@^29.5.12 \
    jest@^29.7.0 \
    jest-environment-jsdom@^29.7.0 \
    ts-jest@^29.1.2 \
    identity-obj-proxy@^3.0.0

# Vérifier si l'installation a réussi
if [ $? -eq 0 ]; then
    echo "✅ Dépendances installées avec succès!"
    
    echo ""
    echo "🚀 Configuration terminée!"
    echo ""
    echo "Vous pouvez maintenant utiliser les commandes suivantes :"
    echo "  npm run test          # Lancer tous les tests"
    echo "  npm run test:watch    # Mode watch"
    echo "  npm run test:coverage # Rapport de couverture"
    echo ""
    echo "📖 Consultez TESTING.md pour plus d'informations."
    
else
    echo "❌ Erreur lors de l'installation des dépendances."
    echo "💡 Essayez de nettoyer le cache npm :"
    echo "   npm cache clean --force"
    echo "   puis relancez ce script."
    exit 1
fi 