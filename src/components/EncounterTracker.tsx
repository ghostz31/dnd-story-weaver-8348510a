import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Heart, SkipForward, RefreshCw, Play, Pause, Skull, Plus, Minus, Pencil, Square, RotateCcw, Calendar, User, Dice4, Save } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Player } from '../lib/types';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MonsterCard } from './MonsterCard';
import { adaptMonsterDataFormat } from '@/lib/monsterAdapter';

import {
  getMonsterFromAideDD,
  getMonsterFromCompleteDB,
  getParties,
  findMonsterInIndex,
  loadMonsterFromIndividualFile
} from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { v4 as uuid } from 'uuid';
import { updateFirestoreEncounter } from '../lib/firebaseApi';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../auth/AuthContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Encounter as EncounterType, EncounterMonster } from '../lib/types';

// Interface pour le dictionnaire de correspondance
interface MonsterNameMapping {
  [key: string]: string;
}

// Interface de mapping d'URL
interface UrlMapping {
  [key: string]: string;
}

// Interfaces de base pour les entités
interface Monster {
  name: string;
  originalName?: string;
  cr: number;
  xp: number;
  type: string;
  subtype?: string;
  size: string;
  ac: number;
  hp: number;
  maxHp?: number;
  speed: string[];
  alignment: string;
  legendary: boolean;
  source: string;
  environment: string[];
  initiative?: number;
}



// Liste des conditions standard D&D 5e
const possibleConditions = [
  "À terre", "Assourdi", "Aveuglé", "Charmé", "Empoisonné",
  "Empoigné", "Entravé", "Épuisé", "Étourdi", "Inconscient",
  "Invisible", "Neutralisé", "Pétrifié", "Effrayé", "Paralysé"
];

// Interface pour un participant à une rencontre
interface EncounterParticipant {
  id: string;
  name: string;
  initiative: number;
  ac: number;
  currentHp: number;
  maxHp: number;
  isPC: boolean;
  conditions: string[];
  notes: string;
  // Propriétés supplémentaires pour les monstres
  cr?: string | number;
  type?: string;
  size?: string;
  speed?: string[];
  alignment?: string;
  // Caractéristiques
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  // Actions et traits - propriétés pour MonsterCard
  actions?: any[];
  traits?: any[];
}

interface PlayerCharacter {
  id: string;
  name: string;
  initiative: number;
  ac: number;
  currentHp: number;
  maxHp: number;
  isPC: true;
  conditions: string[];
  notes: string;
}

