import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Heart, SkipForward, RefreshCw, Skull, Plus, Minus, Pencil, Square, RotateCcw, Calendar, User, Dice4, Save, Zap, Droplets, Eye, EyeOff, Smile, Users, Link, Snowflake, Clock, Ghost, Anchor, ArrowDown, Brain, Footprints, ShieldX, ChevronLeft, ChevronRight, Scroll } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import SpellBrowser from './SpellBrowser';
import FloatingGrimoireBubble from './FloatingGrimoireBubble';
import { Player } from '../lib/types';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MonsterCard } from './MonsterCard';
import { adaptMonsterDataFormat } from '@/lib/monsterAdapter';
import ActiveCombatantDisplay from './ActiveCombatantDisplay';
import { useDnDBeyondLive } from '@/hooks/useDnDBeyondLive';


import {
  getMonsterFromAideDD,
  getMonsterFromCompleteDB,
  getParties,
  findMonsterInIndex,
  loadMonsterFromIndividualFile
} from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { v4 as uuid } from 'uuid';
import { updateFirestoreEncounter, updatePlayer } from '../lib/firebaseApi';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../auth/AuthContext';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Encounter as EncounterType, EncounterMonster } from '../lib/types';

// Interface pour le dictionnaire de correspondance
interface MonsterNameMapping {
  [key: string]: string;
}

// Interface pour le dictionnaire d'URL
interface UrlMapping {
  [key: string]: string;
}

// Interface pour les monstres
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

// Définir les conditions avec leurs icônes et couleurs
const CONDITIONS = [
  'À terre', 'Assourdi', 'Aveuglé', 'Charmé', 'Empoisonné',
  'Empoigné', 'Entravé', 'Épuisé', 'Étourdi', 'Inconscient',
  'Invisible', 'Neutralisé', 'Pétrifié', 'Effrayé', 'Paralysé',
  'Concentré', 'Béni', 'Maudit', 'Ralenti', 'Hâté'
] as const;

type Condition = typeof CONDITIONS[number];

// Fonction pour obtenir les informations d'une condition
const getConditionInfo = (conditionName: string) => {
  const conditionMap = {
    'À terre': { icon: ArrowDown, color: 'text-orange-600 border-orange-600' },
    'Assourdi': { icon: Users, color: 'text-gray-600 border-gray-600' },
    'Aveuglé': { icon: EyeOff, color: 'text-red-600 border-red-600' },
    'Charmé': { icon: Smile, color: 'text-pink-600 border-pink-600' },
    'Empoisonné': { icon: Droplets, color: 'text-green-600 border-green-600' },
    'Empoigné': { icon: Anchor, color: 'text-brown-600 border-brown-600' },
    'Entravé': { icon: Link, color: 'text-gray-800 border-gray-800' },
    'Épuisé': { icon: Clock, color: 'text-yellow-600 border-yellow-600' },
    'Étourdi': { icon: Brain, color: 'text-purple-600 border-purple-600' },
    'Inconscient': { icon: Ghost, color: 'text-gray-500 border-gray-500' },
    'Invisible': { icon: Eye, color: 'text-blue-400 border-blue-400' },
    'Neutralisé': { icon: ShieldX, color: 'text-red-800 border-red-800' },
    'Pétrifié': { icon: Square, color: 'text-gray-700 border-gray-700' },
    'Effrayé': { icon: Skull, color: 'text-red-700 border-red-700' },
    'Paralysé': { icon: Zap, color: 'text-blue-600 border-blue-600' },
    'Concentré': { icon: Brain, color: 'text-indigo-600 border-indigo-600' },
    'Béni': { icon: Heart, color: 'text-yellow-500 border-yellow-500' },
    'Maudit': { icon: Skull, color: 'text-purple-700 border-purple-700' },
    'Ralenti': { icon: Clock, color: 'text-blue-500 border-blue-500' },
    'Hâté': { icon: Zap, color: 'text-green-500 border-green-500' }
  };

  return conditionMap[conditionName as keyof typeof conditionMap] || { icon: Square, color: 'text-gray-500 border-gray-500' };
};

// Interface pour les participants de la rencontre
interface EncounterParticipant {
  id: string;
  name: string;
  initiative: number;
  initiativeModifier?: number; // Ajout du modificateur d'initiative
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
  // Gestion des actions par tour
  hasUsedAction?: boolean;
  hasUsedBonusAction?: boolean;
  hasUsedReaction?: boolean;
  remainingMovement?: number;
}

