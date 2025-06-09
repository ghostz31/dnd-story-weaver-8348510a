# D&D Story Weaver

Outil de gestion pour les maîtres de jeu Donjons & Dragons 5e.

## Fonctionnalités

- **Générateur de rencontres personnalisées**
  - Filtrage des monstres par type, taille, environnement et niveau de défi
  - Calcul d'équilibrage des rencontres pour les joueurs
  - Base de données complète des monstres (AideDD)

- **Tracker de combat**
  - Suivi des tours et des rounds
  - Gestion des points de vie et des conditions
  - Configuration des initiatives avant le combat
  - Ajout de personnages joueurs

- **Historique des rencontres**
  - Sauvegarde des rencontres générées
  - Possibilité de recharger des rencontres précédentes
  - Lancement direct dans le tracker de combat

## Installation

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Construire pour la production
npm run build
```

## Utilisation

1. **Créer une rencontre personnalisée**
   - Naviguez vers l'onglet "Personnalisé"
   - Filtrez les monstres selon vos critères
   - Ajoutez des monstres à votre rencontre
   - Générez la rencontre pour voir son niveau de difficulté

2. **Sauvegarder une rencontre**
   - Une fois la rencontre générée, cliquez sur "Sauvegarder"
   - La rencontre sera ajoutée à votre historique

3. **Lancer une rencontre**
   - Depuis la page de rencontre personnalisée, cliquez sur "Lancer la rencontre"
   - Configurez les initiatives pour chaque participant
   - Cliquez sur "Commencer la rencontre" pour ouvrir le tracker

4. **Consulter l'historique**
   - Naviguez vers l'onglet "Historique"
   - Visualisez vos rencontres sauvegardées
   - Relancez directement une rencontre précédente

## Technologies

- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Vite

## Project info

**URL**: https://lovable.dev/projects/2f63c2d7-0357-4453-bffe-97cf793172fd

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2f63c2d7-0357-4453-bffe-97cf793172fd) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/2f63c2d7-0357-4453-bffe-97cf793172fd) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
