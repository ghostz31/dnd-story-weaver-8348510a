import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sword, 
  Shield, 
  Heart, 
  SkipForward, 
  RefreshCw, 
  Skull, 
  Plus, 
  Minus, 
  Pencil, 
  Square, 
  RotateCcw, 
  Calendar, 
  User, 
  Dice4, 
  Save, 
  Zap, 
  Droplets, 
  Eye, 
  EyeOff, 
  Smile, 
  Users, 
  Link, 
  Snowflake, 
  Clock, 
  Ghost, 
  Anchor, 
  ArrowDown, 
  Brain, 
  Footprints, 
  ShieldX, 
  ChevronLeft, 
  ChevronRight,
  Crown,
  Target,
  Activity,
  Settings,
  BookOpen,
  Maximize2,
  Coins
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Player } from '../lib/types';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MonsterCard } from './MonsterCard';
import { adaptMonsterDataFormat } from '@/lib/monsterAdapter';
import { cn } from '@/lib/utils';

import { useCreatureDetailModal } from './ui/creature-detail-modal';
import { ConditionSelector } from './ui/condition-selector';
import { normalizeCreatureName, generateAideDDUrl } from '../lib/aideddUrlMapper';
import { getCachedCreatureStats, CreatureStats } from '../lib/aideddParser';
import { TreasureModal } from './ui/treasure-modal';

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

// Conditions disponibles avec leurs couleurs et icônes
const CONDITIONS = {
  'empoisonné': { icon: Droplets, color: 'text-green-500 border-green-500' },
  'paralysé': { icon: Zap, color: 'text-yellow-500 border-yellow-500' },
  'charmé': { icon: Smile, color: 'text-pink-500 border-pink-500' },
  'effrayé': { icon: Ghost, color: 'text-purple-500 border-purple-500' },
  'étourdi': { icon: Brain, color: 'text-orange-500 border-orange-500' },
  'aveuglé': { icon: EyeOff, color: 'text-gray-500 border-gray-500' },
  'assourdi': { icon: EyeOff, color: 'text-gray-500 border-gray-500' },
  'entravé': { icon: Anchor, color: 'text-brown-500 border-brown-500' },
  'ralenti': { icon: Footprints, color: 'text-blue-500 border-blue-500' },
  'inconscient': { icon: Skull, color: 'text-red-500 border-red-500' },
  'pétrifié': { icon: ShieldX, color: 'text-gray-600 border-gray-600' },
  'gelé': { icon: Snowflake, color: 'text-cyan-500 border-cyan-500' }
};

const getConditionInfo = (condition: string) => {
  return CONDITIONS[condition as keyof typeof CONDITIONS] || 
         { icon: Square, color: 'text-gray-500 border-gray-500' };
};

// Interface pour les participants de la rencontre
interface EncounterParticipant {
  id: string;
  name: string;
  displayName?: string; // Nom avec numérotation si nécessaire
  baseNumber?: number; // Numéro de la créature (1, 2, 3...)
  initiative: number;
  initiativeModifier?: number;
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
  // Actions et traits
  actions?: any[];
  traits?: any[];
  // Gestion des actions par tour
  hasUsedAction?: boolean;
  hasUsedBonusAction?: boolean;
  hasUsedReaction?: boolean;
  remainingMovement?: number;
}