// Interface pour les personnages joueurs
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
  console.log("EncounterTracker: Composant monté");
  console.log("EncounterTracker: URL actuelle:", window.location.href);

  // État de la rencontre
  const [encounter, setEncounter] = useState<{
    name: string;
    participants: EncounterParticipant[];
    currentTurn: number;
    round: number;
    party?: { id: string; name: string };
  }>({
    name: 'Rencontre',
    participants: [],
    currentTurn: 0,
    round: 1
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

  // État pour l'édition rapide des PV
  const [hpModifierValue, setHpModifierValue] = useState<number>(1);
  const [showHpModifier, setShowHpModifier] = useState<string | null>(null);

  // État pour le dialogue d'édition de l'initiative
  const [initiativeDialogOpen, setInitiativeDialogOpen] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState<{
    id: string;
    name: string;
    initiative: number;
    modifier: number;
  }>({
    id: '',
    name: '',
    initiative: 0,
    modifier: 0
  });

  // État pour le dialogue d'édition des notes
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState<{
    id: string;
    name: string;
    notes: string;
  }>({
    id: '',
    name: '',
    notes: ''
  });

  // État pour stocker le dictionnaire de correspondance des noms
  const [monsterNameMap, setMonsterNameMap] = useState<MonsterNameMapping>({});

  // État pour stocker les mappings d'URL
  const [urlMap, setUrlMap] = useState<UrlMapping>({});

  // États pour gérer les détails des monstres
  const [monsterDetails, setMonsterDetails] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [currentMonsterDetails, setCurrentMonsterDetails] = useState<any>(null);

  // État pour l'iframe des créatures
  const [selectedCreatureUrl, setSelectedCreatureUrl] = useState<string | null>(null);
  const [showCreatureFrame, setShowCreatureFrame] = useState<boolean>(false);

  // État pour le mode édition rapide d'initiative
  const [quickInitiativeMode, setQuickInitiativeMode] = useState<boolean>(false);
  const [isLoadingEncounter, setIsLoadingEncounter] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Ajouter une référence pour suivre si un chargement est déjà en cours
  const loadingRef = useRef<boolean>(false);

  // État pour le participant sélectionné manuellement (click-to-select)
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  // État pour le grimoire
  const [grimoireOpen, setGrimoireOpen] = useState(false);

  // Hooks pour la navigation et les paramètres
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ encounterId?: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fonction pour extraire la valeur numérique des PV depuis une chaîne comme "51 (6d10 + 18)"
  const extractNumericHP = (hpValue: any): number => {
    if (typeof hpValue === 'number') {
      return hpValue;
    }
    if (typeof hpValue === 'string') {
      const match = hpValue.match(/^(\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return 10; // Valeur par défaut
  };

  // Afficher un badge de statut pour la créature
  const getStatusBadge = (participant: EncounterParticipant) => {
    const numericMaxHp = extractNumericHP(participant.maxHp);
    const hpPercentage = (participant.currentHp / numericMaxHp) * 100;

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
    // Éviter de recharger si les données sont déjà présentes
    if (encounter.participants.length > 0) {
      console.log("Données déjà présentes, pas de rechargement nécessaire");
      return;
    }

    console.log("=== CHARGEMENT DES DONNÉES DE RENCONTRE ===");
    console.log("URL de la page:", window.location.href);
    console.log("Paramètres:", params);
    console.log("Utilisateur authentifié:", isAuthenticated);
    console.log("User:", user);

    // Ajout d'un délai pour s'assurer que sessionStorage est chargé
    const timeoutId = setTimeout(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const source = searchParams.get('source');

      try {
        // Cas 1: Données stockées dans sessionStorage
        if (source === 'session') {
          console.log("Chargement des données depuis sessionStorage");
          const sessionData = sessionStorage.getItem('current_encounter');
          console.log("Données brutes sessionStorage:", sessionData);

          if (!sessionData) {
            console.error("Aucune donnée trouvée dans sessionStorage");
            toast({
              title: "Erreur de chargement",
              description: "Aucune donnée de rencontre trouvée. Veuillez créer une nouvelle rencontre.",
              variant: "destructive"
            });
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
                round: parsedData.round || 1
              });

              // Charger automatiquement les vraies données des monstres dès le début
              setTimeout(async () => {
                const monsterParticipants = parsedData.participants.filter((p: any) => !p.isPC);
                console.log(`Chargement des vraies données pour ${monsterParticipants.length} monstres`);

                for (const participant of monsterParticipants) {
                  await loadRealMonsterData(participant.id);
                }
              }, 100); // Réduire le délai pour un chargement plus rapide

              toast({
                title: "Rencontre chargée",
                description: `${parsedData.name} a été chargée avec succès`,
                variant: "default"
              });

              return;
            }
          } catch (jsonError) {
            console.error("Erreur lors du parsing des données JSON:", jsonError);
            toast({
              title: "Erreur de parsing",
              description: "Les données de rencontre sont corrompues.",
              variant: "destructive"
            });
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

      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les données de rencontre.",
          variant: "destructive"
        });
      }
    }, 500); // Délai de 500ms pour s'assurer que tout est initialisé

    // Nettoyer le timeout si le composant est démonté
    return () => clearTimeout(timeoutId);
  }, [params.encounterId]);

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

  // Charger automatiquement les données des monstres dès qu'ils sont ajoutés
  useEffect(() => {
    const monsterParticipants = encounter.participants.filter(p => !p.isPC);

    if (monsterParticipants.length > 0) {
      // Vérifier si certains monstres ont encore les valeurs par défaut
      const monstersWithDefaultValues = monsterParticipants.filter(p =>
        p.maxHp === 10 && p.ac === 10
      );

      if (monstersWithDefaultValues.length > 0) {
        console.log(`Chargement automatique des données pour ${monstersWithDefaultValues.length} monstres`);

        // Charger les données avec un petit délai pour éviter les appels simultanés
        setTimeout(async () => {
          for (const participant of monstersWithDefaultValues) {
            await loadRealMonsterData(participant.id);
          }
        }, 200);
      }
    }
  }, [encounter.participants.length]); // Se déclenche quand le nombre de participants change

  // Trier les participants par initiative (décroissante) avec useMemo pour optimiser les performances
  const sortedParticipants = useMemo(() => {
    return [...encounter.participants].sort((a, b) => b.initiative - a.initiative);
  }, [encounter.participants]);

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

  // Gérer les points de vie (permettre le dépassement du maximum)
  const updateHp = (id: string, amount: number) => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p => {
        if (p.id === id) {
          // Permettre le dépassement du maximum mais pas en dessous de 0
          const newHp = Math.max(0, p.currentHp + amount);
          return { ...p, currentHp: newHp };
        }
        return p;
      })
    }));
  };

  // Activer la synchro D&D Beyond Live
  useDnDBeyondLive({
    participants: encounter.participants,
    onUpdateHp: (id, currentHp, maxHp) => {
      setEncounter(prev => ({
        ...prev,
        participants: prev.participants.map(p =>
          p.id === id ? { ...p, currentHp, maxHp } : p
        )
      }));
    },
    enabled: true // Toujours activé si des IDs sont présents
  });

  // Ouvrir l'éditeur de points de vie

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
          // S'assurer que les valeurs sont valides (permettre le dépassement des PV max)
          const newMaxHp = Math.max(1, editingParticipant.maxHp);
          const newCurrentHp = Math.max(0, editingParticipant.currentHp); // Pas de limite max

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

  // Fonction pour sauvegarder les modifications d'initiative
  const saveInitiativeChanges = () => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === editingInitiative.id
          ? {
            ...p,
            initiative: editingInitiative.initiative,
            initiativeModifier: editingInitiative.modifier
          }
          : p
      ).sort((a, b) => b.initiative - a.initiative) // Re-trier par initiative
    }));

    setInitiativeDialogOpen(false);

    toast({
      title: "Initiative mise à jour",
      description: `${editingInitiative.name} : Initiative ${editingInitiative.initiative} (modificateur ${editingInitiative.modifier >= 0 ? '+' : ''}${editingInitiative.modifier})`,
      variant: "default"
    });
  };

  // Fonction pour ouvrir l'éditeur d'initiative
  const openInitiativeEditor = (participant: EncounterParticipant) => {
    setEditingInitiative({
      id: participant.id,
      name: participant.name,
      initiative: participant.initiative,
      modifier: participant.initiativeModifier || estimateDexModifier(participant)
    });
    setInitiativeDialogOpen(true);
  };

  // Lier un ID D&D Beyond à un participant existant
  const handleLinkDndBeyond = (id: string, url: string) => {
    try {
      const idMatch = url.match(/\/characters\/(\d+)/);
      if (!idMatch) {
        toast({
          title: "URL invalide",
          description: "Format attendu: https://www.dndbeyond.com/characters/123456",
          variant: "destructive"
        });
        return;
      }

      const dndBeyondId = idMatch[1];

      setEncounter(prev => ({
        ...prev,
        participants: prev.participants.map(p =>
          p.id === id ? { ...p, dndBeyondId } : p
        )
      }));

      // Sauvegarder de manière persistante si c'est un joueur d'un groupe
      if (id.startsWith('pc-') && encounter.party) {
        const realPlayerId = id.replace('pc-', '');
        updatePlayer(encounter.party.id, realPlayerId, { dndBeyondId })
          .then(() => console.log("Lien D&D Beyond sauvegardé pour le futur"))
          .catch(err => console.error("Erreur sauvegarde lien D&D Beyond", err));
      }

      toast({
        title: "Lien établi et sauvegardé",
        description: "La synchronisation est active et mémorisée pour le futur."
      });

    } catch (e) {
      console.error("Erreur de lien D&D Beyond", e);
    }
  };

  // Fonction pour déplacer un participant dans l'ordre d'initiative
  const moveParticipant = (participantId: string, direction: 'up' | 'down') => {
    setEncounter(prev => {
      const participants = [...prev.participants];
      const currentIndex = participants.findIndex(p => p.id === participantId);

      if (currentIndex === -1) return prev;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= participants.length) return prev;

      // Échanger les participants
      [participants[currentIndex], participants[newIndex]] = [participants[newIndex], participants[currentIndex]];

      return {
        ...prev,
        participants
      };
    });

    toast({
      title: "Ordre d'initiative modifié",
      description: `L'ordre d'initiative a été ajusté.`,
      variant: "default"
    });
  };

  // Fonction pour charger une rencontre sauvegardée
  const loadSavedEncounter = async () => {
    if (!params.encounterId) {
      console.error("Aucun ID de rencontre fourni");
      return;
    }

    setIsLoadingEncounter(true);
    try {
      if (isAuthenticated) {
        // Charger depuis Firestore avec la bonne référence de collection
        const docRef = doc(db, 'users', user.uid, 'encounters', params.encounterId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const encounterData = docSnap.data() as EncounterType;

          // Si la rencontre n'a pas de participants initialisés, les créer à partir des données
          let participants = encounterData.participants || [];

          // Si pas de participants mais qu'il y a des monstres et un groupe, les initialiser
          if (participants.length === 0 && encounterData.monsters && encounterData.party) {
            console.log("Initialisation des participants à partir des données de rencontre");

            // Participants pour les joueurs
            const playerParticipants = (encounterData.party.players || []).map(player => {
              const maxHp = player.maxHp || 10;
              return {
                id: `pc-${player.id}`,
                name: player.name,
                initiative: Math.floor(Math.random() * 20) + 1,
                ac: player.ac || 10,
                currentHp: player.currentHp || maxHp,
                maxHp: maxHp,
                isPC: true,
                conditions: [],
                notes: `${player.characterClass} niveau ${player.level}`,
                // Mapping des stats étendues
                str: player.str,
                dex: player.dex,
                con: player.con,
                int: player.int,
                wis: player.wis,
                cha: player.cha,
                speed: player.speed,
                initiativeModifier: player.initiative, // Bonus d'initiative spécifique
                dndBeyondId: player.dndBeyondId
              };
            });

            // Participants pour les monstres
            const monsterParticipants = encounterData.monsters.flatMap(({ monster, quantity }) =>
              Array.from({ length: quantity }, (_, index) => {
                const maxHp = monster.hp || 10;
                return {
                  id: `monster-${monster.id}-${index}`,
                  name: monster.name,
                  initiative: Math.floor(Math.random() * 20) + 1,
                  ac: monster.ac || 10,
                  currentHp: maxHp,
                  maxHp: maxHp,
                  isPC: false,
                  conditions: [],
                  notes: "",
                  cr: monster.cr,
                  type: monster.type,
                  size: monster.size
                };
              })
            );

            participants = [...playerParticipants, ...monsterParticipants];
          }

          // Convertir les données de Firestore au format EncounterTracker
          setEncounter({
            name: encounterData.name,
            participants: participants,
            currentTurn: encounterData.currentTurn || 0,
            round: encounterData.round || 1,

          });

          toast({
            title: "Rencontre chargée",
            description: `Rencontre "${encounterData.name}" chargée avec succès.`,
            variant: "default"
          });
        } else {
          throw new Error("Rencontre non trouvée");
        }
      } else {
        // Charger depuis localStorage - essayer d'abord avec la clé spécifique
        let encounterData = null;

        // Essayer la clé spécifique d'abord
        const specificEncounter = localStorage.getItem(`encounter_${params.encounterId}`);
        if (specificEncounter) {
          encounterData = JSON.parse(specificEncounter);
        } else {
          // Sinon chercher dans la liste générale
          const savedEncounters = JSON.parse(localStorage.getItem('dnd_encounters') || '[]');
          encounterData = savedEncounters.find((e: any) => e.id === params.encounterId);
        }

        if (encounterData) {
          // Si la rencontre n'a pas de participants initialisés, les créer à partir des données
          let participants = encounterData.participants || [];

          // Si pas de participants mais qu'il y a des monstres et un groupe, les initialiser
          if (participants.length === 0 && encounterData.monsters && encounterData.party) {
            console.log("Initialisation des participants à partir des données de rencontre (localStorage)");

            // Participants pour les joueurs
            const playerParticipants = (encounterData.party.players || []).map(player => {
              const maxHp = player.maxHp || 10;
              return {
                id: `pc-${player.id}`,
                name: player.name,
                initiative: Math.floor(Math.random() * 20) + 1,
                ac: player.ac || 10,
                currentHp: player.currentHp || maxHp,
                maxHp: maxHp,
                isPC: true,
                conditions: [],
                notes: `${player.characterClass} niveau ${player.level}`,
                // Mapping des stats étendues
                str: player.str,
                dex: player.dex,
                con: player.con,
                int: player.int,
                wis: player.wis,
                cha: player.cha,
                speed: player.speed,
                initiativeModifier: player.initiative, // Bonus d'initiative spécifique
                dndBeyondId: player.dndBeyondId
              };
            });

            // Participants pour les monstres
            const monsterParticipants = encounterData.monsters.flatMap(({ monster, quantity }) =>
              Array.from({ length: quantity }, (_, index) => {
                const maxHp = monster.hp || 10;
                return {
                  id: `monster-${monster.id}-${index}`,
                  name: monster.name,
                  initiative: Math.floor(Math.random() * 20) + 1,
                  ac: monster.ac || 10,
                  currentHp: maxHp,
                  maxHp: maxHp,
                  isPC: false,
                  conditions: [],
                  notes: "",
                  cr: monster.cr,
                  type: monster.type,
                  size: monster.size
                };
              })
            );

            participants = [...playerParticipants, ...monsterParticipants];
          }

          setEncounter({
            name: encounterData.name,
            participants: participants,
            currentTurn: encounterData.currentTurn || 0,
            round: encounterData.round || 1,

          });

          toast({
            title: "Rencontre chargée",
            description: `Rencontre "${encounterData.name}" chargée avec succès.`,
            variant: "default"
          });
        } else {
          throw new Error("Rencontre non trouvée dans localStorage");
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la rencontre:", error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger la rencontre sauvegardée.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingEncounter(false);
    }
  };

  // Fonction pour ouvrir l'éditeur de notes
  const openNotesEditor = (participant: EncounterParticipant) => {
    setEditingNotes({
      id: participant.id,
      name: participant.name,
      notes: participant.notes
    });
    setNotesDialogOpen(true);
  };

  // Fonction pour sauvegarder les modifications de notes
  const saveNotesChanges = () => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === editingNotes.id
          ? { ...p, notes: editingNotes.notes }
          : p
      )
    }));

    setNotesDialogOpen(false);

    toast({
      title: "Notes mises à jour",
      description: `Notes de ${editingNotes.name} mises à jour.`,
      variant: "default"
    });
  };

  // Fonction pour sauvegarder l'état actuel de la rencontre
  const saveCurrentEncounterState = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sauvegarde impossible",
        description: "Vous devez être connecté pour sauvegarder une rencontre.",
        variant: "destructive"
      });
      return;
    }

    // Vérifier qu'on a un ID de rencontre
    if (!params.encounterId) {
      toast({
        title: "Sauvegarde impossible",
        description: "Aucun ID de rencontre disponible pour la sauvegarde.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const encounterData = {
        name: encounter.name,
        participants: encounter.participants,
        currentTurn: encounter.currentTurn,
        round: encounter.round,
        // isActive supprimé
        environment: '',
        notes: ''
      };

      // Utiliser l'ID de la rencontre au lieu du nom
      await updateFirestoreEncounter(params.encounterId, encounterData);

      toast({
        title: "Rencontre sauvegardée",
        description: "L'état de la rencontre a été sauvegardé avec succès.",
        variant: "default"
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder la rencontre.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour réinitialiser les actions lors du changement de tour
  const resetActionsForParticipant = (participantId: string) => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p => {
        if (p.id === participantId) {
          return {
            ...p,
            hasUsedAction: false,
            hasUsedBonusAction: false,
            hasUsedReaction: false,
            remainingMovement: calculateMovementSpeed(p)
          };
        }
        return p;
      })
    }));
  };

  // Calculer la vitesse de déplacement en cases (1 case = 1,5 mètre)
  const calculateMovementSpeed = (participant: EncounterParticipant): number => {
    if (!participant.speed || participant.speed.length === 0) {
      // Valeur par défaut : 6 cases (9 mètres)
      return 6;
    }

    // Essayer de trouver la vitesse de base dans le format "X m" ou "X ft"
    const speedText = participant.speed[0];
    const speedMatch = speedText.match(/(\d+)\s*(?:m|ft)/);

    if (speedMatch && speedMatch[1]) {
      const speedInMeters = parseInt(speedMatch[1], 10);
      // Convertir en cases (arrondir au plus proche)
      return Math.round(speedInMeters / 1.5);
    }

    // Si aucune information, retourner une valeur par défaut
    return 6;
  };

  // Marquer une action comme utilisée
  const useAction = (participantId: string, actionType: 'action' | 'bonusAction' | 'reaction') => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p => {
        if (p.id === participantId) {
          switch (actionType) {
            case 'action':
              return { ...p, hasUsedAction: true };
            case 'bonusAction':
              return { ...p, hasUsedBonusAction: true };
            case 'reaction':
              return { ...p, hasUsedReaction: true };
            default:
              return p;
          }
        }
        return p;
      })
    }));

    toast({
      title: `${actionType === 'action' ? 'Action' : actionType === 'bonusAction' ? 'Action bonus' : 'Réaction'} utilisée`,
      description: `${encounter.participants.find(p => p.id === participantId)?.name} a utilisé son ${actionType === 'action' ? 'action' : actionType === 'bonusAction' ? 'action bonus' : 'réaction'} pour ce tour.`
    });
  };

  // Utiliser une partie du mouvement
  const useMovement = (participantId: string, distance: number) => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p => {
        if (p.id === participantId) {
          const newMovement = Math.max(0, (p.remainingMovement || 0) - distance);
          return { ...p, remainingMovement: newMovement };
        }
        return p;
      })
    }));
  };

  // Fonction pour charger les vraies données des monstres
  const loadRealMonsterData = async (participantId: string): Promise<void> => {
    const participant = encounter.participants.find(p => p.id === participantId);
    if (!participant || participant.isPC) return;

    try {
      console.log(`Chargement des vraies données pour ${participant.name}`);

      // Charger les données complètes du monstre depuis AideDD
      const monsterDetails = await findMonsterDetails(participant.name, false);

      if (monsterDetails && monsterDetails.hp) {
        // Extraire la valeur numérique des PV depuis la chaîne "51 (6d10 + 18)"
        let realMaxHp = 10; // Valeur par défaut

        if (typeof monsterDetails.hp === 'string') {
          // Chercher le premier nombre dans la chaîne (avant la parenthèse)
          const hpMatch = monsterDetails.hp.match(/^(\d+)/);
          if (hpMatch) {
            realMaxHp = parseInt(hpMatch[1], 10);
          }
        } else if (typeof monsterDetails.hp === 'number') {
          realMaxHp = monsterDetails.hp;
        }

        console.log(`PV réels trouvés pour ${participant.name}: ${realMaxHp} (source: ${monsterDetails.hp})`);

        // Extraire la CA numérique aussi
        let realAC = participant.ac;
        if (monsterDetails.ac) {
          if (typeof monsterDetails.ac === 'string') {
            const acMatch = monsterDetails.ac.match(/(\d+)/);
            if (acMatch) {
              realAC = parseInt(acMatch[1], 10);
            }
          } else if (typeof monsterDetails.ac === 'number') {
            realAC = monsterDetails.ac;
          }
        }

        // Mettre à jour le participant avec les vraies données
        setEncounter(prev => ({
          ...prev,
          participants: prev.participants.map(p => {
            if (p.id === participantId) {
              return {
                ...p,
                maxHp: realMaxHp, // Stocker comme nombre
                currentHp: p.currentHp === 10 ? realMaxHp : p.currentHp, // Si c'est la valeur par défaut (10), utiliser les vrais PV max
                ac: realAC,
                str: monsterDetails.str || p.str,
                dex: monsterDetails.dex || p.dex,
                con: monsterDetails.con || p.con,
                int: monsterDetails.int || p.int,
                wis: monsterDetails.wis || p.wis,
                cha: monsterDetails.cha || p.cha,
                actions: monsterDetails.actions || [],
                traits: monsterDetails.traits || []
              };
            }
            return p;
          })
        }));
      }
    } catch (error) {
      console.error(`Erreur lors du chargement des données pour ${participant.name}:`, error);
    }
  };

  // Fonction pour charger toutes les données des monstres dès le début
  const loadAllMonsterData = async (): Promise<void> => {
    try {
      console.log("Chargement des vraies données de tous les monstres...");
      const monsterParticipants = encounter.participants.filter(p => !p.isPC);

      if (monsterParticipants.length === 0) {
        console.log("Aucun monstre à charger");
        return;
      }

      // Charger les données de tous les monstres en parallèle
      const loadPromises = monsterParticipants.map(participant =>
        loadRealMonsterData(participant.id)
      );

      await Promise.all(loadPromises);

      console.log(`Données chargées pour ${monsterParticipants.length} monstres`);

      toast({
        title: "Données des monstres chargées",
        description: `${monsterParticipants.length} monstres ont été mis à jour avec leurs vraies valeurs.`
      });
    } catch (error) {
      console.error("Erreur lors du chargement des données des monstres:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des monstres",
        variant: "destructive"
      });
    }
  };

  // Fonction pour initialiser les données de combat (actions réinitialisées)
  const initializeCombatData = async (): Promise<void> => {
    try {
      // Initialiser l'ordre d'initiative s'il n'est pas déjà fait
      if (encounter.participants.every(p => p.initiative === 0)) {
        await rollInitiativeForAll();
      }

      // Charger les vraies données des monstres
      await loadAllMonsterData();

      // Initialiser les actions pour tous les participants
      setEncounter(prev => ({
        ...prev,
        participants: prev.participants.map(p => ({
          ...p,
          hasUsedAction: false,
          hasUsedBonusAction: false,
          hasUsedReaction: false,
          remainingMovement: calculateMovementSpeed(p)
        }))
      }));

      toast({
        title: "Combat initialisé",
        description: "Le combat a été initialisé avec les vraies données des monstres."
      });
    } catch (error) {
      console.error("Erreur lors de l'initialisation du combat:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser le combat",
        variant: "destructive"
      });
    }
  };

  // Composant ActionTracker supprimé - plus d'affichage des actions sous les participants

  // Réinitialiser la rencontre
  const resetEncounter = () => {
    setEncounter(prev => ({
      ...prev,
      currentTurn: 0,
      round: 1,
      participants: prev.participants.map(p => ({
        ...p,
        currentHp: p.maxHp,
        conditions: [],
        hasUsedAction: false,
        hasUsedBonusAction: false,
        hasUsedReaction: false,
        remainingMovement: calculateMovementSpeed(p)
      }))
    }));

    // Fermer l'iframe lors du reset
    setShowCreatureFrame(false);
    setSelectedCreatureUrl(null);
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
      // Calculer le modificateur d'initiative
      const dexMod = participant.dex ? Math.floor((participant.dex - 10) / 2) : 0;
      const initiativeModifier = participant.isPC
        ? estimateDexModifier(participant)
        : dexMod;

      // Lancer le dé d'initiative
      const diceRoll = Math.floor(Math.random() * 20) + 1;
      const newInitiative = diceRoll + initiativeModifier;

      return {
        ...participant,
        initiative: newInitiative,
        initiativeModifier
      };
    });

    // Trier les participants par initiative (du plus haut au plus bas)
    const sortedParticipants = [...updatedParticipants].sort((a, b) => {
      // Priorité à l'initiative la plus élevée
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;

      // En cas d'égalité, priorité au modificateur de DEX le plus élevé
      const aDexMod = a.dex ? Math.floor((a.dex - 10) / 2) : 0;
      const bDexMod = b.dex ? Math.floor((b.dex - 10) / 2) : 0;

      return bDexMod - aDexMod;
    });

    setEncounter(prev => ({
      ...prev,
      participants: sortedParticipants,
      currentTurn: 0 // Réinitialiser le tour au début
    }));

    toast({
      title: "Initiative lancée pour tous",
      description: `${updatedParticipants.length} participants ont lancé l'initiative et ont été triés`
    });
  };

  // Fonction pour estimer le modificateur de Dextérité basé sur la classe et le niveau
  const estimateDexModifier = (participant: EncounterParticipant): number => {
    if (!participant.isPC) {
      // Pour les monstres, utiliser le modificateur de DEX réel
      return participant.dex ? Math.floor((participant.dex - 10) / 2) : 0;
    }

    // Pour les PJs, utiliser le modificateur explicite s'il existe
    if (participant.initiativeModifier !== undefined) {
      return participant.initiativeModifier;
    }

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

  // Fonction pour ouvrir l'iframe de la créature depuis aidedd.org
  const openCreatureFrame = (participantId: string) => {
    const participant = encounter.participants.find(p => p.id === participantId);
    if (!participant || participant.isPC) return;

    const monsterSlug = getAideDDMonsterSlug(participant.name);
    const creatureUrl = `https://www.aidedd.org/dnd/monstres.php?vf=${monsterSlug}`;

    setSelectedCreatureUrl(creatureUrl);
    setShowCreatureFrame(true);

    // Charger aussi les détails pour la carte locale
    loadMonsterOnDemand(participantId);
  };

  // Modifier la fonction nextTurn pour réinitialiser les actions
  const nextTurn = () => {
    if (sortedParticipants.length === 0) return;

    // Trouver le prochain participant actif (ignorer les morts)
    let nextParticipantIndex = encounter.currentTurn;
    let newRound = encounter.round;

    // Initialiser le combat si on est au premier tour (sans recharger les données des monstres)
    if (encounter.round === 1 && encounter.currentTurn === 0) {
      // Juste initialiser les actions, les données des monstres sont déjà chargées
      setEncounter(prev => ({
        ...prev,
        participants: prev.participants.map(p => ({
          ...p,
          hasUsedAction: false,
          hasUsedBonusAction: false,
          hasUsedReaction: false,
          remainingMovement: calculateMovementSpeed(p)
        }))
      }));
    }

    // Parcourir les participants jusqu'à trouver un participant vivant
    let participantsChecked = 0;
    do {
      nextParticipantIndex = (nextParticipantIndex + 1) % sortedParticipants.length;
      participantsChecked++;

      // Si on a fait le tour complet sans trouver de participant vivant, incrémenter le tour
      if (nextParticipantIndex === 0) {
        newRound++;
      }

      // Éviter une boucle infinie si tous les participants sont morts
      if (participantsChecked > sortedParticipants.length) {
        toast({
          title: "Fin de la rencontre",
          description: "Tous les participants sont hors combat",
          variant: "destructive"
        });
        return;
      }
    } while (sortedParticipants[nextParticipantIndex].currentHp <= 0);

    // Réinitialiser les actions du nouveau participant actif
    const nextParticipantId = sortedParticipants[nextParticipantIndex].id;
    resetActionsForParticipant(nextParticipantId);

    // Réinitialiser la sélection manuelle quand on change de tour
    setSelectedParticipantId(null);

    // Mettre à jour l'état
    setEncounter(prev => ({
      ...prev,
      currentTurn: nextParticipantIndex,
      round: newRound
    }));

    // Charger automatiquement l'iframe et les détails du monstre actif s'il n'est pas un PJ
    const activeParticipant = sortedParticipants[nextParticipantIndex];
    if (!activeParticipant.isPC) {
      openCreatureFrame(activeParticipant.id);
    } else {
      // Si c'est un PJ, fermer l'iframe
      setShowCreatureFrame(false);
      setSelectedCreatureUrl(null);
    }
  };

  // Fonction pour aller au tour précédent
  const previousTurn = () => {
    if (sortedParticipants.length === 0) return;

    // Trouver le participant précédent actif (ignorer les morts)
    let prevParticipantIndex = encounter.currentTurn;
    let newRound = encounter.round;

    // Parcourir les participants jusqu'à trouver un participant vivant
    let participantsChecked = 0;
    do {
      prevParticipantIndex = prevParticipantIndex === 0 ? sortedParticipants.length - 1 : prevParticipantIndex - 1;
      participantsChecked++;

      // Si on revient au dernier participant, décrémenter le tour (si on n'est pas déjà au tour 1)
      if (prevParticipantIndex === sortedParticipants.length - 1 && newRound > 1) {
        newRound--;
      }

      // Éviter une boucle infinie si tous les participants sont morts
      if (participantsChecked > sortedParticipants.length) {
        return;
      }
    } while (sortedParticipants[prevParticipantIndex].currentHp <= 0);

    // Réinitialiser les actions du participant précédent
    const prevParticipantId = sortedParticipants[prevParticipantIndex].id;
    resetActionsForParticipant(prevParticipantId);

    // Réinitialiser la sélection manuelle quand on change de tour
    setSelectedParticipantId(null);

    // Mettre à jour l'état
    setEncounter(prev => ({
      ...prev,
      currentTurn: prevParticipantIndex,
      round: newRound
    }));

    // Charger automatiquement l'iframe et les détails du monstre actif s'il n'est pas un PJ
    const activeParticipant = sortedParticipants[prevParticipantIndex];
    if (!activeParticipant.isPC) {
      openCreatureFrame(activeParticipant.id);
    } else {
      // Si c'est un PJ, fermer l'iframe
      setShowCreatureFrame(false);
      setSelectedCreatureUrl(null);
    }
  };

  // Améliorer l'affichage des détails du monstre
  const SimpleMonsterCard = ({ monster }: { monster: any }) => {
    // Fonction utilitaire pour obtenir le modificateur à partir d'une valeur de caractéristique
    const getAbilityModifier = (value: number): string => {
      if (!value) return "0";
      const modifier = Math.floor((value - 10) / 2);
      return modifier >= 0 ? `+${modifier}` : `${modifier}`;
    };

    return (
      <div className="monster-card">
        <div className="bg-amber-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{monster.name}</h3>
              <p className="text-sm text-gray-600">
                {monster.size} {monster.type}, {monster.alignment}
              </p>
            </div>
            <Badge
              className={`
                ${monster.cr <= 1 ? 'bg-green-100 text-green-800' :
                  monster.cr <= 5 ? 'bg-yellow-100 text-yellow-800' :
                    monster.cr <= 10 ? 'bg-orange-100 text-orange-800' :
                      monster.cr <= 15 ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'}
              `}
            >
              FP {monster.cr}
            </Badge>
          </div>
        </div>

        {/* Statistiques de base */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-100 p-2 rounded text-center">
            <div className="text-sm text-gray-600">Classe d'armure</div>
            <div className="font-bold">{monster.ac}</div>
          </div>
          <div className="bg-gray-100 p-2 rounded text-center">
            <div className="text-sm text-gray-600">Points de vie</div>
            <div className="font-bold">{monster.hp}</div>
          </div>
          <div className="bg-gray-100 p-2 rounded text-center">
            <div className="text-sm text-gray-600">Vitesse</div>
            <div className="font-bold">{Array.isArray(monster.speed) ? monster.speed[0] : monster.speed}</div>
          </div>
        </div>

        {/* Caractéristiques */}
        <div className="grid grid-cols-6 gap-1 mb-4">
          <div className="bg-gray-100 p-2 rounded text-center">
            <div className="text-xs text-gray-600">FOR</div>
            <div className="font-bold">{monster.str}</div>
            <div className="text-xs">{getAbilityModifier(monster.str)}</div>
          </div>
          <div className="bg-gray-100 p-2 rounded text-center">
            <div className="text-xs text-gray-600">DEX</div>
            <div className="font-bold">{monster.dex}</div>
            <div className="text-xs">{getAbilityModifier(monster.dex)}</div>
          </div>
          <div className="bg-gray-100 p-2 rounded text-center">
            <div className="text-xs text-gray-600">CON</div>
            <div className="font-bold">{monster.con}</div>
            <div className="text-xs">{getAbilityModifier(monster.con)}</div>
          </div>
          <div className="bg-gray-100 p-2 rounded text-center">
            <div className="text-xs text-gray-600">INT</div>
            <div className="font-bold">{monster.int}</div>
            <div className="text-xs">{getAbilityModifier(monster.int)}</div>
          </div>
          <div className="bg-gray-100 p-2 rounded text-center">
            <div className="text-xs text-gray-600">SAG</div>
            <div className="font-bold">{monster.wis}</div>
            <div className="text-xs">{getAbilityModifier(monster.wis)}</div>
          </div>
          <div className="bg-gray-100 p-2 rounded text-center">
            <div className="text-xs text-gray-600">CHA</div>
            <div className="font-bold">{monster.cha}</div>
            <div className="text-xs">{getAbilityModifier(monster.cha)}</div>
          </div>
        </div>

        {/* Compétences et capacités */}
        {monster.traits && monster.traits.length > 0 && (
          <div className="mb-4">
            <h4 className="font-bold text-sm uppercase text-gray-600 border-b border-gray-300 pb-1 mb-2">Traits</h4>
            <div className="space-y-2">
              {monster.traits.map((trait: any, index: number) => (
                <div key={index} className="text-sm">
                  <span className="font-bold">{trait.name}.</span> {trait.description}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {monster.actions && monster.actions.length > 0 && (
          <div className="mb-4">
            <h4 className="font-bold text-sm uppercase text-gray-600 border-b border-gray-300 pb-1 mb-2">Actions</h4>
            <div className="space-y-2">
              {monster.actions.map((action: any, index: number) => (
                <div key={index} className="text-sm">
                  <span className="font-bold">{action.name}.</span> {action.description}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions légendaires */}
        {monster.legendaryActions && monster.legendaryActions.length > 0 && (
          <div className="mb-4">
            <h4 className="font-bold text-sm uppercase text-gray-600 border-b border-gray-300 pb-1 mb-2">Actions légendaires</h4>
            <div className="space-y-2">
              {monster.legendaryActions.map((action: any, index: number) => (
                <div key={index} className="text-sm">
                  <span className="font-bold">{action.name}.</span> {action.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full px-4 max-w-[1920px] mx-auto py-2">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold">
            {encounter.name}
            {encounter.participants.length > 0 && (
              <Badge className="ml-2 bg-blue-600">
                Tour {encounter.round}, Initiative {encounter.currentTurn + 1}/{sortedParticipants.length}
              </Badge>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {encounter.participants.filter(p => p.isPC).length} personnages, {encounter.participants.filter(p => !p.isPC).length} monstres
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={rollInitiativeForAll}
          >
            <Dice4 className="h-4 w-4 mr-1" />
            Lancer l'initiative
          </Button>

          {encounter.participants.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={previousTurn}
                disabled={encounter.participants.length === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Tour précédent
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={nextTurn}
                disabled={encounter.participants.length === 0}
              >
                <ChevronRight className="h-4 w-4 mr-1" />
                Tour suivant
              </Button>
            </>
          )}

          {isAuthenticated && params.encounterId && (
            <Button
              variant="outline"
              size="sm"
              onClick={saveCurrentEncounterState}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={resetEncounter}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Résumé du tour actuel */}
      {encounter.participants.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-blue-800">
                Tour de {sortedParticipants[encounter.currentTurn]?.name || "?"}
              </h2>
              <p className="text-sm text-blue-700">
                {sortedParticipants[encounter.currentTurn]?.isPC ? "Personnage joueur" : "Monstre"} •
                Initiative: {sortedParticipants[encounter.currentTurn]?.initiative || "?"} •
                CA: {sortedParticipants[encounter.currentTurn]?.ac || "?"} •
                PV: {sortedParticipants[encounter.currentTurn]?.currentHp || 0}/{extractNumericHP(sortedParticipants[encounter.currentTurn]?.maxHp) || 0}
              </p>
            </div>

            <div className="flex flex-col items-end">
              <div className="text-sm font-semibold text-blue-800">Actions disponibles</div>
              <div className="flex gap-2 mt-1">
                <Badge variant={sortedParticipants[encounter.currentTurn]?.hasUsedAction ? "outline" : "default"}>
                  Action
                </Badge>
                <Badge variant={sortedParticipants[encounter.currentTurn]?.hasUsedBonusAction ? "outline" : "secondary"}>
                  Bonus
                </Badge>
                <Badge variant={sortedParticipants[encounter.currentTurn]?.hasUsedReaction ? "outline" : "destructive"}>
                  Réaction
                </Badge>
                <Badge variant="outline" className="bg-blue-100">
                  Mouvement: {sortedParticipants[encounter.currentTurn]?.remainingMovement || 0}
                </Badge>
              </div>
            </div>
          </div>

          {sortedParticipants[encounter.currentTurn]?.conditions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <div className="text-sm font-semibold text-blue-800">Conditions:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {sortedParticipants[encounter.currentTurn]?.conditions.map(condition => {
                  const conditionInfo = getConditionInfo(condition);
                  const IconComponent = conditionInfo.icon;
                  return (
                    <Badge key={condition} variant="outline" className={`flex items-center gap-1 ${conditionInfo.color}`}>
                      <IconComponent className="h-3 w-3" />
                      {condition}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-2 mb-2">
        <div className="lg:col-span-7">
          <Card className="glass-card border-0">
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
                    Lancer
                  </Button>

                  <Button
                    variant={quickInitiativeMode ? "default" : "outline"}
                    size="sm"
                    className="mr-2"
                    onClick={() => setQuickInitiativeMode(!quickInitiativeMode)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Éditer
                  </Button>

                  {encounter.participants.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2"
                        onClick={previousTurn}
                        disabled={encounter.participants.length === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Précédent
                      </Button>

                      <Button
                        variant="default"
                        size="sm"
                        onClick={nextTurn}
                        disabled={encounter.participants.length === 0}
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        Suivant
                      </Button>
                    </>
                  )}
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
                <div className="w-full">
                  <Table className="table-fixed w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Tour</TableHead>
                        <TableHead className="min-w-[120px]">Nom</TableHead>
                        <TableHead className="w-[70px]">Init</TableHead>
                        <TableHead className="w-[50px]">CA</TableHead>
                        <TableHead className="w-[100px]">PV</TableHead>
                        <TableHead className="min-w-[180px]">État</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {sortedParticipants.map((participant, index) => {
                          const isCurrentTurn = sortedParticipants[encounter.currentTurn]?.id === participant.id;
                          const isSelected = selectedParticipantId === participant.id;

                          return (
                            <motion.tr
                              key={participant.id}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className={`
                                border-b transition-colors data-[state=selected]:bg-muted
                                cursor-pointer
                                ${isCurrentTurn ? 'bg-blue-100/50 hover:bg-blue-100' : 'hover:bg-gray-50'}
                                ${isSelected && !isCurrentTurn ? 'bg-amber-50 border-l-4 border-amber-400' : ''}
                                ${isSelected && isCurrentTurn ? 'border-l-4 border-blue-600' : ''}
                              `}
                              onClick={() => setSelectedParticipantId(participant.id)}
                            >
                              <TableCell>
                                {isCurrentTurn && (
                                  <div className="flex justify-center">
                                    <Sword className="h-5 w-5 text-blue-600 animate-pulse" />
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-sm">
                                  <div className="truncate" title={participant.name}>
                                    {participant.name}
                                  </div>
                                  {participant.isPC && (
                                    <Badge variant="outline" className="text-xs">PC</Badge>
                                  )}
                                </div>
                                {participant.notes && (
                                  <div className="text-xs text-gray-500">{participant.notes}</div>
                                )}
                                {/* ActionTracker supprimé */}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  {quickInitiativeMode ? (
                                    <Input
                                      type="number"
                                      value={participant.initiative}
                                      onChange={(e) => {
                                        const newInitiative = parseInt(e.target.value) || 0;
                                        setEncounter(prev => ({
                                          ...prev,
                                          participants: prev.participants.map(p =>
                                            p.id === participant.id
                                              ? { ...p, initiative: newInitiative }
                                              : p
                                          )
                                        }));
                                      }}
                                      className="w-16 h-8 text-center"
                                    />
                                  ) : (
                                    <span
                                      className="cursor-pointer hover:underline min-w-[30px] text-center"
                                      onClick={() => openInitiativeEditor(participant)}
                                    >
                                      {participant.initiative}
                                    </span>
                                  )}
                                  <div className="flex flex-col">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 p-0"
                                      onClick={() => moveParticipant(participant.id, 'up')}
                                    >
                                      <span className="text-[10px]">▲</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 p-0"
                                      onClick={() => moveParticipant(participant.id, 'down')}
                                    >
                                      <span className="text-[10px]">▼</span>
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{participant.ac}</TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  {/* Affichage principal des PV */}
                                  <div className="flex items-center space-x-1">
                                    <div
                                      className="font-medium text-xs cursor-pointer"
                                      onClick={() => {
                                        if (showHpModifier === participant.id) {
                                          setShowHpModifier(null);
                                        } else {
                                          setShowHpModifier(participant.id);
                                          setHpModifierValue(1);
                                        }
                                      }}
                                      title={`${participant.currentHp}/${extractNumericHP(participant.maxHp)} PV - Cliquer pour modifier`}
                                    >
                                      {participant.currentHp}/{extractNumericHP(participant.maxHp)}
                                    </div>
                                  </div>

                                  {/* Interface de modification rapide */}
                                  {showHpModifier === participant.id && (
                                    <div className="flex items-center space-x-1 p-1 bg-gray-50 rounded border">
                                      <input
                                        type="number"
                                        value={hpModifierValue}
                                        onChange={(e) => setHpModifierValue(parseInt(e.target.value) || 1)}
                                        className="w-12 h-6 text-xs border rounded px-1"
                                        min="1"
                                        max="100"
                                      />
                                      <button
                                        onClick={() => {
                                          updateHp(participant.id, hpModifierValue);
                                          setShowHpModifier(null);
                                        }}
                                        className="flex items-center justify-center w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded"
                                        title={`Soigner ${hpModifierValue} PV`}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          updateHp(participant.id, -hpModifierValue);
                                          setShowHpModifier(null);
                                        }}
                                        className="flex items-center justify-center w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded"
                                        title={`Infliger ${hpModifierValue} dégâts`}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}

                                  {/* Barre de progression */}
                                  <Progress
                                    value={(participant.currentHp / extractNumericHP(participant.maxHp)) * 100}
                                    className="h-1"
                                    indicatorClassName={participant.currentHp <= 0 ? 'bg-gray-500' : participant.currentHp < extractNumericHP(participant.maxHp) / 2 ? 'bg-red-500' : 'bg-green-500'}
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1 min-w-[180px]">
                                  {/* Badge de statut */}
                                  <div className="flex justify-start">
                                    {getStatusBadge(participant)}
                                  </div>

                                  {/* Affichage des conditions existantes avec icônes */}
                                  {participant.conditions.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {participant.conditions.map(condition => {
                                        const conditionInfo = getConditionInfo(condition);
                                        const IconComponent = conditionInfo.icon;
                                        return (
                                          <Badge
                                            key={condition}
                                            variant="outline"
                                            className={`cursor-pointer text-xs flex items-center gap-1 ${conditionInfo.color} hover:opacity-75`}
                                            onClick={() => toggleCondition(participant.id, condition)}
                                            title={`Cliquer pour retirer la condition "${condition}"`}
                                          >
                                            <IconComponent className="h-3 w-3" />
                                            {condition}
                                          </Badge>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Menu déroulant pour ajouter de nouvelles conditions */}
                                  <div className="w-full">
                                    <select
                                      className="w-full h-6 text-xs border rounded px-1 bg-white"
                                      onChange={(e) => {
                                        if (e.target.value) {
                                          toggleCondition(participant.id, e.target.value);
                                          e.target.value = '';
                                        }
                                      }}
                                      value=""
                                    >
                                      <option value="">+ Ajouter condition</option>
                                      {CONDITIONS.filter(condition => !participant.conditions.includes(condition)).map(condition => {
                                        return (
                                          <option key={condition} value={condition}>
                                            {condition}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-0.5">
                                  {!participant.isPC && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => openCreatureFrame(participant.id)}
                                        title="Voir la page AideDD"
                                      >
                                        <Link className="h-3 w-3" />
                                      </Button>
                                      {/* Bouton "Charger les détails" supprimé - la fonction est appelée automatiquement */}
                                    </>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => openNotesEditor(participant)}
                                    title="Modifier les notes"
                                  >
                                    <Square className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => removeParticipant(participant.id)}
                                    title="Supprimer"
                                  >
                                    <Skull className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="mt-4 flex justify-between">
                <div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <User className="h-4 w-4 mr-1" />
                        Ajouter un personnage
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter un personnage</DialogTitle>
                        <DialogDescription>
                          Ajoutez un nouveau personnage joueur à la rencontre
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="pc-name" className="text-right">
                            Nom
                          </Label>
                          <Input
                            id="pc-name"
                            value={newPC.name}
                            onChange={(e) => setNewPC(prev => ({ ...prev, name: e.target.value }))}
                            className="col-span-3"
                            placeholder="Nom du personnage"
                          />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="pc-initiative" className="text-right">
                            Initiative
                          </Label>
                          <Input
                            id="pc-initiative"
                            type="number"
                            value={newPC.initiative}
                            onChange={(e) => setNewPC(prev => ({ ...prev, initiative: parseInt(e.target.value) || 10 }))}
                            className="col-span-3"
                          />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="pc-ac" className="text-right">
                            CA
                          </Label>
                          <Input
                            id="pc-ac"
                            type="number"
                            value={newPC.ac}
                            onChange={(e) => setNewPC(prev => ({ ...prev, ac: parseInt(e.target.value) || 15 }))}
                            className="col-span-3"
                          />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="pc-hp" className="text-right">
                            Points de vie
                          </Label>
                          <Input
                            id="pc-hp"
                            type="number"
                            value={newPC.hp}
                            onChange={(e) => setNewPC(prev => ({ ...prev, hp: parseInt(e.target.value) || 30 }))}
                            className="col-span-3"
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button onClick={addPlayerCharacter}>Ajouter</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div>
                  {/* Boutons de navigation toujours visibles */}
                  {encounter.participants.length > 0 && (
                    <>
                      <Button
                        onClick={previousTurn}
                        className="mr-2"
                        variant="outline"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Tour précédent
                      </Button>
                      <Button
                        onClick={nextTurn}
                        className="mr-2"
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        Tour suivant
                      </Button>
                    </>
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

        <div className="lg:col-span-3">
          {/* Vue du combattant actif (Monstre Iframe ou Joueur Stats) */}
          <div className="h-full">
            {sortedParticipants.length > 0 ? (
              <ActiveCombatantDisplay
                participant={
                  // Utiliser le participant sélectionné, ou par défaut celui dont c'est le tour
                  selectedParticipantId
                    ? sortedParticipants.find(p => p.id === selectedParticipantId) || sortedParticipants[encounter.currentTurn]
                    : sortedParticipants[encounter.currentTurn]
                }
                className="h-full"
                onLinkDndBeyond={handleLinkDndBeyond}
              />
            ) : (
              <Card className="h-full flex items-center justify-center p-6 text-center text-gray-500">
                <div>
                  <p>Commencez la rencontre pour voir les détails du combattant actif.</p>
                </div>
              </Card>
            )}
          </div>
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

      {/* Dialogue d'édition de l'initiative */}
      <Dialog open={initiativeDialogOpen} onOpenChange={setInitiativeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'initiative</DialogTitle>
            <DialogDescription>
              Modifiez l'initiative de {editingInitiative.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="initiative" className="text-right">
                Initiative
              </Label>
              <Input
                id="initiative"
                type="number"
                value={editingInitiative.initiative}
                onChange={(e) => setEditingInitiative(prev => ({
                  ...prev,
                  initiative: parseInt(e.target.value) || 0
                }))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="modifier" className="text-right">
                Modificateur
              </Label>
              <Input
                id="modifier"
                type="number"
                value={editingInitiative.modifier}
                onChange={(e) => setEditingInitiative(prev => ({
                  ...prev,
                  modifier: parseInt(e.target.value) || 0
                }))}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInitiativeDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveInitiativeChanges}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'édition des notes */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier les notes</DialogTitle>
            <DialogDescription>
              Modifiez les notes de {editingNotes.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <textarea
                id="notes"
                value={editingNotes.notes}
                onChange={(e) => setEditingNotes(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
                className="col-span-3 min-h-[100px] p-2 border rounded-md"
                placeholder="Ajoutez des notes sur ce participant..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveNotesChanges}>
              Sauvegarder
            </Button>
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


      {/* Sheet du Grimoire */}
      <Sheet open={grimoireOpen} onOpenChange={setGrimoireOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Scroll className="h-5 w-5" /> Grimoire
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-80px)]">
            <SpellBrowser className="h-full" />
          </div>
        </SheetContent>
      </Sheet>

      {/* Bulle flottante du Grimoire */}
      <FloatingGrimoireBubble onOpen={() => setGrimoireOpen(true)} />
    </div >
  );
};

export default EncounterTracker; 