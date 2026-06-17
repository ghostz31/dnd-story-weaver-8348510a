// Fonction pour charger les données complètes des monstres depuis notre base locale
export async function loadCompleteAideDDMonsters(): Promise<any[]> {
  try {
    // Charger le fichier JSON contenant toutes les données des monstres
    const response = await fetch('/data/aidedd-complete/monsters.json');
    if (!response.ok) {
      throw new Error('Impossible de charger la base de données complète des monstres');
    }

    const monstersData = await response.json();
    console.log(`Base de données complète chargée: ${monstersData.length} monstres disponibles`);
    return monstersData;
  } catch (error) {
    console.error('Erreur lors du chargement de la base de données complète:', error);
    return [];
  }
}

// Fonction pour initialiser la base de données complète
export async function initializeCompleteMonsterDatabase(): Promise<void> {
  try {
    console.log("Initialisation de la base de données complète des monstres...");

    // Précharger la base de données complète
    const monstersData = await loadCompleteAideDDMonsters();
    console.log(`Base de données complète initialisée avec ${monstersData.length} monstres`);

    // Vérifier quelques entrées pour s'assurer que tout fonctionne correctement
    if (monstersData.length > 0) {
      const sampleMonsters = ["Dragon", "Gobelin", "Zombie", "Squelette", "Troll"];
      for (const monsterName of sampleMonsters) {
        try {
          // Tester la recherche
          const monster = monstersData.find(m => {
            const mName = m.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return mName.includes(monsterName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
          });

          if (monster) {
            console.log(`Test réussi: monstre "${monsterName}" trouvé: ${monster.name}`);
          } else {
            console.log(`Test: monstre "${monsterName}" non trouvé dans la base de données complète`);
          }
        } catch (error) {
          console.error(`Erreur lors du test pour "${monsterName}":`, error);
        }
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données complète:", error);
  }
}

// Fonction pour charger l'index des monstres individuels
export async function loadMonstersIndex(): Promise<any[]> {
  try {
    console.log("Chargement de l'index des monstres...");

    // Essayer d'abord le nouvel index étendu
    const completeIndexResponse = await fetch('/data/aidedd-complete/monsters-index.json');
    if (completeIndexResponse.ok) {
      const indexData = await completeIndexResponse.json();
      console.log(`Index étendu chargé avec succès: ${indexData.length} monstres`);
      return indexData;
    }

    // Si l'index étendu n'est pas disponible, essayer l'index standard
    const indexResponse = await fetch('/data/monsters/index.json');
    if (indexResponse.ok) {
      const indexData = await indexResponse.json();
      console.log(`Index standard chargé avec succès: ${indexData.length} monstres`);
      return indexData;
    }

    // Si aucun index n'est disponible, générer un index de base
    console.error("Aucun index disponible. Création d'un index par défaut...");
    return [
      {
        id: "gobelin",
        name: "Gobelin",
        originalName: "Goblin",
        cr: "0.25",
        type: "Humanoïde",
        size: "P"
      },
      {
        id: "squelette",
        name: "Squelette",
        originalName: "Skeleton",
        cr: "0.25",
        type: "Mort-vivant",
        size: "M"
      },
      {
        id: "zombie",
        name: "Zombie",
        originalName: "Zombie",
        cr: "0.25",
        type: "Mort-vivant",
        size: "M"
      }
    ];
  } catch (error) {
    console.error("Erreur lors du chargement de l'index des monstres:", error);
    return [];
  }
}

// Fonction pour rechercher un monstre par son nom dans l'index
export async function findMonsterInIndex(monsterName: string): Promise<string | null> {
  try {
    // Normaliser le nom pour la recherche
    const normalizedName = monsterName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Charger l'index
    const monstersIndex = await loadMonstersIndex();

    // Rechercher le monstre par son nom
    const monster = monstersIndex.find(m => {
      const mName = m.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const mOrigName = m.originalName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return mName === normalizedName || mOrigName === normalizedName;
    });

    if (!monster) {
      return null;
    }

    return monster.id;
  } catch (error) {
    console.error(`Erreur lors de la recherche de ${monsterName} dans l'index:`, error);
    return null;
  }
}