const EncounterTracker: React.FC = () => {
  console.log("=== CHARGEMENT DU COMPOSANT ENCOUNTERTRACKER ===");
  
  // État de la rencontre
  const [encounter, setEncounter] = useState<{
    name: string;
    participants: EncounterParticipant[];
    currentTurn: number;
    round: number;
    isActive: boolean;
  }>({
    name: 'Rencontre',
    participants: [],
    currentTurn: 0,
    round: 1,
    isActive: false
  });

  // État pour le nouveau personnage joueur
  const [newPC, setNewPC] = useState<{
    name: string;
    initiative: number;
    ac: number;
    hp: number;
  }>({
    name: '',
    initiative: 10,
    ac: 15,
    hp: 30
  });

  // État pour le dialogue d'édition des PV
  const [hpEditorOpen, setHpEditorOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<{
    id: string;
    name: string;
    currentHp: number;
    maxHp: number;
  }>({
    id: '',
    name: '',
    currentHp: 0,
    maxHp: 0
  });
  
  // État pour le dialogue d'édition de l'initiative
  const [initiativeDialogOpen, setInitiativeDialogOpen] = useState(false);
  
  // État pour stocker le dictionnaire de correspondance des noms
  const [monsterNameMap, setMonsterNameMap] = useState<MonsterNameMapping>({});
  
  // État pour stocker les mappings d'URL
  const [urlMap, setUrlMap] = useState<UrlMapping>({});
  
  // États pour gérer les détails des monstres
  const [monsterDetails, setMonsterDetails] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [currentMonsterDetails, setCurrentMonsterDetails] = useState<any>(null);
  const [isLoadingEncounter, setIsLoadingEncounter] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Ajouter une référence pour suivre si un chargement est déjà en cours
  const loadingRef = useRef<boolean>(false);

  // Hooks pour la navigation et les paramètres
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ encounterId?: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Afficher un badge de statut pour la créature
  const getStatusBadge = (participant: EncounterParticipant) => {
    const hpPercentage = (participant.currentHp / participant.maxHp) * 100;
    
    if (participant.currentHp <= 0) {
      return <Badge className="bg-gray-500">Mort</Badge>;
    } else if (hpPercentage <= 25) {
      return <Badge className="bg-red-500">Critique</Badge>;
    } else if (hpPercentage <= 50) {
      return <Badge className="bg-orange-500">Blessé</Badge>;
    } else if (hpPercentage < 100) {
      return <Badge className="bg-yellow-500">Touché</Badge>;
    } else {
      return <Badge className="bg-green-500">Indemne</Badge>;
    }
  };

  // Charger les données de la rencontre
  useEffect(() => {
    console.log("=== CHARGEMENT DES DONNÉES DE RENCONTRE ===");
    console.log("URL de la page:", window.location.href);
    console.log("Paramètres:", params);
    
    // Ajout d'un délai pour s'assurer que sessionStorage est chargé
    setTimeout(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const source = searchParams.get('source');
      
      try {
        // Cas 1: Données stockées dans sessionStorage
        if (source === 'session') {
          console.log("Chargement des données depuis sessionStorage");
          const sessionData = sessionStorage.getItem('current_encounter');
          
          if (!sessionData) {
            console.error("Aucune donnée trouvée dans sessionStorage");
            alert("Aucune donnée trouvée dans sessionStorage. URL: " + window.location.href);
            return;
          }
          
          try {
            const parsedData = JSON.parse(sessionData);
            console.log("Données chargées depuis sessionStorage:", parsedData);
            
            // Si les données contiennent déjà des participants initialisés, les utiliser directement
            if (parsedData.participants && Array.isArray(parsedData.participants) && parsedData.participants.length > 0) {
              console.log("Utilisation des participants déjà initialisés:", parsedData.participants);
              
              setEncounter({
                name: parsedData.name || "Rencontre",
                participants: parsedData.participants,
                currentTurn: parsedData.currentTurn || 0,
                round: parsedData.round || 1,
                isActive: parsedData.isActive || false
              });
              
              toast({
                title: "Rencontre chargée",
                description: `${parsedData.name} a été chargée avec succès`,
                variant: "default"
              });
              
              return;
            }
          } catch (jsonError) {
            console.error("Erreur lors du parsing des données JSON:", jsonError);
            alert("Erreur de parsing JSON: " + jsonError);
            return;
          }
        } 
        // Cas 2: ID de rencontre dans les paramètres de l'URL
        else if (params.encounterId) {
          console.log("Chargement depuis l'ID de la rencontre:", params.encounterId);
          // Utiliser la fonction existante pour charger depuis Firestore/localStorage
          loadSavedEncounter();
          return;
        }
        
        // Pour les autres cas, comme les données dans l'URL ou les IDs, 
        // nous pouvons conserver le code existant...
        
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        alert("Erreur lors du chargement des données: " + error);
      }
    }, 500); // Délai de 500ms pour s'assurer que tout est initialisé
  }, []);

  // Charger le dictionnaire de correspondance
  useEffect(() => {
    // Charger le dictionnaire de correspondance des noms
    fetch('/data/aidedd-monster-name-mapping.json')
      .then(response => response.json())
      .then(data => {
        setMonsterNameMap(data);
      })
      .catch(error => {
        console.error("Erreur lors du chargement du dictionnaire de noms:", error);
      });
      
    // Charger les mappings d'URL depuis le fichier de noms de monstres
    fetch('/data/aidedd-monster-names.txt')
      .then(response => response.text())
      .then(data => {
        // Convertir chaque ligne en un mapping de nom à URL
        const lines = data.split('\n').filter(line => line.trim() !== '');
        const mappings: UrlMapping = {};
        
        lines.forEach(slug => {
          // Convertir le slug en nom lisible
          const readableName = slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            // Correction pour certains cas
            .replace(/([Gg])eant(e?)/g, '$1éant$2')
            .replace(/([Ee])lementaire/g, '$1lémentaire')
            .replace(/([Ee])veille/g, '$1veillé');
          
          // Créer le mapping dans les deux sens
          mappings[readableName] = slug;
          
          // Ajouter aussi des versions sans accents
          const unaccentedName = readableName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          if (unaccentedName !== readableName) {
            mappings[unaccentedName] = slug;
          }
        });
        
        setUrlMap(mappings);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des mappings d'URL:", error);
      });
  }, []);

  // Trier les participants par initiative (décroissante)
  const sortedParticipants = [...encounter.participants].sort((a, b) => b.initiative - a.initiative);

  // Ajouter un personnage joueur
  const addPlayerCharacter = () => {
    if (!newPC.name) {
      toast({
        title: "Erreur",
        description: "Veuillez donner un nom au personnage.",
        variant: "destructive"
      });
      return;
    }

    // Création d'un nouveau participant avec toutes les propriétés nécessaires
    const newParticipant = {
      id: `pc-${Date.now()}`,
      name: newPC.name,
      initiative: newPC.initiative,
      ac: newPC.ac,
      currentHp: newPC.hp,
      maxHp: newPC.hp,
      isPC: true,
      conditions: [] as string[],
      notes: '',
      // Propriétés Monster requises
      cr: 0,
      xp: 0,
      type: 'Humanoïde',
      size: 'M',
      hp: newPC.hp,
      speed: [],
      alignment: 'neutre',
      legendary: false,
      source: 'Joueur',
      environment: []
    } as EncounterParticipant;

    setEncounter(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }));

    setNewPC({
      name: '',
      initiative: 10,
      ac: 15,
      hp: 30
    });

    toast({
      title: "Personnage ajouté",
      description: `${newPC.name} a rejoint la rencontre.`
    });
  };

  // Gérer les points de vie
  const updateHp = (id: string, amount: number) => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p => {
        if (p.id === id) {
          const newHp = Math.max(0, Math.min(p.maxHp, p.currentHp + amount));
          return { ...p, currentHp: newHp };
        }
        return p;
      })
    }));
  };

  // Ouvrir l'éditeur de points de vie
  const openHpEditor = (participant: EncounterParticipant) => {
    setEditingParticipant({
      id: participant.id,
      name: participant.name,
      currentHp: participant.currentHp,
      maxHp: participant.maxHp
    });
    setHpEditorOpen(true);
  };

  // Sauvegarder les modifications de points de vie
  const saveHpChanges = () => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p => {
        if (p.id === editingParticipant.id) {
          // S'assurer que les valeurs sont valides
          const newMaxHp = Math.max(1, editingParticipant.maxHp);
          const newCurrentHp = Math.max(0, Math.min(newMaxHp, editingParticipant.currentHp));
          
          return { ...p, currentHp: newCurrentHp, maxHp: newMaxHp };
        }
        return p;
      })
    }));
    
    setHpEditorOpen(false);
    
    toast({
      title: "Points de vie modifiés",
      description: "Les points de vie ont été mis à jour."
    });
  };

  // Passer au tour suivant
  const nextTurn = () => {
    // Trouver le prochain participant actif (ignorer les morts)
    let nextParticipantIndex = encounter.currentTurn;
    let newRound = encounter.round;
    
    // Initialiser le combat si on est au premier tour
    if (encounter.round === 1 && encounter.currentTurn === 0) {
      initializeCombatData();
    }
    
    // Parcourir les participants jusqu'à trouver un participant vivant
    let participantsChecked = 0;
    do {
      nextParticipantIndex = (nextParticipantIndex + 1) % encounter.participants.length;
      participantsChecked++;
      
      // Si on a fait le tour complet sans trouver de participant vivant, incrémenter le tour
      if (nextParticipantIndex === 0) {
        newRound++;
      }
      
      // Éviter une boucle infinie si tous les participants sont morts
      if (participantsChecked > encounter.participants.length) {
        toast({
          title: "Fin de la rencontre",
          description: "Tous les participants sont hors combat",
          variant: "destructive"
        });
        return;
      }
    } while (encounter.participants[nextParticipantIndex].currentHp <= 0);
    
    // Mettre à jour l'état
    setEncounter(prev => ({
        ...prev,
      currentTurn: nextParticipantIndex,
      round: newRound
    }));
    
    // Charger automatiquement les détails du monstre actif s'il n'est pas un PJ
    const activeParticipant = encounter.participants[nextParticipantIndex];
    if (!activeParticipant.isPC) {
      loadMonsterOnDemand(activeParticipant.id);
    }
  };

  // Démarrer/arrêter la rencontre
  const toggleEncounterState = () => {
    setEncounter(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };

  // Réinitialiser la rencontre
  const resetEncounter = () => {
    setEncounter(prev => ({
      ...prev,
      currentTurn: 0,
      round: 1,
      isActive: false,
      participants: prev.participants.map(p => ({
        ...p,
        currentHp: p.maxHp,
        conditions: []
      }))
    }));
  };

  // Retirer un participant
  const removeParticipant = (id: string) => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }));
  };

  // Ajouter/retirer une condition
  const toggleCondition = (id: string, condition: string) => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p => {
        if (p.id === id) {
          const hasCondition = p.conditions.includes(condition);
          return {
            ...p,
            conditions: hasCondition 
              ? p.conditions.filter(c => c !== condition)
              : [...p.conditions, condition]
          };
        }
        return p;
      })
    }));
  };

  // Mettre à jour les notes
  const updateNotes = (id: string, notes: string) => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p => {
        if (p.id === id) {
          return { ...p, notes };
        }
        return p;
      })
    }));
  };

  // Fonction pour générer aléatoirement l'initiative pour tous les participants
  const rollInitiativeForAll = () => {
    if (!encounter || !encounter.participants) return;

    const updatedParticipants = encounter.participants.map(participant => {
      const diceRoll = Math.floor(Math.random() * 20) + 1;
      const modifier = participant.isPC ? estimateDexModifier(participant) : 0;
      const newInitiative = diceRoll + modifier;
      
      return {
        ...participant,
        initiative: newInitiative
      };
    });
    
    setEncounter(prev => ({
      ...prev,
      participants: updatedParticipants
    }));
    
    toast({
      title: "Initiative lancée pour tous",
      description: `${updatedParticipants.length} participants ont lancé l'initiative`
    });
  };
  
  // Fonction pour estimer le modificateur de Dextérité basé sur la classe et le niveau
  const estimateDexModifier = (participant: EncounterParticipant): number => {
    if (!participant.isPC) return 0;
    
    // Estimer le modificateur de DEX basé sur la classe
    const classModifiers: Record<string, number> = {
      'Barbare': 0,
      'Barde': 2,
      'Clerc': 0,
      'Druide': 0,
      'Ensorceleur': 1,
      'Guerrier': 1,
      'Magicien': 1,
      'Moine': 3,
      'Paladin': 0,
      'Rôdeur': 2,
      'Roublard': 3,
      'Sorcier': 1
    };
    
    // Extraire la classe du champ notes
    const classMatch = participant.notes.match(/(\w+) niveau/);
    const characterClass = classMatch ? classMatch[1] : '';
    
    return classModifiers[characterClass] || 0;
  };

  // Fonction pour obtenir le slug URL pour AideDD
  const getAideDDMonsterSlug = (name: string): string => {
    // 1. Chercher d'abord dans le dictionnaire d'URL
    if (urlMap[name]) {
      return urlMap[name]; // Retourne directement le slug sans encodage
    }
    
    // 2. Essayer avec le nom corrigé des accents
          const nameWithCorrectAccents = getAideDDMonsterName(name);
      if (urlMap[nameWithCorrectAccents]) {
        return urlMap[nameWithCorrectAccents]; // Retourne directement le slug sans encodage
      }
    
    // 3. Cas spéciaux connus pour la correction manuelle
    const specialCases: Record<string, string> = {
      'Dragon d\'ombre rouge jeune': 'dragon-d-ombre-rouge-jeune',
      'Dragon d\'ombre rouge, jeune': 'dragon-d-ombre-rouge-jeune',
      'Dragon d\'ombre rouge': 'dragon-d-ombre-rouge-jeune',
      'Dragon dombre rouge jeune': 'dragon-d-ombre-rouge-jeune',
      'Béhir': 'behir',
      'Behir': 'behir',
      'Arbre éveillé': 'arbre-eveille',
      'Balor': 'balor'
    };
    
    const normalizedName = name.trim();
    if (specialCases[normalizedName]) {
      return specialCases[normalizedName];
    }
    
    // 4. Si tout échoue, convertir manuellement en slug
    // IMPORTANT: Ne pas utiliser encodeURIComponent, car le site attend un format avec tirets
    let slug = name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Enlever les accents
    
    // Correction spéciale pour les apostrophes: 'd'ombre' devient 'd-ombre'
    slug = slug.replace(/'(\w)/g, '-$1');
    
    // Traitement spécial pour les apostrophes
    slug = slug.replace(/([a-z])\'([a-z])/g, '$1-$2');
    
    // Remplacer les espaces par des tirets
    slug = slug.replace(/ /g, '-');
    
    // Supprimer les caractères non alphanumériques (sauf les tirets)
    slug = slug.replace(/[^a-z0-9-]/g, '');
    
    // Éviter les tirets consécutifs
    slug = slug.replace(/-+/g, '-');
    
    return slug;
  };

  // Fonction pour obtenir le nom exact pour AideDD (pour l'affichage)
  const getAideDDMonsterName = (name: string): string => {
    // Vérifier d'abord dans le dictionnaire de correspondance
    if (monsterNameMap[name]) {
      return monsterNameMap[name];
    }
    
    // Règles spécifiques pour les cas non couverts par le dictionnaire
    const nameWithCorrectAccents = name
      .replace(/([Gg])eant(e?)/g, '$1éant$2')
      .replace(/([Ee])lementaire/g, '$1lémentaire')
      .replace(/([Ee])veille/g, '$1veillé')
      .replace(/([Ee])lan/g, '$1lan')
      .replace(/([Ee])pee/g, '$1pée')
      .replace(/([Ee])pouvantail/g, '$1pouvantail');
    
    return nameWithCorrectAccents;
  };

  // Fonction pour trouver les informations complètes d'un monstre par son nom
  const findMonsterDetails = async (name: string, forceRefresh = false): Promise<any> => {
    if (!name) {
      console.error("Nom de monstre manquant");
      return null;
    }
    
    try {
      console.log(`Recherche du monstre: ${name}`);
      
      // Essayer d'obtenir le monstre depuis AideDD
      const aideddMonster = await getMonsterFromAideDD(name, forceRefresh);
      
      if (aideddMonster) {
        console.log("Monstre trouvé dans AideDD:", aideddMonster);
        return aideddMonster;
      }
      
      // Si le monstre n'est pas trouvé sur AideDD, retourner null
      console.warn(`Monstre non trouvé: ${name}`);
      return null;
    } catch (error) {
      console.error("Erreur lors de la recherche du monstre:", error);
      return null;
    }
  };
  
  // Fonction pour extraire les données d'un monstre à partir du HTML
  const extractMonsterDataFromHTML = (html: string, url: string): any => {
    try {
      // Extraire le nom
      const nameMatch = html.match(/<h1>([^<]+)<\/h1>/);
      const name = nameMatch ? nameMatch[1].trim() : "Monstre inconnu";
      
      // Extraire le nom original (VO)
      const originalNameMatch = html.match(/\[ <a href='monstres\.php\?vo=([^']+)'>([^<]+)<\/a> \]/);
      const originalName = originalNameMatch ? originalNameMatch[2].trim() : "";
      
      // Extraire le type et l'alignement
      const typeMatch = html.match(/<div class='type'>([^<]+)<\/div>/);
      let type = "Inconnu";
      let size = "M";
      let alignment = "non aligné";
      
      if (typeMatch && typeMatch[1]) {
        const typeParts = typeMatch[1].split(',');
        if (typeParts.length >= 2) {
          // Premier élément contient taille et type
          const sizeAndType = typeParts[0].trim().split(' de taille ');
          if (sizeAndType.length === 2) {
            type = sizeAndType[0].trim();
            size = sizeAndType[1].trim();
          }
          
          // Deuxième élément est l'alignement
          alignment = typeParts[1].trim();
        }
      }
      
      // Extraire les caractéristiques de base (AC, HP, vitesse)
      const acMatch = html.match(/<strong>Classe d'armure<\/strong>([^<]+)<br>/);
      const ac = acMatch ? acMatch[1].trim() : "10";
      
      const hpMatch = html.match(/<strong>Points de vie<\/strong>([^<]+)<br>/);
      const hp = hpMatch ? hpMatch[1].trim() : "10 (1d8+2)";
      
      const speedMatch = html.match(/<strong>Vitesse<\/strong>([^<]+)<div>/);
      const speed = speedMatch ? speedMatch[1].trim() : "9 m";
      
      // Extraire les caractéristiques d'abilités
      const strMatch = html.match(/<strong>FOR<\/strong><br>(\d+)/);
      const dexMatch = html.match(/<strong>DEX<\/strong><br>(\d+)/);
      const conMatch = html.match(/<strong>CON<\/strong><br>(\d+)/);
      const intMatch = html.match(/<strong>INT<\/strong><br>(\d+)/);
      const wisMatch = html.match(/<strong>SAG<\/strong><br>(\d+)/);
      const chaMatch = html.match(/<strong>CHA<\/strong><br>(\d+)/);
      
      const abilities = {
        str: strMatch ? parseInt(strMatch[1], 10) : 10,
        dex: dexMatch ? parseInt(dexMatch[1], 10) : 10,
        con: conMatch ? parseInt(conMatch[1], 10) : 10,
        int: intMatch ? parseInt(intMatch[1], 10) : 10,
        wis: wisMatch ? parseInt(wisMatch[1], 10) : 10,
        cha: chaMatch ? parseInt(chaMatch[1], 10) : 10
      };
      
      // Extraire les autres caractéristiques
      const savingThrowsMatch = html.match(/<strong>Jets de sauvegarde<\/strong>([^<]+)<br>/);
      const savingThrows = savingThrowsMatch ? savingThrowsMatch[1].trim() : "";
      
      const skillsMatch = html.match(/<strong>Compétences<\/strong>([^<]+)<br>/);
      const skills = skillsMatch ? skillsMatch[1].trim() : "";
      
      const resistancesMatch = html.match(/<strong>Résistances aux dégâts<\/strong>([^<]+)<br>/);
      const damageResistances = resistancesMatch ? resistancesMatch[1].trim() : "";
      
      const immunitiesMatch = html.match(/<strong>Immunités aux dégâts<\/strong>([^<]+)<br>/);
      const damageImmunities = immunitiesMatch ? immunitiesMatch[1].trim() : "";
      
      const conditionsMatch = html.match(/<strong>Immunités aux états<\/strong>([^<]+)<br>/);
      const conditionImmunities = conditionsMatch ? conditionsMatch[1].trim() : "";
      
      const sensesMatch = html.match(/<strong>Sens<\/strong>([^<]+)<br>/);
      const senses = sensesMatch ? sensesMatch[1].trim() : "";
      
      const languagesMatch = html.match(/<strong>Langues<\/strong>([^<]+)<br>/);
      const languages = languagesMatch ? languagesMatch[1].trim() : "";
      
      const crMatch = html.match(/<strong>Puissance<\/strong>([^(]+)\(([^)]+)/);
      let cr = "0";
      let xp = 0;
      
      if (crMatch && crMatch[1] && crMatch[2]) {
        cr = crMatch[1].trim();
        xp = parseInt(crMatch[2].replace(/[^\d]/g, ''), 10);
      }
      
      // Extraire les traits (capacités)
      const traits: any[] = [];
      const traitsSection = html.match(/<\/div><div><svg>.*?<\/svg><\/div>(.*?)<div class='rub'>Actions<\/div>/s);
      
      if (traitsSection && traitsSection[1]) {
        const traitMatches = [...traitsSection[1].matchAll(/<strong><em>([^<]+)<\/em><\/strong>\. (.*?)(?=<\/p>)/g)];
        traitMatches.forEach(match => {
          traits.push({
            name: match[1],
            description: match[2]
          });
        });
      }
      
      // Extraire les actions
      const actions: any[] = [];
      const actionsSection = html.match(/<div class='rub'>Actions<\/div>(.*?)(?=<\/div><\/div>|<div class='rub'>)/s);
      
      if (actionsSection && actionsSection[1]) {
        const actionMatches = [...actionsSection[1].matchAll(/<strong><em>([^<]+)<\/em><\/strong>\. (.*?)(?=<\/p>)/g)];
        actionMatches.forEach(match => {
          actions.push({
            name: match[1],
            description: match[2]
          });
        });
      }
      
      // Extraire les actions légendaires
      const legendaryActions: any[] = [];
      const legendarySection = html.match(/<div class='rub'>Actions légendaires<\/div>(.*?)(?=<\/div><\/div>)/s);
      
      if (legendarySection && legendarySection[1]) {
        const legendaryMatches = [...legendarySection[1].matchAll(/<strong><em>([^<]+)<\/em><\/strong>\. (.*?)(?=<\/p>)/g)];
        legendaryMatches.forEach(match => {
          legendaryActions.push({
            name: match[1],
            description: match[2]
          });
        });
      }
      
                return {
        name,
        originalName,
        originalUrl: url,
        type,
        size,
        alignment,
        ac,
        hp,
        speed,
        abilities,
        str: abilities.str,
        dex: abilities.dex,
        con: abilities.con,
        int: abilities.int,
        wis: abilities.wis,
        cha: abilities.cha,
        savingThrows,
        skills,
        damageResistances,
        damageImmunities,
        conditionImmunities,
        senses,
        languages,
        cr,
        xp,
        traits,
        actions,
        legendaryActions,
        isLegendary: legendaryActions.length > 0,
        fullHtml: html
      };
    } catch (error) {
      console.error("Erreur lors de l'extraction des données du HTML:", error);
      return { name: "Erreur d'extraction", fullHtml: html };
    }
  };
  
  // Création d'un monstre générique quand aucune information n'est trouvée
  const createGenericMonster = (name: string): any => {
    return {
      name,
      type: "Inconnu",
      size: "M",
      alignment: "non aligné",
      ac: "12",
      hp: "30 (4d8+12)",
      speed: "9 m",
      abilities: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10
      },
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
      cr: "1",
      xp: 200,
      traits: [],
      actions: [
        {
          name: "Attaque de base",
          description: "Attaque au corps à corps avec une arme : +2 au toucher, allonge 1,50 m, une cible. Touché : 4 (1d6+1) dégâts."
        }
      ],
      legendaryActions: [],
      isLegendary: false
    };
  };
  
  // Remplacer la fonction loadMonsterOnDemand avec une version améliorée
  const loadMonsterOnDemand = async (participantId: string): Promise<void> => {
      const participant = encounter.participants.find(p => p.id === participantId);
    if (!participant || participant.isPC) return;
      
    try {
      // Indiquer que nous sommes en train de charger les données
      setLoadingDetails(true);
      setCurrentMonsterDetails(null); // Réinitialiser les détails actuels pour montrer le chargement
      
      console.log(`Chargement des détails pour: ${participant.name}`);
      
      // Rechercher les détails du monstre
      const monsterName = participant.name;
      console.log(`Recherche des détails pour: ${monsterName}`);
      
      // Force un nouveau chargement
      const monsterDetails = await findMonsterDetails(monsterName, true);
          
          if (monsterDetails) {
        console.log(`Détails trouvés pour ${monsterName}:`, monsterDetails);
        
        // Mettre à jour l'état avec les détails du monstre
        setCurrentMonsterDetails(monsterDetails);
        
        // Mettre à jour le participant avec les nouvelles informations (AC, HP, etc.)
        setEncounter(prev => ({
          ...prev,
          participants: prev.participants.map(p => {
              if (p.id === participantId) {
                return {
                  ...p,
                ac: monsterDetails.ac || p.ac,
                maxHp: monsterDetails.hp || p.maxHp,
                // Ne pas modifier les points de vie actuels pour ne pas perturber le combat
                // Mettre à jour les autres propriétés
                str: monsterDetails.str,
                dex: monsterDetails.dex,
                con: monsterDetails.con,
                int: monsterDetails.int,
                wis: monsterDetails.wis,
                cha: monsterDetails.cha,
                // Ajouter les actions et traits s'ils existent
                actions: monsterDetails.actions || [],
                traits: monsterDetails.traits || []
                };
              }
              return p;
          })
        }));
        
            toast({
          title: "Succès",
          description: `Informations de ${monsterName} mises à jour`,
              variant: "default"
            });
          } else {
            console.warn(`Aucun détail trouvé pour ${monsterName}`);
        
        // Créer un monstre générique si aucun détail n'est trouvé
        const genericMonster = createGenericMonster(monsterName);
        setCurrentMonsterDetails(genericMonster);
        
        toast({
          title: "Information",
          description: `Aucune information trouvée pour ${monsterName}`,
          variant: "default"
        });
          }
        } catch (error) {
      console.error(`Erreur lors du chargement des détails pour ${participant.name}:`, error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du monstre",
        variant: "destructive"
      });
        } finally {
      // Toujours désactiver l'indicateur de chargement à la fin
          setLoadingDetails(false);
    }
  };

  // Fonction pour initialiser les données de combat
  const initializeCombatData = async (): Promise<void> => {
    try {
      // Activer l'indicateur de chargement
      setLoadingDetails(true);
      
      // Copier les participants existants
      const combatParticipants = [...encounter.participants];
      
      // Pour chaque participant non-PC
      for (let i = 0; i < combatParticipants.length; i++) {
        const participant = combatParticipants[i];
        
        if (!participant.isPC) {
          console.log(`Initialisation des données pour: ${participant.name}`);
          
            // Rechercher les détails du monstre
          const monsterName = participant.name;
          const monsterDetails = await findMonsterDetails(monsterName);
            
            if (monsterDetails) {
            console.log(`Détails trouvés pour ${monsterName}:`, monsterDetails);
            
            // Mettre à jour le cache
            setMonsterDetails(prev => ({
              ...prev,
              [participant.id]: monsterDetails
            }));
            
            // Mettre à jour les propriétés du participant
            combatParticipants[i] = {
                ...participant,
              ac: monsterDetails.ac || participant.ac,
              currentHp: monsterDetails.hp || participant.currentHp,
              maxHp: monsterDetails.hp || participant.maxHp,
              // Autres propriétés
              str: monsterDetails.str,
              dex: monsterDetails.dex,
              con: monsterDetails.con,
              int: monsterDetails.int,
              wis: monsterDetails.wis,
              cha: monsterDetails.cha,
              actions: monsterDetails.actions || [],
              traits: monsterDetails.traits || []
            };
          }
        }
      }
      
      // Mettre à jour l'état de l'encounter avec les participants mis à jour
      setEncounter(prev => ({
        ...prev,
        participants: combatParticipants
      }));
      
      // Désactiver l'indicateur de chargement
      setLoadingDetails(false);
    } catch (error) {
      console.error("Erreur lors de l'initialisation des données de combat:", error);
      setLoadingDetails(false);
    }
  };

  // Modifier le SimpleMonsterCard pour utiliser le nouveau MonsterCard
  const SimpleMonsterCard = ({ monster }: { monster: any }) => {
    // Si nous avons suffisamment d'informations, utiliser MonsterCard
    if (monster && monster.name && monster.name !== "Monstre inconnu") {
      return <MonsterCard monster={monster} />;
    }
    
    // Sinon, utiliser la version simplifiée
    const getAbilityModifier = (value: number): string => {
      const modifier = Math.floor((value - 10) / 2);
      return modifier >= 0 ? `+${modifier}` : `${modifier}`;
    };

    // Version simplifiée comme fallback
    return (
      <div className="bg-white border border-gray-300 rounded-md p-4">
        <div className="text-xl font-bold border-b pb-2 mb-2">{monster.name}</div>
        <div className="text-sm italic mb-3">
          {monster.size || 'M'} {monster.type || 'créature'}, {monster.alignment || 'non aligné'}
        </div>
        
        <div className="mb-3">
            <div className="font-semibold">Classe d'armure</div>
          <div>{monster.ac || 10} (armure naturelle)</div>
          </div>
        
        <div className="mb-3">
            <div className="font-semibold">Points de vie</div>
          <div>{monster.hp || '10 (1d8+2)'}</div>
          </div>
        
        <div>
          <div className="font-semibold">Vitesse</div>
          <div className="mb-3">{typeof monster.speed === 'string' ? monster.speed : 
               Array.isArray(monster.speed) ? monster.speed.join(', ') : 
               '9 m'}</div>
        </div>
        
        {(monster.abilities || monster.str) && (
          <div className="grid grid-cols-6 gap-2 mb-3 border p-2 rounded">
            <div className="text-center">
              <div className="font-semibold">FOR</div>
              <div>{monster.abilities?.str || monster.str || 10}</div>
              <div className="text-xs">({getAbilityModifier(monster.abilities?.str || monster.str || 10)})</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">DEX</div>
              <div>{monster.abilities?.dex || monster.dex || 10}</div>
              <div className="text-xs">({getAbilityModifier(monster.abilities?.dex || monster.dex || 10)})</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">CON</div>
              <div>{monster.abilities?.con || monster.con || 10}</div>
              <div className="text-xs">({getAbilityModifier(monster.abilities?.con || monster.con || 10)})</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">INT</div>
              <div>{monster.abilities?.int || monster.int || 10}</div>
              <div className="text-xs">({getAbilityModifier(monster.abilities?.int || monster.int || 10)})</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">SAG</div>
              <div>{monster.abilities?.wis || monster.wis || 10}</div>
              <div className="text-xs">({getAbilityModifier(monster.abilities?.wis || monster.wis || 10)})</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">CHA</div>
              <div>{monster.abilities?.cha || monster.cha || 10}</div>
              <div className="text-xs">({getAbilityModifier(monster.abilities?.cha || monster.cha || 10)})</div>
            </div>
          </div>
        )}
        
        <div className="text-center mt-4">
          <a 
            href={`https://www.aidedd.org/dnd/monstres.php?vf=${getAideDDMonsterSlug(monster.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Voir la fiche complète sur AideDD
          </a>
                </div>
      </div>
    );
  };

  // useEffect pour charger automatiquement les détails du monstre actif quand il change
  useEffect(() => {
    const activeParticipant = encounter.participants[encounter.currentTurn];
    if (activeParticipant && !activeParticipant.isPC) {
      // Charger automatiquement les détails du monstre actif
      loadMonsterOnDemand(activeParticipant.id);
    }
  }, [encounter.currentTurn]);

  // useEffect pour initialiser automatiquement les données de combat au démarrage
  useEffect(() => {
    // Vérifier qu'il y a des participants et que la rencontre est active
    if (encounter.participants.length > 0 && encounter.isActive) {
      console.log("Initialisation automatique des données de combat au démarrage...");
      // Délai court pour s'assurer que toutes les données sont chargées
      const timer = setTimeout(() => {
        initializeCombatData();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [encounter.isActive]); // Réagir quand la rencontre devient active
  
  // Ajouter cette fonction pour sauvegarder l'état actuel de la rencontre
  const saveCurrentEncounterState = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Non connecté",
        description: "Veuillez vous connecter pour sauvegarder la rencontre",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Récupérer les données du localStorage pour connaître l'ID de la rencontre
      const storageKey = window.location.pathname.split('/').pop();
      const savedEncounterData = localStorage.getItem(`encounter_${storageKey}`);
      
      if (!savedEncounterData) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les données de la rencontre",
          variant: "destructive"
        });
        return;
      }
      
      const savedEncounter = JSON.parse(savedEncounterData);
      const encounterId = savedEncounter.id;
      
      if (!encounterId) {
        toast({
          title: "Erreur",
          description: "ID de rencontre manquant",
          variant: "destructive"
        });
        return;
      }
      
      // Préparer les données à sauvegarder
      const encounterDataToSave = {
        name: encounter.name,
        participants: encounter.participants,
        isActive: encounter.isActive,
        currentTurn: encounter.currentTurn as number, // Forcer le type à number
        round: encounter.round as number, // Forcer le type à number
        status: (encounter.isActive ? 'active' : 'draft') as 'active' | 'draft' | 'completed', // Spécifier le type correct
        // Préserver les autres données importantes
        partyId: savedEncounter.partyId,
        party: savedEncounter.party,
        monsters: savedEncounter.monsters,
        environment: savedEncounter.environment,
        difficulty: savedEncounter.difficulty,
        totalXP: savedEncounter.totalXP,
        adjustedXP: savedEncounter.adjustedXP
      };
      
      // Sauvegarder dans Firestore
      await updateFirestoreEncounter(encounterId, encounterDataToSave);
      
      // Mettre à jour le localStorage aussi pour synchroniser
      localStorage.setItem(`encounter_${storageKey}`, JSON.stringify({
        ...savedEncounter,
        ...encounterDataToSave,
        updatedAt: new Date().toISOString()
      }));
      
      toast({
        title: "Succès",
        description: "Rencontre sauvegardée avec succès",
        variant: "default"
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la rencontre:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la rencontre",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Composant pour afficher le monstre dans une iframe directement depuis AideDD
  const MonsterIframe = ({ monster }: { monster: any }) => {
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [iframeError, setIframeError] = useState(false);
    
    // Obtenir l'URL de la page AideDD du monstre
    const getMonsterUrl = (monsterName: string) => {
      const slug = getAideDDMonsterSlug(monsterName);
      return `https://www.aidedd.org/dnd/monstres.php?vf=${slug}`;
    };

    // Utiliser le nom original s'il existe, sinon le nom standard
    const monsterName = monster.originalName || monster.name;
    const monsterUrl = getMonsterUrl(monsterName);
    
    // Gérer les erreurs de chargement
    const handleIframeError = () => {
      console.error("Erreur de chargement de l'iframe pour", monsterName);
      setIframeError(true);
    };
    
    // Si erreur, afficher une interface de secours
    if (iframeError) {
      return (
        <div className="bg-white border border-gray-300 rounded-md p-4">
          <div className="text-xl font-bold border-b pb-2 mb-2 flex justify-between items-center">
            <span>{monster.name}</span>
            <a 
              href={monsterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              Ouvrir dans AideDD
            </a>
          </div>
          <div className="text-center p-4">
            <p className="text-sm mb-4">Impossible de charger la fiche directement dans l'application.</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(monsterUrl, '_blank')}
            >
              Voir la fiche sur AideDD
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
        <div className="p-2 bg-gray-100 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">{monster.name}</h3>
          <a 
            href={monsterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            Ouvrir dans AideDD
          </a>
        </div>
        
        {/* Afficher un indicateur de chargement tant que l'iframe n'est pas chargée */}
        {!iframeLoaded && (
          <div className="w-full h-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Chargement de la fiche...</span>
          </div>
        )}
        
        {/* Iframe avec la page AideDD */}
        <div className="w-full h-[600px] overflow-auto">
          <iframe
            src={monsterUrl}
            title={`Fiche de ${monster.name}`}
            className={`w-full h-full border-0 ${iframeLoaded ? 'block' : 'hidden'}`}
            onLoad={() => setIframeLoaded(true)}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        </div>
      </div>
    );
  };
  
  // Ajouter cette fonction pour charger une rencontre depuis Firebase ou localStorage
  const loadSavedEncounter = async () => {
    try {
      setIsLoadingEncounter(true);
      
      // Obtenir l'ID de la rencontre depuis les paramètres de l'URL ou la query string
      const encounterId = params.encounterId || new URLSearchParams(location.search).get('encounterId');
      
      if (!encounterId) {
        console.log("Aucun ID de rencontre trouvé dans l'URL");
        setIsLoadingEncounter(false);
        return;
      }
      
      console.log(`Chargement de la rencontre avec l'ID: ${encounterId}`);
      
      // D'abord, essayer de charger depuis le localStorage
      const savedData = localStorage.getItem(`encounter_${encounterId}`);
      
      if (savedData) {
        const encounterData = JSON.parse(savedData) as EncounterType;
        console.log("Rencontre chargée depuis le localStorage:", encounterData);
        
        // Initialiser les participants à partir des données de la rencontre
        initializeEncounterFromSaved(encounterData);
      } else if (isAuthenticated && user) {
        // Si pas en localStorage, essayer de charger depuis Firebase
        const userRef = doc(db, 'users', user.uid);
        const encounterRef = doc(userRef, 'encounters', encounterId);
        
        const encounterDoc = await getDoc(encounterRef);
        if (encounterDoc.exists()) {
          const data = encounterDoc.data();
          const encounterData = {
            ...data,
            id: encounterId,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
          } as EncounterType;
          
          console.log("Rencontre chargée depuis Firebase:", encounterData);
          
          // Stocker dans le localStorage pour utilisation future
          localStorage.setItem(`encounter_${encounterId}`, JSON.stringify(encounterData));
          
          // Initialiser les participants à partir des données de la rencontre
          initializeEncounterFromSaved(encounterData);
        } else {
          toast({
            title: "Rencontre non trouvée",
            description: "Impossible de trouver la rencontre demandée",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la rencontre:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la rencontre",
        variant: "destructive"
      });
    } finally {
      setIsLoadingEncounter(false);
    }
  };
  
  // Fonction pour initialiser les participants de la rencontre à partir des données sauvegardées
  const initializeEncounterFromSaved = (encounterData: EncounterType) => {
    try {
      // Mettre à jour le nom de la rencontre
      setEncounter(currentEncounter => ({
        ...currentEncounter,
        name: encounterData.name || "Nouvelle rencontre"
      }));
      
      // Si la rencontre a déjà des participants, les utiliser
      if (encounterData.participants && encounterData.participants.length > 0) {
        console.log("Utilisation des participants existants:", encounterData.participants);
        setEncounter(currentEncounter => ({
          ...currentEncounter,
          participants: encounterData.participants,
          isActive: encounterData.isActive || false,
          currentTurn: encounterData.currentTurn as number || 0,
          round: encounterData.round as number || 1
        }));
      } else {
        // Sinon, initialiser à partir des monstres et du groupe
        console.log("Initialisation des participants à partir des monstres et du groupe");
        
        // Initialiser les participants (joueurs)
        const playerParticipants: EncounterParticipant[] = 
          (encounterData.party?.players || []).map(player => ({
            id: player.id || uuid(),
            name: player.name,
            initiative: 0, // Sera roulé plus tard
            ac: player.ac || 10,
            currentHp: player.currentHp || player.maxHp || 10,
            maxHp: player.maxHp || 10,
            isPC: true,
            conditions: [],
            notes: ''
          }));
        
        // Initialiser les participants (monstres)
        const monsterParticipants: EncounterParticipant[] = [];
        
        // Pour chaque type de monstre, créer le nombre approprié d'instances
        (encounterData.monsters as EncounterMonster[]).forEach(({ monster, quantity }) => {
          for (let i = 0; i < quantity; i++) {
            monsterParticipants.push({
              id: uuid(),
              name: monster.name,
              initiative: 0, // Sera roulé plus tard
              ac: monster.ac || 10,
              currentHp: monster.hp || 10,
              maxHp: monster.hp || 10,
              isPC: false,
              conditions: [],
              notes: '',
              cr: monster.cr,
              type: monster.type,
              size: monster.size,
              alignment: monster.alignment,
              str: monster.str,
              dex: monster.dex,
              con: monster.con,
              int: monster.int,
              wis: monster.wis,
              cha: monster.cha
            });
          }
        });
        
        // Combiner tous les participants
        const allParticipants = [...playerParticipants, ...monsterParticipants];
        
        // Mettre à jour l'état
        setEncounter(currentEncounter => ({
          ...currentEncounter,
          participants: allParticipants
        }));
        
        // Rouler l'initiative pour tous
        setTimeout(() => {
          rollInitiativeForAll();
        }, 500);
      }
      
      toast({
        title: "Rencontre chargée",
        description: `"${encounterData.name}" a été chargée avec succès`,
        variant: "default"
      });
    } catch (error) {
      console.error("Erreur lors de l'initialisation de la rencontre:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser la rencontre",
        variant: "destructive"
      });
    }
  };
  
  // Ajouter un useEffect pour charger la rencontre au démarrage
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const encodedEncounter = searchParams.get('encounter');
    
    if (encodedEncounter) {
      // Si on a un encodedEncounter, c'est l'ancien format
      try {
        const decodedData = JSON.parse(decodeURIComponent(encodedEncounter));
        console.log("Données de rencontre encodées:", decodedData);
        
        // Mettre à jour le nom de la rencontre
        setEncounter(currentEncounter => ({
          ...currentEncounter,
          name: decodedData.name || "Nouvelle rencontre"
        }));
        
        // Initialiser les participants (joueurs)
        const playerParticipants: EncounterParticipant[] = 
          (decodedData.party?.players || []).map(player => ({
            id: player.id || uuid(),
            name: player.name,
            initiative: 0, // Sera roulé plus tard
            ac: player.ac || 10,
            currentHp: player.currentHp || player.maxHp || 10,
            maxHp: player.maxHp || 10,
            isPC: true,
            conditions: [],
            notes: ''
          }));
        
        // Initialiser les participants (monstres)
        const monsterParticipants: EncounterParticipant[] = [];
        
        // Pour chaque type de monstre, créer le nombre approprié d'instances
        (decodedData.monsters || []).forEach(({ monster, quantity }) => {
          for (let i = 0; i < quantity; i++) {
            monsterParticipants.push({
              id: uuid(),
              name: monster.name,
              initiative: 0, // Sera roulé plus tard
              ac: monster.ac || 10,
              currentHp: monster.hp || 10,
              maxHp: monster.hp || 10,
              isPC: false,
              conditions: [],
              notes: '',
              cr: monster.cr,
              type: monster.type,
              size: monster.size,
              alignment: monster.alignment
            });
          }
        });
        
        // Combiner tous les participants
        const allParticipants = [...playerParticipants, ...monsterParticipants];
        
        // Mettre à jour l'état
        setEncounter(currentEncounter => ({
          ...currentEncounter,
          participants: allParticipants
        }));
        
        // Rouler l'initiative pour tous
        setTimeout(() => {
          rollInitiativeForAll();
        }, 500);
      } catch (error) {
        console.error("Erreur lors du décodage des données de rencontre:", error);
      }
    } else if (params.encounterId || searchParams.get('encounterId')) {
      // Nouveau format : charger depuis Firebase/localStorage
      loadSavedEncounter();
    }
  }, [location, params, isAuthenticated]);

  // Si la rencontre est en cours de chargement, afficher un indicateur
  if (isLoadingEncounter) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement de la rencontre...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {encounter.name}
        {encounter.isActive && (
          <Badge className="ml-2 bg-green-600">
            Tour {encounter.round}, Initiative {encounter.currentTurn + 1}/{sortedParticipants.length}
          </Badge>
        )}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <Card>
        <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Participants</span>
                <div>
              <Button 
                variant="outline" 
                size="sm"
                    className="mr-2"
                    onClick={rollInitiativeForAll}
                  >
                    <Dice4 className="h-4 w-4 mr-1" />
                    Initiative
              </Button>
              <Button 
                variant={encounter.isActive ? "destructive" : "default"}
                size="sm"
                onClick={toggleEncounterState}
              >
                {encounter.isActive ? (
                  <>
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                  </>
                ) : (
                  <>
                        <Play className="h-4 w-4 mr-1" />
                    Démarrer
                  </>
                )}
              </Button>
            </div>
              </CardTitle>
              <CardDescription>
                Gérez les personnages et les monstres dans cette rencontre
              </CardDescription>
        </CardHeader>
        
        <CardContent>
              {sortedParticipants.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Aucun participant dans cette rencontre. Ajoutez des personnages ou des monstres pour commencer.
          </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Tour</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead className="w-[80px]">Init</TableHead>
                        <TableHead className="w-[80px]">CA</TableHead>
                        <TableHead className="w-[120px]">PV</TableHead>
                        <TableHead className="w-[180px]">État</TableHead>
                        <TableHead className="w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
            {sortedParticipants.map((participant, index) => (
                        <TableRow 
                key={participant.id} 
                          className={
                            encounter.isActive && sortedParticipants[encounter.currentTurn]?.id === participant.id 
                              ? 'bg-amber-100' 
                              : ''
                          }
                        >
                          <TableCell>
                            {encounter.isActive && sortedParticipants[encounter.currentTurn]?.id === participant.id && (
                              <div className="flex justify-center">
                                <Sword className="h-5 w-5 text-amber-600" />
                      </div>
                    )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {participant.name}
                              {participant.isPC && (
                                <Badge variant="outline" className="ml-2">PC</Badge>
                              )}
                      </div>
                            {participant.notes && (
                              <div className="text-xs text-gray-500">{participant.notes}</div>
                            )}
                          </TableCell>
                          <TableCell>{participant.initiative}</TableCell>
                          <TableCell>{participant.ac}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <div 
                                className="cursor-pointer" 
                                onClick={() => updateHp(participant.id, -1)}
                              >
                                <Minus className="h-4 w-4 text-red-500" />
                              </div>
                              <div 
                                className="font-medium"
                                onClick={() => openHpEditor(participant)}
                              >
                              {participant.currentHp}/{participant.maxHp}
                        </div>
                              <div 
                                className="cursor-pointer"
                                onClick={() => updateHp(participant.id, 1)}
                              >
                                <Plus className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                        <Progress
                          value={(participant.currentHp / participant.maxHp) * 100}
                              className="h-2 mt-1" 
                              indicatorClassName={participant.currentHp <= 0 ? 'bg-gray-500' : participant.currentHp < participant.maxHp / 2 ? 'bg-red-500' : 'bg-green-500'}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {getStatusBadge(participant)}
                    {participant.conditions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {participant.conditions.map(condition => (
                                    <Badge 
                                      key={condition} 
                                      variant="outline" 
                                      className="cursor-pointer text-xs"
                                      onClick={() => toggleCondition(participant.id, condition)}
                                    >
                                      {condition}
                                    </Badge>
                        ))}
                      </div>
                    )}
                              {participant.conditions.length === 0 && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => {
                                    // Ouvrir un dialogue pour choisir des conditions
                                    const condition = prompt('Ajouter une condition:\n' + possibleConditions.join(', '));
                                    if (condition) {
                                      toggleCondition(participant.id, condition);
                                    }
                                  }}
                                >
                                  Ajouter
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {!participant.isPC && (
                        <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => loadMonsterOnDemand(participant.id)}
                                >
                                  <Pencil className="h-4 w-4" />
                        </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  const notes = prompt('Notes pour ' + participant.name, participant.notes);
                                  if (notes !== null) {
                                    updateNotes(participant.id, notes);
                                  }
                                }}
                              >
                                <Square className="h-4 w-4" />
                              </Button>
                        <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeParticipant(participant.id)}
                              >
                                <Skull className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                        </div>
              )}
                        
              <div className="mt-4 flex justify-between">
                          <div>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const dialogOpen = true;
                      setNewPC({
                        name: '',
                        initiative: 10,
                        ac: 15,
                        hp: 30
                      });
                      // Ouvrir un dialogue pour ajouter un personnage
                      const name = prompt('Nom du personnage:');
                      if (name) {
                        setNewPC(prev => ({ ...prev, name }));
                        const initiative = parseInt(prompt('Initiative:', '10') || '10', 10);
                        setNewPC(prev => ({ ...prev, initiative }));
                        const ac = parseInt(prompt('Classe d\'armure:', '15') || '15', 10);
                        setNewPC(prev => ({ ...prev, ac }));
                        const hp = parseInt(prompt('Points de vie:', '30') || '30', 10);
                        setNewPC(prev => ({ ...prev, hp }));
                        
                        // Appeler la fonction avec les nouvelles valeurs
                        addPlayerCharacter();
                      }
                    }}
                  >
                    <User className="h-4 w-4 mr-1" />
                    Ajouter un personnage
                  </Button>
                                  </div>
                <div>
                  {encounter.isActive && (
                                      <Button 
                      onClick={nextTurn}
                      className="mr-2"
                    >
                      <SkipForward className="h-4 w-4 mr-1" />
                      Tour suivant
                                      </Button>
                  )}
                                      <Button 
                                        variant="outline" 
                    onClick={resetEncounter}
                                      >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Réinitialiser
                                      </Button>
                                  </div>
                                </div>
            </CardContent>
          </Card>
                  </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Détails du monstre</CardTitle>
              <CardDescription>
                Informations sur le monstre sélectionné
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDetails ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : currentMonsterDetails ? (
                <SimpleMonsterCard monster={currentMonsterDetails} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Cliquez sur le bouton d'édition à côté d'un monstre pour voir ses détails
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </div>

      {/* Dialogue d'édition des PV */}
      <Dialog open={hpEditorOpen} onOpenChange={setHpEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier les points de vie</DialogTitle>
            <DialogDescription>
              Ajustez les points de vie actuels et maximum de {editingParticipant.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentHp" className="text-right">
                PV actuels
              </Label>
              <Input
                id="currentHp"
                  type="number"
                value={editingParticipant.currentHp}
                onChange={(e) => setEditingParticipant(prev => ({ ...prev, currentHp: parseInt(e.target.value, 10) }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxHp" className="text-right">
                PV maximum
              </Label>
              <Input
                id="maxHp"
                  type="number"
                value={editingParticipant.maxHp}
                onChange={(e) => setEditingParticipant(prev => ({ ...prev, maxHp: parseInt(e.target.value, 10) }))}
                className="col-span-3"
              />
          </div>
          </div>
          <DialogFooter>
            <Button onClick={saveHpChanges}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Boutons flottants pour la sauvegarde */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
            <Button
          size="icon"
          className="rounded-full h-12 w-12 shadow-lg"
          onClick={saveCurrentEncounterState}
          disabled={isSaving}
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : (
            <Save className="h-6 w-6" />
          )}
            </Button>
        
                      <Button
                        variant="outline"
          size="icon"
          className="rounded-full h-12 w-12 shadow-lg"
          onClick={() => window.history.back()}
        >
          <Calendar className="h-6 w-6" />
            </Button>
          </div>
    </div>
  );
};

export default EncounterTracker; 