// Composant pour afficher une créature dans le combat
const CreatureCard: React.FC<{
  participant: EncounterParticipant;
  isActive: boolean;
  onEditHp: (participant: EncounterParticipant) => void;
  onEditInitiative: (participant: EncounterParticipant) => void;
  onEditNotes: (participant: EncounterParticipant) => void;
  onToggleCondition: (participantId: string, condition: string) => void;
  onViewMonster: (participant: EncounterParticipant) => void;
  onOpenConditionSelector: (participant: EncounterParticipant) => void;
  onQuickHeal: (participantId: string, amount: number) => void;
  onQuickDamage: (participantId: string, amount: number) => void;
  healDamageAmount: number;
  onHealDamageAmountChange: (amount: number) => void;
}> = ({ 
  participant, 
  isActive, 
  onEditHp, 
  onEditInitiative, 
  onEditNotes, 
  onToggleCondition, 
  onViewMonster,
  onOpenConditionSelector,
  onQuickHeal,
  onQuickDamage,
  healDamageAmount,
  onHealDamageAmountChange 
}) => {
  const hpPercentage = (participant.currentHp / participant.maxHp) * 100;
  const isAlive = participant.currentHp > 0;
  const isBloodied = hpPercentage <= 50 && hpPercentage > 0;
  
  const getHpColor = () => {
    if (!isAlive) return 'bg-gray-400';
    if (hpPercentage <= 25) return 'bg-red-500';
    if (hpPercentage <= 50) return 'bg-orange-500';
    if (hpPercentage <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = () => {
    if (!isAlive) return <Badge variant="destructive" className="text-xs">Mort</Badge>;
    if (isBloodied) return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">Ensanglanté</Badge>;
    return null;
  };

  return (
    <Card className={cn(
      'transition-all duration-300 hover:shadow-lg',
      isActive && 'ring-2 ring-blue-500 shadow-lg scale-105',
      !isAlive && 'opacity-60 grayscale'
    )}>
      <CardContent className="p-4">
        {/* En-tête de la créature */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Indicateur de tour actif */}
            {isActive && (
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
            )}
            
            {/* Avatar et nom */}
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0',
                participant.isPC ? 'bg-blue-500' : 'bg-red-500'
              )}>
                {participant.isPC ? <User className="h-5 w-5" /> : <Sword className="h-4 w-4" />}
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 flex items-center space-x-2 mb-1">
                  <span className="truncate">{participant.displayName || participant.name}</span>
                  {isActive && <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                </h3>
                
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  {participant.isPC ? (
                    <Badge variant="outline" className="text-xs">PJ</Badge>
                  ) : (
                    <>
                      {participant.cr && (
                        <Badge variant="outline" className="text-xs">
                          CR {participant.cr}
                        </Badge>
                      )}
                      {participant.type && (
                        <span className="text-gray-500 truncate">{participant.type}</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Boutons d'action rapide */}
          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 w-8 p-0 flex items-center justify-center"
              onClick={() => onEditHp(participant)}
              title="Modifier les PV"
            >
              <Heart className="h-3.5 w-3.5" />
            </Button>
            

            
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 w-8 p-0 flex items-center justify-center hover:bg-purple-50 hover:border-purple-300"
              onClick={() => onOpenConditionSelector(participant)}
              title="Gérer les conditions"
            >
              <Square className="h-3.5 w-3.5 text-purple-600" />
            </Button>
            
            {!participant.isPC && (
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 w-8 p-0 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300"
                onClick={() => onViewMonster(participant)}
                title="Voir les détails sur AideDD"
              >
                <BookOpen className="h-3.5 w-3.5 text-blue-600" />
              </Button>
            )}
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-3 gap-4 mb-3">
          {/* Initiative */}
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{participant.initiative}</div>
            <div className="text-xs text-gray-500">Initiative</div>
          </div>
          
          {/* CA */}
          <div className="text-center">
            <div className="text-lg font-bold text-gray-700 flex items-center justify-center space-x-1">
              <Shield className="h-4 w-4" />
              <span>{participant.ac}</span>
            </div>
            <div className="text-xs text-gray-500">CA</div>
          </div>
          
          {/* PV */}
          <div className="text-center">
            <div className="text-lg font-bold text-red-600 flex items-center justify-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{participant.currentHp}/{participant.maxHp}</span>
            </div>
            <div className="text-xs text-gray-500">PV</div>
          </div>
        </div>

        {/* Barre de PV */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Points de vie</span>
            {getStatusBadge()}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn('h-2 rounded-full transition-all duration-300', getHpColor())}
              style={{ width: `${Math.max(0, hpPercentage)}%` }}
            />
          </div>
          
          {/* Boutons de soins/dégâts rapides - Format horizontal */}
          <div className="flex items-center justify-center mt-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-4 text-lg font-bold bg-green-500 text-white border-green-500 hover:bg-green-600 rounded-l-md rounded-r-none"
              onClick={() => onQuickHeal(participant.id, healDamageAmount)}
              title={`Soigner ${healDamageAmount} PV`}
            >
              +
            </Button>
            <Input
              type="number"
              min="1"
              max="999"
              value={healDamageAmount}
              onChange={(e) => onHealDamageAmountChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-8 w-16 text-center text-sm font-mono border-l-0 border-r-0 rounded-none focus:ring-0 focus:border-blue-500"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-4 text-lg font-bold bg-red-500 text-white border-red-500 hover:bg-red-600 rounded-r-md rounded-l-none"
              onClick={() => onQuickDamage(participant.id, healDamageAmount)}
              title={`Infliger ${healDamageAmount} dégâts`}
            >
              -
            </Button>
          </div>
        </div>

        {/* Conditions */}
        {participant.conditions.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-1">Conditions</div>
            <div className="flex flex-wrap gap-1">
              {participant.conditions.map((condition, index) => {
                const conditionInfo = getConditionInfo(condition);
                const ConditionIcon = conditionInfo.icon;
                
                return (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className={cn('text-xs cursor-pointer flex items-center', conditionInfo.color)}
                    onClick={() => onToggleCondition(participant.id, condition)}
                  >
                    <ConditionIcon className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                    <span>{condition}</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        {participant.notes && (
          <div className="border-t pt-2 mt-2">
            <div className="text-xs text-gray-600 mb-1">Notes</div>
            <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
              {participant.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Composant principal du tracker test
const EncounterTrackerTest: React.FC = () => {
  console.log("=== CHARGEMENT DU COMPOSANT ENCOUNTERTRACKER TEST ===");
  
  const { toast } = useToast();
  
  // État de la rencontre (reprise du code original mais simplifié)
  const [encounter, setEncounter] = useState<{
    name: string;
    participants: EncounterParticipant[];
    currentTurn: number;
    round: number;
  }>({
    name: 'Rencontre Test',
    participants: [],
    currentTurn: 0,
    round: 1
  });

  // États pour les dialogues
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

  const [maxHpDialogOpen, setMaxHpDialogOpen] = useState(false);
  const [editingMaxHp, setEditingMaxHp] = useState<{
    participants: Array<{
      id: string;
      name: string;
      currentMaxHp: number;
      newMaxHp: number;
      isPC: boolean;
    }>;
  }>({
    participants: []
  });

  // Vue actuelle
  const [currentView, setCurrentView] = useState<'grid' | 'list' | 'compact'>('grid');

  // État pour la sélection de conditions
  const [conditionSelectorOpen, setConditionSelectorOpen] = useState(false);
  const [editingConditionsFor, setEditingConditionsFor] = useState<string | null>(null);

  // État pour l'édition globale de l'initiative
  const [globalInitiativeDialogOpen, setGlobalInitiativeDialogOpen] = useState(false);
  const [editingInitiatives, setEditingInitiatives] = useState<Array<{
    id: string;
    name: string;
    initiative: number;
    modifier: number;
  }>>([]);

  // États pour le modal de trésor
  const [treasureModalOpen, setTreasureModalOpen] = useState(false);
  const [treasureMonsters, setTreasureMonsters] = useState<Array<{name: string, cr: number}>>([]);
  const [partyLevel, setPartyLevel] = useState(1);

  // État pour la valeur de soins/dégâts
  const [healDamageAmount, setHealDamageAmount] = useState(10);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Hook pour la modal de détails de créature
  const { openModal: openCreatureModal, CreatureModal } = useCreatureDetailModal();

  // Participants triés par initiative avec numérotation automatique
  const sortedParticipants = useMemo(() => {
    const sorted = [...encounter.participants].sort((a, b) => b.initiative - a.initiative);
    
    // Ajouter la numérotation pour les créatures identiques
    const nameCount: { [key: string]: number } = {};
    const numberedParticipants = sorted.map(participant => {
      const baseName = participant.name;
      
      // Compter les occurrences de chaque nom
      nameCount[baseName] = (nameCount[baseName] || 0) + 1;
      
      // Si c'est la première occurrence, pas de numéro
      if (nameCount[baseName] === 1) {
        return { ...participant, displayName: baseName, baseNumber: 1 };
      } else {
        return { ...participant, displayName: `${baseName} ${nameCount[baseName]}`, baseNumber: nameCount[baseName] };
      }
    });
    
    // Vérifier s'il y a des doublons et ajouter le numéro à tous si nécessaire
    const finalParticipants = numberedParticipants.map(participant => {
      const sameNameCount = numberedParticipants.filter(p => p.name === participant.name).length;
      if (sameNameCount > 1 && participant.baseNumber === 1) {
        return { ...participant, displayName: `${participant.name} 1` };
      }
      return participant;
    });
    
    return finalParticipants;
  }, [encounter.participants]);

  // État pour la synchronisation automatique
  const [hasAutoSynced, setHasAutoSynced] = useState(false);

  // Chargement initial des données (simplifié pour le test)
  useEffect(() => {
    const loadEncounterData = () => {
      try {
        const storedEncounter = sessionStorage.getItem('currentEncounter');
        if (storedEncounter) {
          const encounterData = JSON.parse(storedEncounter);
          console.log("Données de rencontre chargées:", encounterData);
          
          if (encounterData.participants) {
            const newEncounter = {
              name: encounterData.name || 'Rencontre Test',
              participants: encounterData.participants.map((p: any) => ({
                ...p,
                hasUsedAction: false,
                hasUsedBonusAction: false,
                hasUsedReaction: false,
                remainingMovement: 30
              })),
              currentTurn: encounterData.currentTurn || 0,
              round: encounterData.round || 1
            };
            setEncounter(newEncounter);
            
            // Déclencher la synchronisation automatique AideDD après le chargement
            setTimeout(() => {
              autoSyncAideDDStats(newEncounter);
            }, 1000);
          }
        } else {
          // Données de test si aucune rencontre stockée
          const testParticipants: EncounterParticipant[] = [
            {
              id: 'pc-1',
              name: 'Aragorn',
              initiative: 18,
              ac: 16,
              currentHp: 45,
              maxHp: 45,
              isPC: true,
              conditions: [],
              notes: 'Rôdeur niveau 5',
              hasUsedAction: false,
              hasUsedBonusAction: false,
              hasUsedReaction: false,
              remainingMovement: 30
            },
            {
              id: 'monster-1',
              name: 'Gobelin',
              initiative: 15,
              ac: 15,
              currentHp: 7,
              maxHp: 7,
              isPC: false,
              conditions: [],
              notes: '',
              cr: '1/4',
              type: 'Humanoïde',
              size: 'P',
              hasUsedAction: false,
              hasUsedBonusAction: false,
              hasUsedReaction: false,
              remainingMovement: 30
            },
            {
              id: 'monster-2',
              name: 'Loup',
              initiative: 12,
              ac: 13,
              currentHp: 11,
              maxHp: 11,
              isPC: false,
              conditions: ['empoisonné'],
              notes: '',
              cr: '1/4',
              type: 'Bête',
              size: 'M',
              hasUsedAction: true,
              hasUsedBonusAction: false,
              hasUsedReaction: false,
              remainingMovement: 15
            },
            {
              id: 'monster-3',
              name: 'Gobelin',
              initiative: 14,
              ac: 15,
              currentHp: 5,
              maxHp: 7,
              isPC: false,
              conditions: [],
              notes: '',
              cr: '1/4',
              type: 'Humanoïde',
              size: 'P',
              hasUsedAction: false,
              hasUsedBonusAction: false,
              hasUsedReaction: false,
              remainingMovement: 30
            },
            {
              id: 'monster-4',
              name: 'Gobelin',
              initiative: 11,
              ac: 15,
              currentHp: 7,
              maxHp: 7,
              isPC: false,
              conditions: ['charmé'],
              notes: '',
              cr: '1/4',
              type: 'Humanoïde',
              size: 'P',
              hasUsedAction: false,
              hasUsedBonusAction: false,
              hasUsedReaction: false,
              remainingMovement: 30
            }
          ];
          
          setEncounter({
            name: 'Rencontre de Test',
            participants: testParticipants,
            currentTurn: 0,
            round: 1
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
      }
    };

    loadEncounterData();
  }, []);

  // Fonctions de gestion (simplifiées pour le test)
  const nextTurn = () => {
    if (sortedParticipants.length === 0) return;
    
    let nextParticipantIndex = encounter.currentTurn;
    let newRound = encounter.round;
    
    do {
      nextParticipantIndex = (nextParticipantIndex + 1) % sortedParticipants.length;
      
      if (nextParticipantIndex === 0) {
        newRound++;
      }
    } while (sortedParticipants[nextParticipantIndex].currentHp <= 0);
    
    setEncounter(prev => ({
      ...prev,
      currentTurn: nextParticipantIndex,
      round: newRound,
      participants: prev.participants.map(p => {
        if (p.id === sortedParticipants[nextParticipantIndex].id) {
          return {
            ...p,
            hasUsedAction: false,
            hasUsedBonusAction: false,
            hasUsedReaction: false,
            remainingMovement: 30
          };
        }
        return p;
      })
    }));
  };

  const previousTurn = () => {
    if (sortedParticipants.length === 0) return;
    
    let prevParticipantIndex = encounter.currentTurn;
    let newRound = encounter.round;
    
    do {
      prevParticipantIndex = prevParticipantIndex - 1;
      if (prevParticipantIndex < 0) {
        prevParticipantIndex = sortedParticipants.length - 1;
        newRound = Math.max(1, newRound - 1);
      }
    } while (sortedParticipants[prevParticipantIndex].currentHp <= 0);
    
    setEncounter(prev => ({
      ...prev,
      currentTurn: prevParticipantIndex,
      round: newRound
    }));
  };

  // Gestion des PV
  const openHpEditor = (participant: EncounterParticipant) => {
    setEditingParticipant({
      id: participant.id,
      name: participant.name,
      currentHp: participant.currentHp,
      maxHp: participant.maxHp
    });
    setHpEditorOpen(true);
  };

  const saveHpChanges = () => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p => {
        if (p.id === editingParticipant.id) {
          return {
            ...p,
            currentHp: editingParticipant.currentHp,
            maxHp: editingParticipant.maxHp
          };
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

  // Gestion des PV max (reprise de la fonctionnalité existante)
  const openMaxHpEditor = () => {
    const participantsData = encounter.participants.map(p => ({
      id: p.id,
      name: p.name,
      currentMaxHp: p.maxHp,
      newMaxHp: p.maxHp,
      isPC: p.isPC
    }));
    
    setEditingMaxHp({ participants: participantsData });
    setMaxHpDialogOpen(true);
  };

  const updateMaxHp = (participantId: string, newMaxHp: number) => {
    setEditingMaxHp(prev => ({
      participants: prev.participants.map(p => 
        p.id === participantId ? { ...p, newMaxHp } : p
      )
    }));
  };

  const saveMaxHpChanges = () => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p => {
        const editedParticipant = editingMaxHp.participants.find(ep => ep.id === p.id);
        if (editedParticipant && editedParticipant.newMaxHp !== editedParticipant.currentMaxHp) {
          const newCurrentHp = Math.min(p.currentHp, editedParticipant.newMaxHp);
          return {
            ...p,
            maxHp: editedParticipant.newMaxHp,
            currentHp: newCurrentHp
          };
        }
        return p;
      })
    }));
    
    const changedCount = editingMaxHp.participants.filter(p => 
      p.newMaxHp !== p.currentMaxHp
    ).length;
    
    if (changedCount > 0) {
      toast({
        title: "PV max modifiés",
        description: `${changedCount} créature${changedCount > 1 ? 's' : ''} mise${changedCount > 1 ? 's' : ''} à jour`,
        variant: "default"
      });
    }
    
    setMaxHpDialogOpen(false);
  };

  const applyGlobalMaxHpModifier = (multiplier: number, onlyMonsters: boolean = false) => {
    setEditingMaxHp(prev => ({
      participants: prev.participants.map(p => {
        if (onlyMonsters && p.isPC) return p;
        
        const newMaxHp = Math.max(1, Math.round(p.currentMaxHp * multiplier));
        return { ...p, newMaxHp };
      })
    }));
  };

  // Gestion des conditions
  const toggleCondition = (participantId: string, condition: string) => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p => {
        if (p.id === participantId) {
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

  // Ouvrir le sélecteur de conditions
  const openConditionSelector = (participant: EncounterParticipant) => {
    setEditingConditionsFor(participant.id);
    setConditionSelectorOpen(true);
  };

  // Fermer le sélecteur de conditions
  const closeConditionSelector = () => {
    setConditionSelectorOpen(false);
    setEditingConditionsFor(null);
  };

  // Toggle condition depuis le sélecteur
  const handleConditionToggle = (condition: string) => {
    if (editingConditionsFor) {
      toggleCondition(editingConditionsFor, condition);
    }
  };

  // Gestion globale de l'initiative
  const openGlobalInitiativeEditor = () => {
    const initiatives = encounter.participants.map(p => ({
      id: p.id,
      name: p.displayName || p.name,
      initiative: p.initiative,
      modifier: p.initiativeModifier || 0
    }));
    setEditingInitiatives(initiatives);
    setGlobalInitiativeDialogOpen(true);
  };

  const saveGlobalInitiativeChanges = () => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p => {
        const editedInit = editingInitiatives.find(ei => ei.id === p.id);
        return editedInit ? {
          ...p,
          initiative: editedInit.initiative,
          initiativeModifier: editedInit.modifier
        } : p;
      })
    }));
    
    setGlobalInitiativeDialogOpen(false);
    
    toast({
      title: "Initiatives mises à jour",
      description: `Initiatives de ${editingInitiatives.length} créatures modifiées`
    });
  };

  const updateInitiativeValue = (id: string, field: 'initiative' | 'modifier', value: number) => {
    setEditingInitiatives(prev => prev.map(init => 
      init.id === id ? { ...init, [field]: value } : init
    ));
  };

  const rollInitiativeForAll = () => {
    setEditingInitiatives(prev => prev.map(init => ({
      ...init,
      initiative: Math.floor(Math.random() * 20) + 1 + init.modifier
    })));
  };

  const rollInitiativeForOne = (id: string) => {
    setEditingInitiatives(prev => prev.map(init => 
      init.id === id ? {
        ...init,
        initiative: Math.floor(Math.random() * 20) + 1 + init.modifier
      } : init
    ));
  };

  const openNotesEditor = (participant: EncounterParticipant) => {
    console.log("Édition notes:", participant.name);
  };

  const viewMonsterDetails = (participant: EncounterParticipant) => {
    // Utiliser la fonction de normalisation centralisée
    const cleanName = normalizeCreatureName(participant.name);
    openCreatureModal(cleanName, participant.type, participant.cr);
  };

  // Fonctions de soins et dégâts rapides
  const quickHeal = (participantId: string, amount: number) => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p => {
        if (p.id === participantId) {
          const newHp = Math.min(p.maxHp, p.currentHp + amount);
          return { ...p, currentHp: newHp };
        }
        return p;
      })
    }));
    
    toast({
      title: "Soins appliqués",
      description: `+${amount} PV`,
      variant: "default"
    });
  };

  const quickDamage = (participantId: string, amount: number) => {
    setEncounter(prev => ({
      ...prev,
      participants: prev.participants.map(p => {
        if (p.id === participantId) {
          const newHp = Math.max(0, p.currentHp - amount);
          return { ...p, currentHp: newHp };
        }
        return p;
      })
    }));
    
    toast({
      title: "Dégâts infligés",
      description: `-${amount} PV`,
      variant: "destructive"
    });
  };

  // Enrichir les créatures avec les vraies statistiques d'AideDD
  const enrichCreatureWithStats = async (participant: EncounterParticipant, silent: boolean = false): Promise<void> => {
    if (participant.type === 'player' || participant.isPC) {
      console.log(`⏭️ ${participant.name} est un joueur, synchronisation ignorée`);
      return; // Pas pour les joueurs
    }
    
    try {
      const cleanName = normalizeCreatureName(participant.name);
      const aideddUrl = generateAideDDUrl(cleanName);
      
      console.log(`🌐 Récupération des stats pour ${cleanName} depuis ${aideddUrl}`);
      const stats = await getCachedCreatureStats(cleanName, aideddUrl);
      
      console.log(`📊 Stats récupérées pour ${cleanName}:`, { 
        ac: stats?.ac, 
        hp: stats?.hp, 
        found: !!stats 
      });
      
      if (stats && (stats.ac !== null || stats.hp !== null)) {
        const oldAc = participant.ac;
        const oldMaxHp = participant.maxHp;
        const newAc = stats.ac || participant.ac;
        const newMaxHp = stats.hp || participant.maxHp;
        
        setEncounter(prev => ({
          ...prev,
          participants: prev.participants.map(p => 
            p.id === participant.id ? {
              ...p,
              ac: newAc,
              maxHp: newMaxHp,
              // Ajuster les PV actuels seulement si la créature était à pleine vie
              currentHp: p.currentHp === p.maxHp ? newMaxHp : Math.min(p.currentHp, newMaxHp)
            } : p
          )
        }));
        
        const changes = [];
        if (stats.ac && stats.ac !== oldAc) changes.push(`CA: ${oldAc} → ${newAc}`);
        if (stats.hp && stats.hp !== oldMaxHp) changes.push(`PV: ${oldMaxHp} → ${newMaxHp}`);
        
        if (!silent && changes.length > 0) {
          toast({
            title: "Statistiques mises à jour",
            description: `${cleanName}: ${changes.join(', ')}`
          });
        }
        
        console.log(`✅ ${cleanName} enrichi:`, {
          acChange: stats.ac ? `${oldAc} → ${newAc}` : 'inchangée',
          hpChange: stats.hp ? `${oldMaxHp} → ${newMaxHp}` : 'inchangés'
        });
      } else {
        console.warn(`⚠️ Aucune statistique valide trouvée pour ${cleanName}`, stats);
        throw new Error(`Pas de données pour ${cleanName}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'enrichissement de ${participant.name}:`, error);
      throw error; // Propager l'erreur pour le comptage
    }
  };

  // Synchronisation automatique AideDD (silencieuse)
  const autoSyncAideDDStats = async (encounterData: any): Promise<void> => {
    if (hasAutoSynced) return; // Ne pas synchroniser plusieurs fois
    
    const monsters = encounterData.participants.filter((p: any) => !p.isPC && p.type !== 'player');
    
    if (monsters.length === 0) {
      console.log("📭 Aucun monstre à synchroniser");
      return;
    }
    
    console.log(`🔄 Synchronisation automatique AideDD pour ${monsters.length} créature(s)...`);
    console.log("🎯 Créatures à synchroniser:", monsters.map(m => m.name));
    
    try {
      setHasAutoSynced(true);
      
      let syncCount = 0;
      let successCount = 0;
      
      for (const monster of monsters) {
        try {
          console.log(`🔍 Synchronisation de: ${monster.name} (${monster.id})`);
          await enrichCreatureWithStats(monster, true); // Mode silencieux
          successCount++;
          syncCount++;
          console.log(`✅ ${monster.name} synchronisé avec succès (${syncCount}/${monsters.length})`);
        } catch (error) {
          console.error(`❌ Erreur pour ${monster.name}:`, error);
          syncCount++;
        }
        
        // Petit délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 400));
      }
      
      console.log(`🎉 Synchronisation automatique AideDD terminée: ${successCount}/${syncCount} créature(s) réussie(s)`);
      
      // Toast de confirmation avec détails
      if (successCount > 0) {
        toast({
          title: "Synchronisation terminée",
          description: `${successCount} créature(s) synchronisée(s) avec AideDD`,
          variant: "default"
        });
      } else {
        toast({
          title: "Synchronisation échouée",
          description: "Aucune créature n'a pu être synchronisée avec AideDD",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('❌ Erreur globale lors de la synchronisation automatique:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Erreur technique lors de la synchronisation AideDD",
        variant: "destructive"
      });
    }
  };

  // Enrichir toutes les créatures
  // Fonction pour ouvrir le modal de trésor
  const openTreasureModal = () => {
    const monsters = encounter.participants
      .filter(p => !p.isPC) // Filtrer les non-PJ (monstres)
      .map(p => ({
        name: p.name,
        cr: typeof p.cr === 'number' ? p.cr : parseFloat(p.cr || '0.25')
      }));
    
    setTreasureMonsters(monsters);
    
    // Calculer le niveau moyen du groupe (par défaut niveau 5 si pas de joueurs)
    const players = encounter.participants.filter(p => p.isPC);
    const avgLevel = players.length > 0 ? 5 : 5; // Niveau par défaut
    
    setPartyLevel(avgLevel);
    setTreasureModalOpen(true);
  };

  const enrichAllCreatures = async (): Promise<void> => {
    const monsters = encounter.participants.filter(p => !p.isPC);
    
    if (monsters.length === 0) {
      toast({
        title: "Aucune créature",
        description: "Aucun monstre à synchroniser",
        variant: "default"
      });
      return;
    }
    
    toast({
      title: "Mise à jour en cours",
      description: `Récupération des statistiques pour ${monsters.length} créature(s)...`
    });

    let updatedCount = 0;
    for (const monster of monsters) {
      await enrichCreatureWithStats(monster, true); // Mode silencieux
      updatedCount++;
      // Petit délai pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    toast({
      title: "Mise à jour terminée",
      description: `${updatedCount} créature(s) enrichie(s) avec les statistiques d'AideDD`
    });
  };



  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* En-tête moderne */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{encounter.name}</h1>
                <div className="flex items-center space-x-4 text-blue-100">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Tour {encounter.round}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>{encounter.participants.length} participants</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>{encounter.participants.filter(p => p.currentHp > 0).length} actifs</span>
                  </div>
                </div>
              </div>
              
              {/* Contrôles principaux */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={openMaxHpEditor}
                  disabled={encounter.participants.length === 0}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  PV Max
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={openGlobalInitiativeEditor}
                  disabled={encounter.participants.length === 0}
                  className="hover:bg-blue-50 hover:border-blue-300"
                >
                  <Dice4 className="h-4 w-4 mr-2" />
                  Initiative
                </Button>
                
                {/* Bouton Sync AideDD masqué - synchronisation automatique au chargement */}
                {false && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={enrichAllCreatures}
                    disabled={encounter.participants.filter(p => !p.isPC).length === 0}
                    className="hover:bg-green-50 hover:border-green-300"
                  >
                    <RefreshCw className="h-4 w-4 mr-2 text-green-600" />
                    Sync AideDD
                  </Button>
                )}
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={openTreasureModal}
                  disabled={encounter.participants.filter(p => !p.isPC).length === 0}
                  className="hover:bg-yellow-50 hover:border-yellow-300"
                >
                  <Coins className="h-4 w-4 mr-2 text-yellow-600" />
                  Trésor
                </Button>
                
                {/* Boutons de navigation déplacés en position flottante */}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sélecteur de vue */}
      <div className="max-w-7xl mx-auto mb-6">
        <Tabs value={currentView} onValueChange={(value: string) => setCurrentView(value as any)}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="grid" className="flex items-center space-x-2">
              <div className="grid grid-cols-2 gap-1 w-4 h-4">
                <div className="bg-current rounded-sm opacity-60"></div>
                <div className="bg-current rounded-sm opacity-60"></div>
                <div className="bg-current rounded-sm opacity-60"></div>
                <div className="bg-current rounded-sm opacity-60"></div>
              </div>
              <span>Grille</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center space-x-2">
              <div className="flex flex-col space-y-1 w-4 h-4">
                <div className="bg-current h-1 rounded opacity-60"></div>
                <div className="bg-current h-1 rounded opacity-60"></div>
                <div className="bg-current h-1 rounded opacity-60"></div>
              </div>
              <span>Liste</span>
            </TabsTrigger>
            <TabsTrigger value="compact" className="flex items-center space-x-2">
              <Maximize2 className="h-4 w-4" />
              <span>Compact</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="grid">
              {/* Vue en grille */}
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedParticipants.map((participant, index) => (
                    <CreatureCard
                      key={participant.id}
                      participant={participant}
                      isActive={index === encounter.currentTurn}
                      onEditHp={openHpEditor}
                      onEditInitiative={() => {}}
                      onEditNotes={openNotesEditor}
                      onToggleCondition={toggleCondition}
                      onViewMonster={viewMonsterDetails}
                      onOpenConditionSelector={openConditionSelector}
                      onQuickHeal={quickHeal}
                      onQuickDamage={quickDamage}
                      healDamageAmount={healDamageAmount}
                      onHealDamageAmountChange={setHealDamageAmount}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="list">
              {/* Vue en liste */}
              <div className="max-w-5xl mx-auto">
                <div className="space-y-4">
                  {sortedParticipants.map((participant, index) => (
                    <div key={participant.id} className="w-full">
                      <CreatureCard
                        participant={participant}
                        isActive={index === encounter.currentTurn}
                        onEditHp={openHpEditor}
                        onEditInitiative={() => {}}
                        onEditNotes={openNotesEditor}
                        onToggleCondition={toggleCondition}
                        onViewMonster={viewMonsterDetails}
                        onOpenConditionSelector={openConditionSelector}
                        onQuickHeal={quickHeal}
                        onQuickDamage={quickDamage}
                        healDamageAmount={healDamageAmount}
                        onHealDamageAmountChange={setHealDamageAmount}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="compact">
              {/* Vue compacte en tableau */}
              <div className="max-w-6xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Tour</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead className="text-center">Init</TableHead>
                          <TableHead className="text-center">CA</TableHead>
                          <TableHead className="text-center">PV</TableHead>
                          <TableHead className="text-center">État</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedParticipants.map((participant, index) => {
                          const hpPercentage = (participant.currentHp / participant.maxHp) * 100;
                          const isAlive = participant.currentHp > 0;
                          const isBloodied = hpPercentage <= 50 && hpPercentage > 0;
                          
                          return (
                            <TableRow 
                              key={participant.id}
                              className={cn(
                                'hover:bg-gray-50',
                                index === encounter.currentTurn && 'bg-blue-50 border-l-4 border-l-blue-500',
                                !isAlive && 'opacity-50'
                              )}
                            >
                              <TableCell>
                                {index === encounter.currentTurn && (
                                  <Crown className="h-4 w-4 text-yellow-500" />
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div className={cn(
                                    'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs',
                                    participant.isPC ? 'bg-blue-500' : 'bg-red-500'
                                  )}>
                                    {participant.isPC ? 'P' : 'M'}
                                  </div>
                                  <div>
                                    <div className="font-medium">{participant.displayName || participant.name}</div>
                                    {participant.isPC ? (
                                      <Badge variant="outline" className="text-xs">PJ</Badge>
                                    ) : (
                                      <div className="flex items-center space-x-1">
                                        {participant.cr && (
                                          <Badge variant="outline" className="text-xs">
                                            CR {participant.cr}
                                          </Badge>
                                        )}
                                        {participant.type && (
                                          <span className="text-xs text-gray-500">{participant.type}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center font-mono">
                                {participant.initiative}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center space-x-1">
                                  <Shield className="h-3 w-3" />
                                  <span>{participant.ac}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="flex items-center space-x-1">
                                    <Heart className="h-3 w-3 text-red-500" />
                                    <span className="font-mono">
                                      {participant.currentHp}/{participant.maxHp}
                                    </span>
                                  </div>
                                  <div className="w-12 bg-gray-200 rounded-full h-1">
                                    <div 
                                      className={cn(
                                        'h-1 rounded-full transition-all',
                                        !isAlive ? 'bg-gray-400' :
                                        hpPercentage <= 25 ? 'bg-red-500' :
                                        hpPercentage <= 50 ? 'bg-orange-500' :
                                        hpPercentage <= 75 ? 'bg-yellow-500' :
                                        'bg-green-500'
                                      )}
                                      style={{ 
                                        width: `${Math.max(0, hpPercentage)}%` 
                                      }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {/* Conditions */}
                                  {participant.conditions.map((condition, idx) => {
                                    const conditionInfo = getConditionInfo(condition);
                                    const ConditionIcon = conditionInfo.icon;
                                    return (
                                      <Badge 
                                        key={idx}
                                        variant="outline" 
                                        className={cn('text-xs cursor-pointer flex items-center', conditionInfo.color)}
                                        onClick={() => toggleCondition(participant.id, condition)}
                                      >
                                        <ConditionIcon className="h-2 w-2 mr-1" />
                                        {condition}
                                      </Badge>
                                    );
                                  })}
                                  {/* Badge de statut de vie */}
                                  {!isAlive && (
                                    <Badge variant="destructive" className="text-xs">
                                      <Skull className="h-2 w-2 mr-1" />
                                      Mort
                                    </Badge>
                                  )}
                                  {isBloodied && isAlive && (
                                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                      Ensanglanté
                                    </Badge>
                                  )}
                                </div>
                                {/* Notes en mode compact */}
                                {participant.notes && (
                                  <div className="mt-1 text-xs text-gray-500 italic truncate max-w-32" title={participant.notes}>
                                    {participant.notes}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center space-x-1">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 w-7 p-0 flex items-center justify-center"
                                    onClick={() => openHpEditor(participant)}
                                    title="Modifier les PV"
                                  >
                                    <Heart className="h-3 w-3" />
                                  </Button>

                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 w-7 p-0 flex items-center justify-center hover:bg-purple-50"
                                    onClick={() => openConditionSelector(participant)}
                                    title="Gérer les conditions"
                                  >
                                    <Square className="h-3 w-3 text-purple-600" />
                                  </Button>
                                  {!participant.isPC && (
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-7 w-7 p-0 flex items-center justify-center hover:bg-blue-50"
                                      onClick={() => viewMonsterDetails(participant)}
                                      title="Voir les détails sur AideDD"
                                    >
                                      <BookOpen className="h-3 w-3 text-blue-600" />
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 w-7 p-0 flex items-center justify-center hover:bg-gray-50"
                                    onClick={() => openNotesEditor(participant)}
                                    title="Modifier les notes"
                                  >
                                    <Pencil className="h-3 w-3 text-gray-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* État vide */}
      {encounter.participants.length === 0 && (
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sword className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun participant</h3>
          <p className="text-gray-600 mb-6">
            Créez une rencontre pour commencer à utiliser le tracker de combat.
          </p>
          <Button onClick={() => navigate('/encounters')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Créer une rencontre
          </Button>
        </div>
      )}

      {/* Dialogues */}
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
                onChange={(e) => setEditingParticipant(prev => ({ 
                  ...prev, 
                  currentHp: parseInt(e.target.value, 10) || 0 
                }))}
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
                onChange={(e) => setEditingParticipant(prev => ({ 
                  ...prev, 
                  maxHp: parseInt(e.target.value, 10) || 1 
                }))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveHpChanges}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* Dialogue d'édition des PV max */}
      <Dialog open={maxHpDialogOpen} onOpenChange={setMaxHpDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier les PV maximum</DialogTitle>
            <DialogDescription>
              Ajustez les points de vie maximum de toutes les créatures. Les PV actuels seront ajustés si ils dépassent les nouveaux maximums.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {/* Boutons de modification rapide */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium mb-2 block">Modifications rapides :</Label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => applyGlobalMaxHpModifier(0.5, true)}
                >
                  Monstres ÷2
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => applyGlobalMaxHpModifier(0.75, true)}
                >
                  Monstres -25%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => applyGlobalMaxHpModifier(1.25, true)}
                >
                  Monstres +25%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => applyGlobalMaxHpModifier(1.5, true)}
                >
                  Monstres +50%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => applyGlobalMaxHpModifier(2, true)}
                >
                  Monstres ×2
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => applyGlobalMaxHpModifier(3, true)}
                >
                  Monstres ×3
                </Button>
              </div>
            </div>

            {/* Liste des participants */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {editingMaxHp.participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${participant.isPC ? 'bg-blue-500' : 'bg-red-500'}`} />
                    <div>
                      <div className="font-medium">{participant.name}</div>
                      <div className="text-sm text-gray-500">
                        {participant.isPC ? 'Personnage joueur' : 'Monstre'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-600">
                      {participant.currentMaxHp} → {participant.newMaxHp}
                    </div>
                    <Input
                      type="number"
                      min="1"
                      value={participant.newMaxHp}
                      onChange={(e) => updateMaxHp(participant.id, parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMaxHpDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveMaxHpChanges}>
              <Heart className="h-4 w-4 mr-2" />
              Appliquer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* Modal de détails de créature */}
      <CreatureModal />

      {/* Dialogue d'édition globale de l'initiative */}
      <Dialog open={globalInitiativeDialogOpen} onOpenChange={setGlobalInitiativeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] w-[90vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Dice4 className="h-5 w-5 text-blue-600" />
              <span>Gestion de l'Initiative</span>
            </DialogTitle>
            <DialogDescription>
              Définissez l'initiative de toutes les créatures et joueurs
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Actions globales */}
            <div className="flex space-x-2 p-4 bg-blue-50 rounded-lg">
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={rollInitiativeForAll}
                className="flex items-center space-x-2"
              >
                <Dice4 className="h-4 w-4" />
                <span>Lancer pour tous</span>
              </Button>
            </div>

            {/* Liste des créatures */}
            <div className="space-y-3">
              {editingInitiatives.map((init) => (
                <div key={init.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{init.name}</h4>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm text-gray-600 min-w-0">Initiative:</Label>
                    <Input
                      type="number"
                      value={init.initiative}
                      onChange={(e) => updateInitiativeValue(init.id, 'initiative', parseInt(e.target.value) || 0)}
                      className="w-20"
                      min="1"
                      max="30"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm text-gray-600 min-w-0">Mod:</Label>
                    <Input
                      type="number"
                      value={init.modifier}
                      onChange={(e) => updateInitiativeValue(init.id, 'modifier', parseInt(e.target.value) || 0)}
                      className="w-16"
                      min="-5"
                      max="10"
                    />
                  </div>
                  
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => rollInitiativeForOne(init.id)}
                    title="Lancer 1d20 + modificateur"
                  >
                    <Dice4 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setGlobalInitiativeDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveGlobalInitiativeChanges} className="bg-blue-600 hover:bg-blue-700">
              <Dice4 className="h-4 w-4 mr-2" />
              Sauvegarder toutes les initiatives
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de sélection de conditions */}
      {editingConditionsFor && (
        <ConditionSelector
          isOpen={conditionSelectorOpen}
          onClose={closeConditionSelector}
          participantName={
            sortedParticipants.find(p => p.id === editingConditionsFor)?.displayName ||
            sortedParticipants.find(p => p.id === editingConditionsFor)?.name ||
            'Créature'
          }
          currentConditions={
            sortedParticipants.find(p => p.id === editingConditionsFor)?.conditions || []
          }
          onToggleCondition={handleConditionToggle}
        />
      )}

      {/* Modal de génération de trésor */}
      <TreasureModal
        isOpen={treasureModalOpen}
        onClose={() => setTreasureModalOpen(false)}
        monsters={treasureMonsters}
        partyLevel={partyLevel}
        encounterName={encounter.name}
      />

      {/* Boutons flottants de navigation des tours */}
      <div className="fixed bottom-6 right-6 flex items-center gap-1 z-50">
        {/* Bouton Tour Précédent */}
        <Button
          variant="secondary"
          size="sm"
          onClick={previousTurn}
          disabled={encounter.participants.length === 0}
          className="w-10 h-10 rounded-full shadow-md hover:shadow-lg transition-all duration-200 bg-white border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 p-0"
          title="Tour précédent"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600 hover:text-blue-600" />
        </Button>
        
        {/* Compteur de tour */}
        <div className="w-10 h-10 bg-white rounded-full shadow-md border-2 border-gray-200 flex items-center justify-center text-center">
          <div className="text-sm font-bold text-blue-600">{encounter.round}</div>
        </div>
        
        {/* Bouton Tour Suivant */}
        <Button
          size="sm"
          onClick={nextTurn}
          disabled={encounter.participants.length === 0}
          className="w-10 h-10 rounded-full shadow-md hover:shadow-lg transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 hover:border-blue-700 p-0"
          title="Tour suivant"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EncounterTrackerTest; 