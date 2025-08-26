import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { LoadingButton } from './ui/smooth-transitions';
import { 
  User, 
  Download, 
  Edit, 
  AlertCircle, 
  CheckCircle, 
  Globe, 
  FileText,
  Zap,
  Heart,
  Shield,
  Swords,
  Brain
} from 'lucide-react';
import { Player } from '../lib/types';
import { 
  parseDnDBeyondCharacter, 
  isValidDnDBeyondUrl, 
  getCharacterPreview,
  testDnDBeyondConnection
} from '../lib/dndBeyondParser';
import { cn } from '@/lib/utils';

interface PlayerImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (player: Player) => Promise<void>;
  editingPlayer?: Player;
}

// Classes de personnages D&D
const CHARACTER_CLASSES = [
  'Artificier', 'Barbare', 'Barde', 'Clerc', 'Druide', 'Ensorceleur', 
  'Guerrier', 'Magicien', 'Moine', 'Occultiste', 'Paladin', 'Rôdeur', 'Roublard'
];

// Races communes
const CHARACTER_RACES = [
  'Humain', 'Elfe', 'Nain', 'Halfelin', 'Drakéide', 'Gnome', 
  'Demi-Elfe', 'Demi-Orc', 'Tieffelin', 'Aasimar', 'Génasi', 'Goliath'
];

