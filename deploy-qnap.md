# Deployer D&D Story Weaver sur QNAP NAS (Via Container Station)

Ce guide vous explique comment déployer l'application sur votre NAS QNAP TS-453D-4G en utilisant **Container Station**.

## Prérequis
- **Container Station** installé et activé sur le NAS.
- Accès SSH au NAS (optionnel mais pratique) ou accès à l'interface de gestion de fichiers.

## Méthode 1: Création de l'application via l'interface Container Station (Recommandé)

Cette méthode utilise le fichier `docker-compose.yml` que nous avons créé.

1.  **Préparer les fichiers** :
    - **Où le mettre ?** : Le mieux est d'utiliser le dossier partagé par défaut de Container Station.
    - **Accès depuis Windows** : Ouvrez votre explorateur de fichiers et tapez `\\192.168.1.137\Container` (ou juste `\\192.168.1.137` pour voir tous les dossiers).
    - Créez-y un dossier nommé `dnd-story-weaver`.
    - Copiez **tous** les fichiers de votre projet (y compris `docker-compose.yml`, `Dockerfile`, `src`, etc.) à l'intérieur de ce dossier `\\192.168.1.137\Container\dnd-story-weaver`.
    
    - *Alternativement* : Vous pouvez construire l'image sur votre PC et l'envoyer au NAS, mais le plus simple est de laisser le NAS construire l'image (cela peut prendre du temps sur un Celeron).

    **Option plus rapide (Build Local)** :
    Si le build est trop lent sur le NAS :
    1.  Sur votre PC Windows : `docker build -t dnd-story-weaver:latest .`
    2.  Sauvegardez l'image : `docker save -o dnd-story-weaver.tar dnd-story-weaver:latest`
    3.  Copiez `dnd-story-weaver.tar` sur le NAS.
    4.  Dans Container Station > Images > Import, importez le fichier `.tar`.

2.  **Créer l'application** :
    - Ouvrez **Container Station**.
    - Allez dans **Applications** (ou "Create Application" selon la version).
    - Cliquez sur **Create**.
    - Nom : `dnd-story-weaver`
    - YAML : Copiez le contenu du fichier `docker-compose.yml` du projet :
      ```yaml
      version: '3.8'
      services:
        dnd-story-weaver:
          image: dnd-story-weaver:latest
          container_name: dnd-story-weaver
          restart: unless-stopped
          build: .
          environment:
            - PORT=8080
            - NODE_ENV=production
          ports:
            - "3000:8080"
      ```
    - Cliquez sur **Create**.

    > ⚠️ **ATTENTION** : Avec cette méthode "copier-coller", Container Station crée parfois un dossier vide interne et ne trouve pas vos fichiers (erreur `Dockerfile not found`).
    > **Solution recommandée :** Utilisez la **Méthode 2 (SSH)** ci-dessous, ou la **Méthode 3 (Image Locale)**.

## Méthode 2: Ligne de commande (SSH) - **La plus fiable**

C'est la méthode qui évite l'erreur "Dockerfile not found".

1.  **Activez SSH** sur le NAS (Panneau de configuration > Réseau > Telnet/SSH).
2.  Ouvrez un terminal sur votre PC (PowerShell ou CMD).
3.  Tapez : `ssh admin@192.168.1.137` (entrez votre mot de passe).
4.  Allez dans le dossier où vous avez copié les fichiers :
    ```bash
    cd /share/Container/Trame
    ```
    *(Astuce : tapez `cd /share/Cont` puis appuyez sur Tab pour compléter)*
5.  Lancez le build et le démarrage :
    ```bash
    docker-compose up -d --build
    ```
    *Note : Si vous avez une erreur "command not found", essayez plutôt avec un espace :*
    ```bash
    docker compose up -d --build
    ```

## Méthode 3: Build sur votre PC (Si SSH impossible)

Si vous ne pouvez pas utiliser SSH, vous devez "apporter" l'image toute faite au NAS.

1.  Sur votre PC (dans le dossier du projet) :
    ```bash
    docker build -t trame:latest .
    docker save -o trame.tar trame:latest
    ```
2.  Copiez le fichier `trame.tar` sur le NAS (dans `/Container/Trame`).
3.  Dans **Container Station** > **Images** > **Import**, choisissez le fichier `.tar`.
4.  Une fois l'image importée, retournez créer l'application avec ce YAML **modifié** (sans la ligne `build: .`):

    ```yaml
    version: '3.8'
    services:
      trame:
        image: trame:latest
        container_name: trame
        restart: unless-stopped
        # build: .  <-- LIGNE RETIRÉE
        environment:
          - PORT=8080
          - NODE_ENV=production
        ports:
          - "3000:8080"
    ```

## Dépannage
- **Erreur de build** : Si le NAS n'arrive pas à build (manque de RAM ?), construisez l'image sur votre PC (voir option plus rapide ci-dessus) et retirez la section `build: .` du `docker-compose.yml`.
- **Port occupé** : Si le port 3000 est déjà pris, changez `3000:8080` par `3001:8080` dans le YAML.
