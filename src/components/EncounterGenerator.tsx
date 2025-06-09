import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sword, Shield, Users, Zap, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Monster {
  name: string;
  cr: number;
  xp: number;
  type: string;
  size: string;
  environment: string[];
  source: string;
}

interface EncounterResult {
  monsters: Array<{
    monster: Monster;
    quantity: number;
  }>;
  totalXP: number;
  adjustedXP: number;
  difficulty: string;
  environment: string;
}

const EncounterGenerator = () => {
  const [partySize, setPartySize] = useState(4);
  const [partyLevel, setPartyLevel] = useState(5);
  const [environment, setEnvironment] = useState('all');
  const [difficulty, setDifficulty] = useState('medium');
  const [encounterType, setEncounterType] = useState('combat');
  const [result, setResult] = useState<EncounterResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Tables XP par niveau et difficulté basées sur le DMG
  const xpThresholds: { [key: number]: { easy: number; medium: number; hard: number; deadly: number } } = {
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
  };

  const monsters: Monster[] = [
    { name: "Gobelin", cr: 0.25, xp: 50, type: "humanoïde", size: "P", environment: ["forêt", "montagne", "souterrain"], source: "MM" },
    { name: "Loup", cr: 0.25, xp: 50, type: "bête", size: "M", environment: ["forêt", "plaine"], source: "MM" },
    { name: "Orc", cr: 0.5, xp: 100, type: "humanoïde", size: "M", environment: ["montagne", "souterrain"], source: "MM" },
    { name: "Ours brun", cr: 1, xp: 200, type: "bête", size: "G", environment: ["forêt"], source: "MM" },
    { name: "Ogre", cr: 2, xp: 450, type: "géant", size: "G", environment: ["montagne", "forêt"], source: "MM" },
    { name: "Owlbear", cr: 3, xp: 700, type: "monstruosité", size: "G", environment: ["forêt"], source: "MM" },
    { name: "Troll", cr: 5, xp: 1800, type: "géant", size: "G", environment: ["marais", "montagne"], source: "MM" },
    { name: "Dragon jeune", cr: 8, xp: 3900, type: "dragon", size: "G", environment: ["montagne", "souterrain"], source: "MM" },
  ];

  const environments = [
    { value: 'forêt', label: 'Forêt' },
    { value: 'montagne', label: 'Montagne' },
    { value: 'souterrain', label: 'Souterrain' },
    { value: 'plaine', label: 'Plaine' },
    { value: 'marais', label: 'Marais' },
    { value: 'désert', label: 'Désert' },
    { value: 'côte', label: 'Côte' },
    { value: 'urbain', label: 'Urbain' },
  ];

  const calculateXPBudget = () => {
    const threshold = xpThresholds[Math.min(partyLevel, 10)];
    if (!threshold) return 0;
    
    const baseXP = threshold[difficulty as keyof typeof threshold] || threshold.medium;
    return baseXP * partySize;
  };

  const getEncounterMultiplier = (monsterCount: number, partySize: number) => {
    if (monsterCount === 1) return 1;
    if (monsterCount === 2) return 1.5;
    if (monsterCount <= 6) return 2;
    if (monsterCount <= 10) return 2.5;
    if (monsterCount <= 14) return 3;
    return 4;
  };

  const generateEncounter = async () => {
    setIsGenerating(true);
    
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const xpBudget = calculateXPBudget();
      let availableMonsters = monsters;
      
      // Filtrer par environnement si spécifié
      if (environment && environment !== 'all') {
        availableMonsters = monsters.filter(monster => 
          monster.environment.includes(environment)
        );
      }
      
      // Générer une rencontre équilibrée
      const selectedMonsters: Array<{ monster: Monster; quantity: number }> = [];
      let totalXP = 0;
      let attempts = 0;
      
      while (totalXP < xpBudget * 0.8 && attempts < 50) {
        const randomMonster = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
        const maxQuantity = Math.floor(xpBudget / randomMonster.xp);
        const quantity = Math.min(Math.max(1, Math.floor(Math.random() * 4)), maxQuantity);
        
        const monsterXP = randomMonster.xp * quantity;
        if (totalXP + monsterXP <= xpBudget * 1.2) {
          selectedMonsters.push({ monster: randomMonster, quantity });
          totalXP += monsterXP;
        }
        attempts++;
      }
      
      const totalMonsters = selectedMonsters.reduce((sum, m) => sum + m.quantity, 0);
      const multiplier = getEncounterMultiplier(totalMonsters, partySize);
      const adjustedXP = Math.floor(totalXP * multiplier);
      
      // Déterminer la difficulté réelle
      const thresholds = xpThresholds[Math.min(partyLevel, 10)];
      const partyThresholds = {
        easy: thresholds.easy * partySize,
        medium: thresholds.medium * partySize,
        hard: thresholds.hard * partySize,
        deadly: thresholds.deadly * partySize,
      };
      
      let actualDifficulty = 'trivial';
      if (adjustedXP >= partyThresholds.deadly) actualDifficulty = 'mortelle';
      else if (adjustedXP >= partyThresholds.hard) actualDifficulty = 'difficile';
      else if (adjustedXP >= partyThresholds.medium) actualDifficulty = 'moyenne';
      else if (adjustedXP >= partyThresholds.easy) actualDifficulty = 'facile';
      
      setResult({
        monsters: selectedMonsters,
        totalXP,
        adjustedXP,
        difficulty: actualDifficulty,
        environment: environment === 'all' ? 'variée' : environment,
      });
      
      toast({
        title: "Rencontre générée !",
        description: `Rencontre ${actualDifficulty} créée avec ${totalMonsters} créature(s).`,
      });
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer la rencontre. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-cinzel">
            <Sword className="w-5 h-5 text-primary" />
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Générateur de Rencontres Trame</h1>
              <p className="text-gray-600">Créez des rencontres équilibrées pour vos aventures</p>
            </div>
          </CardTitle>
          <CardDescription>
            Créez des rencontres équilibrées pour votre groupe d'aventuriers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="partySize">Taille du groupe</Label>
              <div className="flex items-center gap-2 mt-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="partySize"
                  type="number"
                  min={1}
                  max={8}
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value) || 4)}
                  className="w-20"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="partyLevel">Niveau du groupe</Label>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="partyLevel"
                  type="number"
                  min={1}
                  max={20}
                  value={partyLevel}
                  onChange={(e) => setPartyLevel(parseInt(e.target.value) || 5)}
                  className="w-20"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="difficulty">Difficulté</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Facile</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="hard">Difficile</SelectItem>
                  <SelectItem value="deadly">Mortelle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="environment">Environnement</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {environments.map((env) => (
                    <SelectItem key={env.value} value={env.value}>
                      {env.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Type de rencontre</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={encounterType === 'combat' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEncounterType('combat')}
              >
                <Sword className="w-4 h-4 mr-1" />
                Combat
              </Button>
              <Button
                variant={encounterType === 'exploration' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEncounterType('exploration')}
              >
                <Eye className="w-4 h-4 mr-1" />
                Exploration
              </Button>
              <Button
                variant={encounterType === 'social' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEncounterType('social')}
              >
                <Users className="w-4 h-4 mr-1" />
                Social
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={generateEncounter} 
            disabled={isGenerating}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isGenerating ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Générer la rencontre
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-cinzel">Rencontre générée</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Environnement: {result.environment}</span>
              <span>Difficulté: <span className="font-medium text-primary">{result.difficulty}</span></span>
              <span>XP: {result.totalXP} ({result.adjustedXP} ajusté)</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="font-semibold">Créatures :</h4>
              {result.monsters.map((encounter, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <span className="font-medium">{encounter.quantity}x {encounter.monster.name}</span>
                    <div className="text-sm text-muted-foreground">
                      FP {encounter.monster.cr} • {encounter.monster.type} • {encounter.monster.size}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{encounter.monster.xp * encounter.quantity} XP</div>
                    <div className="text-sm text-muted-foreground">({encounter.monster.xp} XP chacun)</div>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">XP total :</span>
                    <span className="font-medium ml-2">{result.totalXP}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">XP ajusté :</span>
                    <span className="font-medium ml-2">{result.adjustedXP}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EncounterGenerator;
