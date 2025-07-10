import React, { useState, useEffect } from 'react';
import { getParties as getLocalParties, createEncounter, getEncounters as getLocalEncounters, updateEncounter, deleteEncounter as deleteLocalEncounter } from '../lib/api';
import { subscribeToParties, getUserStats, subscribeToEncounters, deleteEncounter as deleteFirestoreEncounter, updateFirestoreEncounter } from '../lib/firebaseApi'; 
import { Monster, Party, Encounter, EncounterMonster, environments, UserStats } from '../lib/types';
import MonsterBrowser from './MonsterBrowser';
import { FaPlus, FaMinus, FaTrash, FaSave, FaEdit, FaDragon } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import { toast } from '../hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { saveEncounter } from "../lib/firebaseApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

// Interface pour la version API locale des rencontres qui utilise Party comme objet complet
interface LocalEncounter extends Omit<Encounter, 'partyId' | 'monsters'> {
  party: Party;
  monsters: EncounterMonster[];
}

const EncounterBuilder: React.FC = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [selectedEncounter, setSelectedEncounter] = useState<any | null>(null);
  const [selectedMonsters, setSelectedMonsters] = useState<EncounterMonster[]>([]);
  const [encounterName, setEncounterName] = useState<string>("");
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showMonsterBrowser, setShowMonsterBrowser] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);

  // Fonction pour charger les statistiques
  const loadUserStats = async () => {
    if (isAuthenticated) {
      try {
        const stats = await getUserStats();
        setUserStats(stats);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      }
    }
  };

  // Charger les données au démarrage
  useEffect(() => {
    // Fonction pour charger les rencontres
    const loadEncounters = () => {
      if (isAuthenticated) {
        // Si l'utilisateur est authentifié, utiliser Firestore avec abonnement
        try {
          const unsubscribeEncounters = subscribeToEncounters((fetchedEncounters) => {
            console.log("Rencontres chargées depuis Firestore:", fetchedEncounters);
            setEncounters(fetchedEncounters);
          });
          
          return unsubscribeEncounters;
        } catch (error) {
          console.error("Erreur lors de l'abonnement aux rencontres:", error);
          // Fallback à localStorage en cas d'erreur
          const localEncounters = getLocalEncounters();
          setEncounters(localEncounters);
        }
      } else {
        // Sinon utiliser localStorage
        const localEncounters = getLocalEncounters();
        setEncounters(localEncounters);
      }
    };

    // Fonction pour charger les groupes
    const loadParties = () => {
      if (isAuthenticated) {
        // Si l'utilisateur est authentifié, utiliser Firestore
        try {
          const unsubscribe = subscribeToParties((fetchedParties) => {
            console.log("Parties chargées depuis Firestore:", fetchedParties);
            setParties(fetchedParties);
          });
          
          return unsubscribe;
        } catch (error) {
          console.error("Erreur lors de l'abonnement aux parties:", error);
          const localParties = getLocalParties();
          setParties(localParties);
        }
      } else {
        // Sinon utiliser localStorage
        const localParties = getLocalParties();
        setParties(localParties);
      }
    };

    // Charger les données
    const unsubscribeEncounters = loadEncounters();
    const unsubscribeParties = loadParties();
    
    // Charger les statistiques utilisateur
    loadUserStats();
    
    // Nettoyage
    return () => {
      if (unsubscribeParties && typeof unsubscribeParties === 'function') {
        unsubscribeParties();
      }
      if (unsubscribeEncounters && typeof unsubscribeEncounters === 'function') {
        unsubscribeEncounters();
      }
    };
  }, [isAuthenticated]);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedParty(null);
    setSelectedEncounter(null);
    setSelectedMonsters([]);
    setEncounterName('');
    setSelectedEnvironment('');
    setIsEditing(false);
  };

  // Sélectionner une rencontre existante
  const handleSelectEncounter = (encounter: LocalEncounter) => {
    console.log("Rencontre sélectionnée:", encounter);
    
    // Vérifier que encounter.monsters existe et est un tableau
    if (!encounter.monsters || !Array.isArray(encounter.monsters)) {
      console.error("Format de monstres invalide:", encounter);
      toast({
        title: "Erreur",
        description: "Format de rencontre invalide. Impossible de charger les monstres.",
        variant: "destructive"
      });
      
      // Créer un tableau vide de monstres pour éviter les erreurs
      const emptyMonsters: EncounterMonster[] = [];
      setSelectedEncounter(encounter);
      setSelectedParty(encounter.party);
      setSelectedMonsters(emptyMonsters);
      setEncounterName(encounter.name);
      setSelectedEnvironment(encounter.environment || '');
      setIsEditing(true);
      return;
    }
    
    // Vérifier et corriger les monstres qui n'ont pas de propriété xp
    const validatedMonsters = encounter.monsters.map(monsterEntry => {
      // Vérifier si monsterEntry est valide
      if (!monsterEntry || !monsterEntry.monster) {
        console.error("Entrée de monstre invalide:", monsterEntry);
        // Créer un monstre par défaut pour éviter les erreurs
        return {
          monster: {
            id: `default-${Math.random().toString(36).substring(7)}`,
            name: "Monstre inconnu",
            xp: 0,
            type: "Inconnu",
            size: "M",
            source: "Default"
          },
          quantity: 1
        };
      }
      
      // Préserver le nom original et le nom du monstre
      const monsterName = monsterEntry.monster.name || "Monstre inconnu";
      const originalName = monsterEntry.monster.originalName || monsterName;
      
      // Si le monstre n'a pas de propriété xp, lui donner une valeur par défaut
      if (monsterEntry.monster && !monsterEntry.monster.xp) {
        console.log("Monstre sans XP trouvé:", monsterName);
        // Calculer l'XP à partir du CR s'il existe
        let estimatedXP = 0;
        if (monsterEntry.monster.cr) {
          // Estimation basique d'XP en fonction du CR
          const cr = monsterEntry.monster.cr;
          if (cr <= 0.25) estimatedXP = 50;
          else if (cr <= 0.5) estimatedXP = 100;
          else if (cr <= 1) estimatedXP = 200;
          else if (cr <= 2) estimatedXP = 450;
          else if (cr <= 4) estimatedXP = 1100;
          else if (cr <= 8) estimatedXP = 3900;
          else if (cr <= 12) estimatedXP = 8400;
          else if (cr <= 16) estimatedXP = 20000;
          else estimatedXP = 32500;
        }
        
        return {
          monster: {
            ...monsterEntry.monster,
            name: monsterName,
            originalName: originalName,
            xp: estimatedXP
          },
          quantity: monsterEntry.quantity || 1
        };
      }
      
      // Vérifier si la quantité est définie
      if (monsterEntry.quantity === undefined) {
        return {
          monster: {
            ...monsterEntry.monster,
            name: monsterName,
            originalName: originalName
          },
          quantity: 1
        };
      }
      
      // S'assurer que le nom et le nom original sont préservés
      return {
        monster: {
          ...monsterEntry.monster,
          name: monsterName,
          originalName: originalName
        },
        quantity: monsterEntry.quantity
      };
    });
    
    console.log("Monstres validés:", validatedMonsters);
    
    setSelectedEncounter(encounter);
    setSelectedParty(encounter.party);
    setSelectedMonsters(validatedMonsters);
    setEncounterName(encounter.name);
    setSelectedEnvironment(encounter.environment || '');
    setIsEditing(true);
  };

  // Ajouter un monstre à la rencontre
  const handleAddMonster = (monster: Monster) => {
    console.log("Ajout du monstre à la rencontre:", monster);
    
    // Vérifier que monster.xp existe, sinon calculer à partir du CR
    if (!monster.xp && monster.cr !== undefined) {
      const xpValue = calculateXPFromCR(parseFloat(monster.cr.toString()));
      console.log(`XP calculé à partir du CR ${monster.cr}: ${xpValue}`);
      monster.xp = xpValue;
    }
    
    // Si nous n'avons pas de valeur XP, attribuer une valeur par défaut basée sur le CR ou 10
    if (!monster.xp) {
      console.log("Pas de valeur XP ou CR disponible, utilisation de la valeur par défaut (10)");
      monster.xp = 10;
    }
    
    // Chercher si ce monstre est déjà dans la liste
    const existingMonsterIndex = selectedMonsters.findIndex(m => m.monster.id === monster.id);
    
    if (existingMonsterIndex !== -1) {
      // Si le monstre existe déjà, augmenter sa quantité
      const updatedMonsters = [...selectedMonsters];
      updatedMonsters[existingMonsterIndex].quantity += 1;
      setSelectedMonsters(updatedMonsters);
    } else {
      // Sinon, ajouter le monstre à la liste en conservant toutes ses propriétés
      setSelectedMonsters([
        ...selectedMonsters,
        {
          monster: {
            ...monster, // Conserver toutes les propriétés du monstre original
            // S'assurer que les propriétés essentielles sont présentes
            id: monster.id || `monster-${Date.now()}`,
            name: monster.name,
            xp: monster.xp,
            type: monster.type || "Inconnu",
            size: monster.size || "M",
            // Valeurs par défaut pour les propriétés de combat si elles n'existent pas
            hp: monster.hp || 10,
            ac: monster.ac || 10,
            speed: monster.speed || { walk: 30 },
            alignment: monster.alignment || "neutre",
            legendary: monster.legendary || false,
            environment: Array.isArray(monster.environment) ? monster.environment : []
          },
          quantity: 1
        }
      ]);
    }
    
    // Fermer le navigateur de monstres après l'ajout
    setShowMonsterBrowser(false);
  };

  // Fonction pour calculer l'XP à partir du CR
  const calculateXPFromCR = (cr: number): number => {
    if (cr <= 0) return 10;
    if (cr <= 0.25) return 50;
    if (cr <= 0.5) return 100;
    if (cr <= 1) return 200;
    if (cr <= 2) return 450;
    if (cr <= 3) return 700;
    if (cr <= 4) return 1100;
    if (cr <= 5) return 1800;
    if (cr <= 6) return 2300;
    if (cr <= 7) return 2900;
    if (cr <= 8) return 3900;
    if (cr <= 9) return 5000;
    if (cr <= 10) return 5900;
    if (cr <= 11) return 7200;
    if (cr <= 12) return 8400;
    if (cr <= 13) return 10000;
    if (cr <= 14) return 11500;
    if (cr <= 15) return 13000;
    if (cr <= 16) return 15000;
    if (cr <= 17) return 18000;
    if (cr <= 18) return 20000;
    if (cr <= 19) return 22000;
    if (cr <= 20) return 25000;
    if (cr <= 21) return 33000;
    if (cr <= 22) return 41000;
    if (cr <= 23) return 50000;
    if (cr <= 24) return 62000;
    if (cr <= 25) return 75000;
    if (cr <= 26) return 90000;
    if (cr <= 27) return 105000;
    if (cr <= 28) return 120000;
    if (cr <= 29) return 135000;
    return 155000;
  };

  // Mettre à jour la quantité d'un monstre
  const handleUpdateMonsterQuantity = (monsterId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Supprimer le monstre si la quantité est 0 ou moins
      setSelectedMonsters(selectedMonsters.filter(m => m.monster.id !== monsterId));
    } else {
      // Mettre à jour la quantité
      setSelectedMonsters(
        selectedMonsters.map(m =>
          m.monster.id === monsterId ? { ...m, quantity: newQuantity } : m
        )
      );
    }
  };

  // Supprimer un monstre de la rencontre
  const handleRemoveMonster = (monsterId: string) => {
    setSelectedMonsters(selectedMonsters.filter(m => m.monster.id !== monsterId));
  };

  // Calculer le total d'XP et l'XP ajusté
  const calculateTotalXP = () => {
    // Vérifier si selectedMonsters est vide
    if (!selectedMonsters || selectedMonsters.length === 0) {
      return { totalXP: 0, adjustedXP: 0 };
    }
    
    // Calculer le total d'XP en vérifiant que monster.xp existe
    const totalXP = selectedMonsters.reduce(
      (sum, { monster, quantity }) => {
        // Vérifier si monster et monster.xp existent
        if (!monster || typeof monster.xp !== 'number') {
          console.warn('Monstre sans XP détecté:', monster);
          return sum;
        }
        return sum + monster.xp * quantity;
      },
      0
    );
    
    // Calculer le nombre total de monstres
    const monsterCount = selectedMonsters.reduce(
      (sum, { quantity }) => sum + quantity,
      0
    );
    
    // Déterminer le multiplicateur
    let multiplier = 1;
    if (selectedParty) {
      const playerCount = selectedParty.players.length;
      
      if (monsterCount === 1) {
        multiplier = 1;
      } else if (monsterCount === 2) {
        multiplier = 1.5;
      } else if (monsterCount >= 3 && monsterCount <= 6) {
        multiplier = 2;
      } else if (monsterCount >= 7 && monsterCount <= 10) {
        multiplier = 2.5;
      } else if (monsterCount >= 11 && monsterCount <= 14) {
        multiplier = 3;
      } else if (monsterCount >= 15) {
        multiplier = 4;
      }
    }
    
    const adjustedXP = Math.floor(totalXP * multiplier);
    
    return { totalXP, adjustedXP };
  };

  // Déterminer la difficulté de la rencontre
  const getDifficulty = () => {
    if (!selectedParty || selectedMonsters.length === 0) {
      return null;
    }
    
    const { adjustedXP } = calculateTotalXP();
    
    // Calculer les seuils de difficulté pour le groupe
    const thresholds = {
      easy: 0,
      medium: 0,
      hard: 0,
      deadly: 0
    };
    
    // Seuils de difficulté par niveau (DMG)
    const xpThresholds: Record<number, Record<string, number>> = {
      1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
      2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
      3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
      4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
      5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
      6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
      7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
      8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
      9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
      10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
      11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
      12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
      13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
      14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
      15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
      16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
      17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
      18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
      19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
      20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 }
    };
    
    // Additionner les seuils pour chaque joueur
    selectedParty.players.forEach(player => {
      const level = Math.min(player.level, 20);
      thresholds.easy += xpThresholds[level].easy;
      thresholds.medium += xpThresholds[level].medium;
      thresholds.hard += xpThresholds[level].hard;
      thresholds.deadly += xpThresholds[level].deadly;
    });
    
    // Déterminer la difficulté
    if (adjustedXP >= thresholds.deadly) {
      return { level: 'deadly', color: 'text-red-600' };
    } else if (adjustedXP >= thresholds.hard) {
      return { level: 'hard', color: 'text-orange-500' };
    } else if (adjustedXP >= thresholds.medium) {
      return { level: 'medium', color: 'text-yellow-500' };
    } else if (adjustedXP >= thresholds.easy) {
      return { level: 'easy', color: 'text-green-500' };
    } else {
      return { level: 'trivial', color: 'text-gray-500' };
    }
  };

  // Calculer l'XP par joueur
  const getXPPerPlayer = () => {
    if (!selectedParty || selectedParty.players.length === 0) return 0;
    
    const { totalXP } = calculateTotalXP();
    return Math.floor(totalXP / selectedParty.players.length);
  };

  const difficulty = getDifficulty();
  const { totalXP, adjustedXP } = calculateTotalXP();

  // Fonction pour lancer la rencontre
  const launchEncounter = async () => {
    try {
      console.log("Lancement de la rencontre...");
      
      // Vérifications
      if (!selectedParty) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un groupe de joueurs.",
          variant: "destructive"
        });
        return;
      }
      
      if (!encounterName) {
        toast({
          title: "Erreur",
          description: "Veuillez donner un nom à votre rencontre.",
          variant: "destructive"
        });
        return;
      }
      
      if (selectedMonsters.length === 0) {
      toast({
          title: "Erreur",
          description: "Veuillez ajouter au moins un monstre à la rencontre.",
          variant: "destructive"
        });
        return;
      }

      // Soit on utilise une rencontre existante, soit on en crée une nouvelle
      let encounterToUse = selectedEncounter;
      
      if (!encounterToUse) {
        console.log("Aucune rencontre sélectionnée, création d'une nouvelle rencontre...");
        // Si aucune rencontre n'est sélectionnée, on sauvegarde d'abord
        const difficultyValue = getDifficulty()?.level;
        const difficultyString = (difficultyValue === 'trivial' ? 'easy' : difficultyValue) as 'easy' | 'medium' | 'hard' | 'deadly';
        const { totalXP: xpTotal, adjustedXP: xpAdjusted } = calculateTotalXP();
        
        // Préparer les données pour la sauvegarde
        const encounterData = {
          name: encounterName,
          monsters: selectedMonsters,
          difficulty: difficultyString,
          totalXP: xpTotal,
          adjustedXP: xpAdjusted,
          environment: selectedEnvironment !== 'all' ? selectedEnvironment : undefined,
          status: 'draft' as const,
          partyId: selectedParty?.id,
          party: selectedParty
        };
        
        try {
          // Sauvegarde en Firebase ou localement selon l'authentification
          if (isAuthenticated) {
            console.log("Tentative de sauvegarde avec Firebase...");
            const savedEncounter = await saveEncounter(encounterData);
            if (savedEncounter) {
              encounterToUse = savedEncounter;
              console.log("Rencontre sauvegardée avec succès dans Firebase:", savedEncounter);
            } else {
              throw new Error("Échec de la sauvegarde de la rencontre");
            }
          } else {
            // Sauvegarde locale si non connecté
            const newEncounterId = uuidv4();
            const newEncounter = {
              ...encounterData,
              id: newEncounterId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            // Ajouter la rencontre à l'état local
            setEncounters([newEncounter, ...encounters]);
            localStorage.setItem(`encounter_${newEncounterId}`, JSON.stringify(newEncounter));
            
            encounterToUse = newEncounter;
            console.log("Rencontre sauvegardée localement:", newEncounter);
          }
        } catch (error) {
          console.error("Erreur lors de la sauvegarde:", error);
          toast({
            title: "Erreur",
            description: "Impossible de sauvegarder la rencontre.",
            variant: "destructive"
          });
          return;
        }
      }
      
      if (!encounterToUse) {
        throw new Error("Données de rencontre non disponibles");
      }
      
      console.log("Lancement de la rencontre avec:", encounterToUse);

      // NOUVELLE APPROCHE: Stocker dans sessionStorage et naviguer avec l'ID uniquement
      // Stocker la rencontre complète avec ses participants initialisés
      const completeEncounterData = {
        id: encounterToUse.id,
        name: encounterToUse.name,
        monsters: selectedMonsters.map(({ monster, quantity }) => ({
          monster: {
            ...monster,
            name: monster.name,
            originalName: monster.originalName || monster.name,
            id: monster.id,
            cr: monster.cr || 0,
            xp: monster.xp || 0,
            type: monster.type || "Inconnu",
            size: monster.size || "M",
            source: monster.source || "Manuel"
          },
          quantity
        })),
        environment: encounterToUse.environment,
        difficulty: encounterToUse.difficulty,
        party: {
          id: selectedParty.id,
          name: selectedParty.name,
          players: selectedParty.players || []
        },
        players: selectedParty.players || [],
        // Ajouter des participants initialisés
        participants: [
          // Participants pour les joueurs
          ...(selectedParty.players || []).map(player => ({
            id: `pc-${player.id}`,
            name: player.name,
            initiative: Math.floor(Math.random() * 20) + 1,
            ac: player.ac || 10,
            currentHp: player.currentHp || player.maxHp || 10,
            maxHp: player.maxHp || 10,
            isPC: true,
            conditions: [],
            notes: `${player.characterClass} niveau ${player.level}`
          })),
          // Participants pour les monstres
          ...selectedMonsters.flatMap(({ monster, quantity }) => 
            Array.from({ length: quantity }, (_, index) => ({
              id: `monster-${monster.id}-${index}`,
              name: monster.name,
              initiative: Math.floor(Math.random() * 20) + 1,
              ac: monster.ac || 10,
              currentHp: monster.hp || 10,
              maxHp: monster.hp || 10,
              isPC: false,
              conditions: [],
              notes: "",
              cr: monster.cr,
              type: monster.type,
              size: monster.size
            }))
          )
        ],
        round: 1,
        currentTurn: 0,
        isActive: false
      };
      
      // Stocker les données complètes en sessionStorage
      sessionStorage.setItem('current_encounter', JSON.stringify(completeEncounterData));
      console.log("Données de rencontre stockées dans sessionStorage");
      
      // Rediriger vers la page d'affrontement avec un identifiant simple
      // Utilisons window.location.href pour une navigation directe au lieu de react-router
      console.log("Tentative de navigation vers /encounter-tracker?source=session");
      window.location.href = '/encounter-tracker?source=session';
      
      toast({
        title: "Rencontre lancée",
        description: "Préparez-vous au combat !",
        variant: "default"
      });
    } catch (error) {
      console.error("Erreur lors du lancement de la rencontre:", error);
      toast({
        title: "Erreur",
        description: "Impossible de lancer la rencontre: " + (error instanceof Error ? error.message : "Erreur inconnue"),
        variant: "destructive"
      });
    }
  };

  // Sauvegarder la rencontre
  const handleSaveEncounter = async () => {
    if (!encounterName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez donner un nom à cette rencontre",
        variant: "destructive"
      });
      return;
    }

    if (!selectedParty) {
      toast({
        title: "Groupe requis",
        description: "Veuillez sélectionner un groupe de joueurs",
        variant: "destructive"
      });
      return;
    }

    if (selectedMonsters.length === 0) {
      toast({
        title: "Monstres requis",
        description: "Veuillez ajouter au moins un monstre à la rencontre",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);

      // Obtenir la difficulté sous forme de string compatible avec l'API
      const difficultyValue = getDifficulty()?.level;
      const difficultyString = (difficultyValue === 'trivial' ? 'easy' : difficultyValue) as 'easy' | 'medium' | 'hard' | 'deadly';

      // Calculer l'XP total et ajusté
      const { totalXP: xpTotal, adjustedXP: xpAdjusted } = calculateTotalXP();

      // Préparer les données de la rencontre
      const encounterData = {
        name: encounterName,
        monsters: selectedMonsters.map(m => ({ 
          monster: m.monster, 
          quantity: m.quantity 
        })),
        difficulty: difficultyString,
        totalXP: xpTotal,
        adjustedXP: xpAdjusted,
        environment: selectedEnvironment !== 'all' ? selectedEnvironment : undefined,
        status: 'draft' as const,
        partyId: selectedParty?.id,
        party: selectedParty
      };

      let savedEncounter = null;

      if (isAuthenticated) {
        console.log("Tentative de sauvegarde avec Firebase...");
      // Sauvegarder dans Firebase
        savedEncounter = await saveEncounter(encounterData);
        
        if (!savedEncounter) {
          throw new Error("Échec de la sauvegarde de la rencontre");
        }
        
        console.log("Rencontre sauvegardée avec succès:", savedEncounter);
      } else {
        // Sauvegarde locale pour les utilisateurs non connectés
        const newEncounterId = selectedEncounter?.id || uuidv4();
        savedEncounter = {
          ...encounterData,
          id: newEncounterId,
          createdAt: selectedEncounter?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Mettre à jour la liste des rencontres
        const updatedEncounters = selectedEncounter 
          ? encounters.map(e => e.id === newEncounterId ? savedEncounter : e)
          : [savedEncounter, ...encounters];
        
        setEncounters(updatedEncounters);
        
        // Sauvegarder dans le localStorage
        localStorage.setItem(`encounter_${newEncounterId}`, JSON.stringify(savedEncounter));
        
        // Mettre à jour la sélection
        setSelectedEncounter(savedEncounter);
        
        console.log("Rencontre sauvegardée localement:", savedEncounter);
      }

        // Fermer le dialogue
        setSaveDialogOpen(false);
        
        toast({
          title: "Rencontre sauvegardée",
          description: `"${encounterName}" a été enregistré avec succès.`,
          variant: "default"
        });
      
      return savedEncounter;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la rencontre:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la rencontre: " + (error instanceof Error ? error.message : "Erreur inconnue"),
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Liste des rencontres */}
      <div className="md:col-span-1 bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Rencontres</h2>
          <div className="flex items-center gap-2">
            {isAuthenticated && userStats && userStats.maxEncounters < 1000 && (
              <span className="text-sm text-gray-600">
                {userStats.encounters}/{userStats.maxEncounters}
              </span>
            )}
          <button
              onClick={resetForm}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Nouvelle
          </button>
          </div>
        </div>
        
        {encounters.length === 0 ? (
          <p className="text-gray-500">Aucune rencontre créée. Créez votre première rencontre !</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {encounters.map(encounter => (
              <li
                key={encounter.id}
                className={`py-2 px-2 cursor-pointer hover:bg-gray-50 flex justify-between items-center ${
                  selectedEncounter?.id === encounter.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSelectEncounter(encounter as LocalEncounter)}
              >
                <div>
                  <span className="font-medium">{encounter.name}</span>
                  <div className="text-sm text-gray-500">
                    Difficulté: <span className={
                      encounter.difficulty === 'deadly' ? 'text-red-600' : 
                                       encounter.difficulty === 'hard' ? 'text-orange-500' :
                      encounter.difficulty === 'medium' ? 'text-yellow-500' : 
                      'text-green-500'
                    }>
                      {encounter.difficulty}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette rencontre ?")) {
                      if (isAuthenticated) {
                        // Supprimer dans Firestore
                        deleteFirestoreEncounter(encounter.id)
                          .then(() => {
                            // La liste sera mise à jour automatiquement via l'abonnement
                            if (selectedEncounter?.id === encounter.id) {
                              resetForm();
                            }
                          })
                          .catch(error => {
                            console.error("Erreur lors de la suppression:", error);
                            toast({
                              title: "Erreur",
                              description: "Impossible de supprimer la rencontre.",
                              variant: "destructive"
                            });
                          });
                      } else {
                        // Supprimer localement
                        deleteLocalEncounter(encounter.id);
                        setEncounters(encounters.filter(e => e.id !== encounter.id));
                        if (selectedEncounter?.id === encounter.id) {
                          resetForm();
                        }
                      }
                    }
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Formulaire de création/édition */}
      <div className="md:col-span-2 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {isEditing ? "Modifier la rencontre" : "Créer une rencontre"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la rencontre</label>
            <input
              type="text"
              value={encounterName}
              onChange={e => setEncounterName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Embuscade gobeline"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Groupe de joueurs</label>
            <select
              value={selectedParty?.id || ''}
              onChange={e => {
                const party = parties.find(p => p.id === e.target.value);
                setSelectedParty(party || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un groupe</option>
              {parties.map(party => (
                <option key={party.id} value={party.id}>
                  {party.name} ({party.players.length} joueurs, niv. {
                    party.players.length > 0
                      ? Math.round(party.players.reduce((sum, p) => sum + p.level, 0) / party.players.length)
                      : '?'
                  })
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Environnement (optionnel)</label>
          <select
            value={selectedEnvironment}
            onChange={e => setSelectedEnvironment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Aucun environnement spécifique</option>
            {environments.filter(env => env.value !== 'all').map(env => (
              <option key={env.value} value={env.value}>
                {env.label}
              </option>
            ))}
          </select>
        </div>

        {/* Monstres sélectionnés */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Monstres</h3>
            <button
              onClick={() => setShowMonsterBrowser(true)}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <FaPlus className="mr-1" /> Ajouter
            </button>
          </div>

          {selectedMonsters.length === 0 ? (
            <p className="text-gray-500">Aucun monstre ajouté. Cliquez sur "Ajouter" pour sélectionner des monstres.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FP</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedMonsters.map(({ monster, quantity }) => (
                  <tr key={monster.id}>
                    <td className="px-3 py-2 whitespace-nowrap">{monster.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{monster.cr}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{monster.xp}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                            onClick={() => {
                              if (quantity > 1) {
                                setSelectedMonsters(
                                  selectedMonsters.map(m =>
                                    m.monster.id === monster.id ? { ...m, quantity: m.quantity - 1 } : m
                                  )
                                );
                              } else {
                                setSelectedMonsters(selectedMonsters.filter(m => m.monster.id !== monster.id));
                              }
                            }}
                            className="px-1 text-gray-500 hover:text-gray-700"
                        >
                          <FaMinus />
                        </button>
                        <span className="mx-2">{quantity}</span>
                        <button
                            onClick={() => {
                              setSelectedMonsters(
                                selectedMonsters.map(m =>
                                  m.monster.id === monster.id ? { ...m, quantity: m.quantity + 1 } : m
                                )
                              );
                            }}
                            className="px-1 text-gray-500 hover:text-gray-700"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button
                          onClick={() => {
                            setSelectedMonsters(selectedMonsters.filter(m => m.monster.id !== monster.id));
                          }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* Résumé de la rencontre */}
        {selectedParty && selectedMonsters.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h3 className="text-lg font-medium mb-2">Résumé de la rencontre</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>XP total: <span className="font-medium">{totalXP}</span></p>
                <p>XP ajusté: <span className="font-medium">{adjustedXP}</span></p>
                <p>XP par joueur: <span className="font-medium">{getXPPerPlayer()}</span></p>
              </div>
              <div>
                <p>
                  Difficulté: {difficulty && (
                    <span className={`font-medium ${difficulty.color}`}>
                      {difficulty.level.charAt(0).toUpperCase() + difficulty.level.slice(1)}
                    </span>
                  )}
                </p>
                <p>Nombre de monstres: <span className="font-medium">
                  {selectedMonsters.reduce((sum, { quantity }) => sum + quantity, 0)}
                </span></p>
                <p>Multiplicateur: <span className="font-medium">
                  {selectedMonsters.length > 0 ? (adjustedXP / totalXP).toFixed(1) : '1.0'}
                </span></p>
              </div>
            </div>

            {/* Statistiques des joueurs */}
            {selectedParty.players.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-medium mb-2">Personnages</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-1 text-left">Nom</th>
                        <th className="px-2 py-1 text-left">Classe</th>
                        <th className="px-2 py-1 text-left">Niveau</th>
                        <th className="px-2 py-1 text-left">CA</th>
                        <th className="px-2 py-1 text-left">PV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedParty.players.map(player => (
                        <tr key={player.id}>
                          <td className="px-2 py-1">{player.name}</td>
                          <td className="px-2 py-1">{player.characterClass}</td>
                          <td className="px-2 py-1">{player.level}</td>
                          <td className="px-2 py-1">{player.ac || '-'}</td>
                          <td className="px-2 py-1">
                            {player.currentHp !== undefined && player.maxHp !== undefined 
                              ? `${player.currentHp}/${player.maxHp}`
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleSaveEncounter}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            disabled={isSaving}
          >
            <FaSave className="mr-2" />
            {isEditing ? "Mettre à jour" : "Enregistrer"}
          </button>
          
          {/* Bouton pour lancer la rencontre */}
            <button
              onClick={launchEncounter}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
            disabled={!selectedMonsters.length || isSaving}
            >
              <FaDragon className="mr-2" />
            Lancer la rencontre
            </button>
        </div>

        {/* Dialogue de sauvegarde */}
        <div className="flex flex-col gap-4 md:flex-row mt-4">
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full"
                disabled={!selectedMonsters.length || isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                Options de sauvegarde
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Sauvegarder la rencontre</DialogTitle>
                <DialogDescription>
                  Donnez un nom à cette rencontre pour la retrouver facilement.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="encounterName" className="text-right">
                    Nom
                  </Label>
                  <Input
                    id="encounterName"
                    value={encounterName}
                    onChange={(e) => setEncounterName(e.target.value)}
                    className="col-span-3"
                    placeholder="Embuscade gobeline, Combat final, etc."
                  />
                </div>
                {selectedParty ? (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Groupe</Label>
                    <div className="col-span-3">
                      <Badge variant="secondary">{selectedParty.name}</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-span-4 text-amber-500 text-sm">
                      Aucun groupe d'aventuriers sélectionné. La rencontre sera sauvegardée sans groupe associé.
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Difficulté</Label>
                  <div className="col-span-3">
                    <Badge className={
                      getDifficulty()?.level === 'easy' ? 'bg-green-500' :
                      getDifficulty()?.level === 'medium' ? 'bg-yellow-500' :
                      getDifficulty()?.level === 'hard' ? 'bg-orange-500' :
                      getDifficulty()?.level === 'deadly' ? 'bg-red-500' :
                      'bg-gray-500'
                    }>
                      {getDifficulty()?.level === 'easy' ? 'Facile' :
                       getDifficulty()?.level === 'medium' ? 'Moyen' :
                       getDifficulty()?.level === 'hard' ? 'Difficile' :
                       getDifficulty()?.level === 'deadly' ? 'Mortel' :
                       'Trivial'}
                    </Badge>
                    <span className="ml-2 text-muted-foreground text-sm">{adjustedXP} XP ajustés</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleSaveEncounter}
                  disabled={isSaving || !encounterName.trim()}
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Sauvegarde...
                    </>
                  ) : (
                    'Sauvegarder'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Modal du navigateur de monstres */}
      {showMonsterBrowser && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowMonsterBrowser(false)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Sélectionner un monstre</h2>
                  <button
                    onClick={() => setShowMonsterBrowser(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <MonsterBrowser 
                  onSelectMonster={(monster) => {
                    // Vérifier si le monstre est déjà dans la liste
                    const existingIndex = selectedMonsters.findIndex(m => m.monster.id === monster.id);
                    
                    if (existingIndex >= 0) {
                      // Incrémenter la quantité
                      setSelectedMonsters(
                        selectedMonsters.map((m, idx) => 
                          idx === existingIndex ? { ...m, quantity: m.quantity + 1 } : m
                        )
                      );
                    } else {
                      // Ajouter un nouveau monstre
                      setSelectedMonsters([...selectedMonsters, { monster, quantity: 1 }]);
                    }
                    
                    setShowMonsterBrowser(false);
                  }} 
                  isSelectable={true} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncounterBuilder; 