const PlayerImportModal: React.FC<PlayerImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  editingPlayer
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'dndbeyond'>('manual');
  
  // État pour l'import D&D Beyond
  const [dndBeyondUrl, setDndBeyondUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [characterPreview, setCharacterPreview] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // État pour la saisie manuelle
  const [manualPlayer, setManualPlayer] = useState<Omit<Player, 'id'>>({
    name: '',
    level: 1,
    characterClass: 'Guerrier',
    race: '',
    background: '',
    ac: 10,
    maxHp: 10,
    currentHp: 10,
    speed: 30,
    proficiencyBonus: 2,
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    savingThrows: {},
    skills: {},
    features: [],
    equipment: []
  });
  
  // État pour le personnage importé/édité
  const [importedPlayer, setImportedPlayer] = useState<Player | null>(null);
  
  // Tester la connexion D&D Beyond au chargement
  useEffect(() => {
    testDnDBeyondConnection().then(setIsConnected);
  }, []);
  
  // Initialiser avec les données du personnage en édition
  useEffect(() => {
    if (editingPlayer) {
      setManualPlayer({
        name: editingPlayer.name,
        level: editingPlayer.level,
        characterClass: editingPlayer.characterClass,
        race: editingPlayer.race || '',
        background: editingPlayer.background || '',
        ac: editingPlayer.ac || 10,
        maxHp: editingPlayer.maxHp || 10,
        currentHp: editingPlayer.currentHp || editingPlayer.maxHp || 10,
        speed: editingPlayer.speed || 30,
        proficiencyBonus: editingPlayer.proficiencyBonus || Math.ceil(editingPlayer.level / 4) + 1,
        stats: editingPlayer.stats || {
          strength: 10, dexterity: 10, constitution: 10,
          intelligence: 10, wisdom: 10, charisma: 10
        },
        savingThrows: editingPlayer.savingThrows || {},
        skills: editingPlayer.skills || {},
        features: editingPlayer.features || [],
        equipment: editingPlayer.equipment || []
      });
      setImportedPlayer(editingPlayer);
    }
  }, [editingPlayer]);
  
  // Réinitialiser l'état à la fermeture
  const handleClose = () => {
    setActiveTab('manual');
    setDndBeyondUrl('');
    setImportError('');
    setCharacterPreview(null);
    setImportedPlayer(null);
    if (!editingPlayer) {
      setManualPlayer({
        name: '',
        level: 1,
        characterClass: 'Guerrier',
        race: '',
        background: '',
        ac: 10,
        maxHp: 10,
        currentHp: 10,
        speed: 30,
        proficiencyBonus: 2,
        stats: {
          strength: 10, dexterity: 10, constitution: 10,
          intelligence: 10, wisdom: 10, charisma: 10
        },
        savingThrows: {},
        skills: {},
        features: [],
        equipment: []
      });
    }
    onClose();
  };
  
  // Prévisualiser un personnage D&D Beyond
  const handlePreviewCharacter = async () => {
    if (!dndBeyondUrl || !isValidDnDBeyondUrl(dndBeyondUrl)) {
      setImportError('URL D&D Beyond invalide');
      return;
    }
    
    setIsImporting(true);
    setImportError('');
    
    try {
      const preview = await getCharacterPreview(dndBeyondUrl);
      setCharacterPreview(preview);
    } catch (error) {
      setImportError('Impossible de récupérer l\'aperçu du personnage');
    } finally {
      setIsImporting(false);
    }
  };
  
  // Importer depuis D&D Beyond
  const handleImportFromDnDBeyond = async () => {
    if (!dndBeyondUrl || !isValidDnDBeyondUrl(dndBeyondUrl)) {
      setImportError('URL D&D Beyond invalide');
      return;
    }
    
    setIsImporting(true);
    setImportError('');
    
    try {
      const player = await parseDnDBeyondCharacter(dndBeyondUrl);
      setImportedPlayer(player);
      setManualPlayer(player);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Erreur d\'import');
    } finally {
      setIsImporting(false);
    }
  };
  
  // Calculer le bonus de compétence automatiquement
  const updateProficiencyBonus = (level: number) => {
    const bonus = Math.ceil(level / 4) + 1;
    setManualPlayer(prev => ({ ...prev, proficiencyBonus: bonus }));
  };
  
  // Calculer le modificateur d'une caractéristique
  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };
  
  // Finaliser l'import
  const handleFinalImport = async () => {
    const playerToImport = importedPlayer || {
      ...manualPlayer,
      id: editingPlayer?.id || `player-${Date.now()}`
    };
    
    if (!playerToImport.name.trim()) {
      setImportError('Le nom du personnage est requis');
      return;
    }
    
    try {
      await onImport(playerToImport);
      handleClose();
    } catch (error) {
      setImportError('Erreur lors de l\'ajout du personnage');
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={20} />
            {editingPlayer ? 'Modifier le personnage' : 'Ajouter un personnage'}
          </DialogTitle>
          <DialogDescription>
            {editingPlayer 
              ? 'Modifiez les informations de ce personnage'
              : 'Importez depuis D&D Beyond ou saisissez manuellement les informations'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'manual' | 'dndbeyond')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Edit size={16} />
                Saisie manuelle
              </TabsTrigger>
              <TabsTrigger value="dndbeyond" className="flex items-center gap-2">
                <Download size={16} />
                Import D&D Beyond
              </TabsTrigger>
            </TabsList>
            
            {/* Tab Import D&D Beyond */}
            <TabsContent value="dndbeyond" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe size={18} />
                    Import depuis D&D Beyond
                    {isConnected ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle size={12} className="mr-1" />
                        Connecté
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        <AlertCircle size={12} className="mr-1" />
                        Hors ligne
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Collez l'URL de votre personnage D&D Beyond pour importer automatiquement ses informations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="dndbeyond-url">URL du personnage</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="dndbeyond-url"
                        placeholder="https://www.dndbeyond.com/characters/92791713"
                        value={dndBeyondUrl}
                        onChange={(e) => {
                          setDndBeyondUrl(e.target.value);
                          setImportError('');
                          setCharacterPreview(null);
                        }}
                        className={cn(
                          dndBeyondUrl && !isValidDnDBeyondUrl(dndBeyondUrl) && "border-red-500"
                        )}
                      />
                      <Button
                        variant="outline"
                        onClick={handlePreviewCharacter}
                        disabled={!dndBeyondUrl || !isValidDnDBeyondUrl(dndBeyondUrl) || isImporting}
                      >
                        Aperçu
                      </Button>
                    </div>
                    {dndBeyondUrl && !isValidDnDBeyondUrl(dndBeyondUrl) && (
                      <p className="text-sm text-red-600 mt-1">URL D&D Beyond invalide</p>
                    )}
                  </div>
                  
                  {/* Aperçu du personnage */}
                  {characterPreview && (
                    <Card className="bg-blue-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{characterPreview.name}</h4>
                            <p className="text-sm text-gray-600">
                              Niveau {characterPreview.level} {characterPreview.race} {characterPreview.class}
                            </p>
                          </div>
                          <LoadingButton
                            onClick={handleImportFromDnDBeyond}
                            isLoading={isImporting}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                          >
                            <Download size={16} className="mr-2" />
                            Importer
                          </LoadingButton>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {importError && (
                    <Alert variant="destructive">
                      <AlertCircle size={16} />
                      <AlertDescription>{importError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Tab Saisie manuelle */}
            <TabsContent value="manual" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations de base */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText size={18} />
                      Informations de base
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nom du personnage *</Label>
                      <Input
                        id="name"
                        value={manualPlayer.name}
                        onChange={(e) => setManualPlayer(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nom du personnage"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="level">Niveau</Label>
                        <Input
                          id="level"
                          type="number"
                          min="1"
                          max="20"
                          value={manualPlayer.level}
                          onChange={(e) => {
                            const level = parseInt(e.target.value) || 1;
                            setManualPlayer(prev => ({ ...prev, level }));
                            updateProficiencyBonus(level);
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="proficiency">Bonus de maîtrise</Label>
                        <Input
                          id="proficiency"
                          type="number"
                          value={manualPlayer.proficiencyBonus}
                          onChange={(e) => setManualPlayer(prev => ({ 
                            ...prev, 
                            proficiencyBonus: parseInt(e.target.value) || 2 
                          }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="class">Classe</Label>
                      <Select
                        value={manualPlayer.characterClass}
                        onValueChange={(value) => setManualPlayer(prev => ({ ...prev, characterClass: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CHARACTER_CLASSES.map(cls => (
                            <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="race">Race</Label>
                      <Select
                        value={manualPlayer.race}
                        onValueChange={(value) => setManualPlayer(prev => ({ ...prev, race: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une race" />
                        </SelectTrigger>
                        <SelectContent>
                          {CHARACTER_RACES.map(race => (
                            <SelectItem key={race} value={race}>{race}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="background">Historique</Label>
                      <Input
                        id="background"
                        value={manualPlayer.background}
                        onChange={(e) => setManualPlayer(prev => ({ ...prev, background: e.target.value }))}
                        placeholder="Ex: Acolyte, Criminel..."
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Statistiques de combat */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Swords size={18} />
                      Combat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ac" className="flex items-center gap-1">
                          <Shield size={14} />
                          Classe d'Armure
                        </Label>
                        <Input
                          id="ac"
                          type="number"
                          min="1"
                          value={manualPlayer.ac}
                          onChange={(e) => setManualPlayer(prev => ({ 
                            ...prev, 
                            ac: parseInt(e.target.value) || 10 
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="speed">Vitesse (pieds)</Label>
                        <Input
                          id="speed"
                          type="number"
                          min="0"
                          value={manualPlayer.speed}
                          onChange={(e) => setManualPlayer(prev => ({ 
                            ...prev, 
                            speed: parseInt(e.target.value) || 30 
                          }))}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="maxHp" className="flex items-center gap-1">
                          <Heart size={14} />
                          PV Maximum
                        </Label>
                        <Input
                          id="maxHp"
                          type="number"
                          min="1"
                          value={manualPlayer.maxHp}
                          onChange={(e) => {
                            const maxHp = parseInt(e.target.value) || 10;
                            setManualPlayer(prev => ({ 
                              ...prev, 
                              maxHp,
                              currentHp: Math.min(prev.currentHp || 0, maxHp)
                            }));
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="currentHp">PV Actuels</Label>
                        <Input
                          id="currentHp"
                          type="number"
                          min="0"
                          max={manualPlayer.maxHp}
                          value={manualPlayer.currentHp}
                          onChange={(e) => setManualPlayer(prev => ({ 
                            ...prev, 
                            currentHp: parseInt(e.target.value) || 0 
                          }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Caractéristiques */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain size={18} />
                    Caractéristiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(manualPlayer.stats || {}).map(([stat, value]) => (
                      <div key={stat} className="text-center">
                        <Label className="text-xs uppercase font-medium">
                          {stat === 'strength' ? 'FOR' :
                           stat === 'dexterity' ? 'DEX' :
                           stat === 'constitution' ? 'CON' :
                           stat === 'intelligence' ? 'INT' :
                           stat === 'wisdom' ? 'SAG' : 'CHA'}
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          value={value}
                          onChange={(e) => setManualPlayer(prev => ({
                            ...prev,
                            stats: {
                              ...prev.stats!,
                              [stat]: parseInt(e.target.value) || 10
                            }
                          }))}
                          className="text-center"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {getModifier(value) >= 0 ? '+' : ''}{getModifier(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Aperçu du personnage importé */}
          {importedPlayer && (
            <>
              <Separator className="my-4" />
              <Card className="bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle size={18} />
                    Personnage prêt à importer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Nom:</span> {importedPlayer.name}
                    </div>
                    <div>
                      <span className="font-medium">Niveau:</span> {importedPlayer.level}
                    </div>
                    <div>
                      <span className="font-medium">Classe:</span> {importedPlayer.characterClass}
                    </div>
                    <div>
                      <span className="font-medium">Race:</span> {importedPlayer.race || 'Non spécifiée'}
                    </div>
                    <div>
                      <span className="font-medium">CA:</span> {importedPlayer.ac}
                    </div>
                    <div>
                      <span className="font-medium">PV:</span> {importedPlayer.currentHp}/{importedPlayer.maxHp}
                    </div>
                    <div>
                      <span className="font-medium">Vitesse:</span> {importedPlayer.speed} pieds
                    </div>
                    <div>
                      <span className="font-medium">Maîtrise:</span> +{importedPlayer.proficiencyBonus}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleFinalImport}
            disabled={!manualPlayer.name.trim() && !importedPlayer}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <User size={16} className="mr-2" />
            {editingPlayer ? 'Modifier' : 'Ajouter'} le personnage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerImportModal; 