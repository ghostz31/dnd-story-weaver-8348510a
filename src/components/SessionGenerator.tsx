
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Dice6, Download, Save, Sparkles, Clock, Users, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { GenerationResult } from './GenerationResult';

interface SessionParams {
  playerLevel: number[];
  duration: number[];
  theme: string;
  context: string;
  constraints: string;
  playerCount: number[];
}

export const SessionGenerator = () => {
  const [params, setParams] = useState<SessionParams>({
    playerLevel: [5],
    duration: [4],
    theme: '',
    context: '',
    constraints: '',
    playerCount: [4]
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!params.theme) {
      toast({
        title: "Thème requis",
        description: "Veuillez sélectionner un thème pour votre session.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulation de génération IA
    setTimeout(() => {
      const mockResult = generateMockSession(params);
      setResult(mockResult);
      setIsGenerating(false);
      toast({
        title: "Session générée !",
        description: "Votre session D&D a été créée avec succès.",
      });
    }, 3000);
  };

  const generateMockSession = (params: SessionParams) => {
    const themes = {
      exploration: {
        title: "Les Ruines Oubliées de Shadowmere",
        synopsis: "Les personnages découvrent les vestiges d'une ancienne cité elfique engloutie par la magie sauvage. Au cœur des ruines, un artefact corrompu menace de répandre sa malédiction sur les terres environnantes. Entre exploration périlleuse et mystères ancestraux, les héros devront déjouer les pièges magiques et affronter les gardiens corrompus pour sauver la région.",
        npcs: [
          {
            name: "Elara Nightwhisper",
            role: "Archéologue elfe",
            motivation: "Découvrir la vérité sur la chute de sa cité ancestrale",
            secret: "Elle est la descendante directe du dernier roi de Shadowmere",
            stats: "Niveau 6 | CA 14 | PV 45 | Sorts : Détection de la magie, Lévitation"
          },
          {
            name: "Thorek Pierre-de-Lune",
            role: "Guide nain expérimenté",
            motivation: "Protéger les voyageurs des dangers des ruines",
            secret: "Il cache une carte secrète menant au trésor royal",
            stats: "Niveau 5 | CA 16 | PV 52 | Compétences : Survie +8, Investigation +6"
          }
        ],
        locations: [
          {
            name: "Le Grand Hall des Echos",
            description: "Vast hall aux colonnes brisées où résonnent encore les chants elfiques d'antan. Des cristaux magiques parsèment le plafond effondré, diffusant une lumière bleutée mystérieuse.",
            secrets: "Un passage secret derrière le trône mène aux chambres royales"
          },
          {
            name: "La Bibliothèque Corrompue",
            description: "Les grimoires flottent dans les airs, leurs pages tournant d'elles-mêmes. La magie corrompue a transformé les mots en créatures d'encre vivante.",
            secrets: "Le livre de sorts royal contient la clé pour purifier l'artefact"
          }
        ],
        encounters: [
          {
            type: "Combat",
            name: "Gardiens Corrompus",
            description: "2 Golems de pierre animés par la magie corrompue (CR 5 chacun)",
            tactics: "Ils protègent l'accès à la chambre de l'artefact"
          },
          {
            type: "Exploration",
            name: "Le Labyrinthe de Cristal",
            description: "Puzzle magique nécessitant de réfléchir la lumière correctement",
            solution: "Arcane DC 15 ou Investigation DC 18 pour résoudre"
          }
        ]
      },
      intrigue: {
        title: "Les Masques du Carnaval Sanglant",
        synopsis: "Pendant le grand carnaval de Valdris, une série de meurtres mystérieux frappe la noblesse. Chaque victime porte un masque unique et sinistre. Les personnages doivent naviguer entre complots politiques, alliances secrètes et rituels occultes pour démasquer le véritable coupable avant que la ville ne sombre dans le chaos.",
        npcs: [
          {
            name: "Dame Isadora Blackthorn",
            role: "Noble organisatrice du carnaval",
            motivation: "Maintenir sa réputation et ses intérêts commerciaux",
            secret: "Elle finance secrètement une guilde d'assassins",
            stats: "Niveau 4 | CA 12 | PV 27 | Compétences : Persuasion +7, Tromperie +6"
          },
          {
            name: "Mordecai le Masqué",
            role: "Artisan de masques mystérieux",
            motivation: "Créer l'œuvre d'art parfaite à travers la mort",
            secret: "C'est lui le véritable meurtrier, possédé par un démon artistique",
            stats: "Niveau 7 | CA 15 | PV 58 | Sorts : Charme-personne, Suggestion"
          }
        ],
        locations: [
          {
            name: "La Place du Carnaval",
            description: "Cœur battant de la fête, illuminée par mille lanternes colorées. Artistes, nobles et roturiers se mélangent dans une danse macabre sous les masques.",
            secrets: "Un réseau de tunnels secrets sous la place utilisé par les assassins"
          },
          {
            name: "L'Atelier des Masques",
            description: "Boutique sombre remplie de masques aux expressions troublantes. L'air sent l'encens et quelque chose de plus sinistre...",
            secrets: "Les masques contiennent des fragments d'âmes de victimes précédentes"
          }
        ],
        encounters: [
          {
            type: "Social",
            name: "Bal Masqué Politique",
            description: "Naviguer entre les intrigues de cour pour obtenir des informations",
            challenge: "Persuasion, Investigation et Insight DC 12-16"
          },
          {
            type: "Combat",
            name: "Embuscade Nocturne",
            description: "4 Assassins masqués attaquent dans une ruelle sombre (CR 8 total)",
            tactics: "Ils cherchent à capturer plutôt qu'à tuer"
          }
        ]
      }
    };

    const selectedTheme = themes[params.theme as keyof typeof themes] || themes.exploration;
    
    return {
      ...selectedTheme,
      playerLevel: params.playerLevel[0],
      duration: params.duration[0],
      playerCount: params.playerCount[0],
      hooks: [
        "Une lettre mystérieuse arrive, signée par un expéditeur inconnu",
        "Des rumeurs étranges circulent dans la taverne locale",
        "Un ancien allié demande une faveur urgente",
        "Des événements surnaturels perturbent la région",
        "Une opportunité de richesse se présente, mais à quel prix ?"
      ]
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Formulaire de paramètres */}
      <div className="lg:col-span-1">
        <Card className="card-shadow sticky top-4">
          <CardHeader>
            <CardTitle className="font-cinzel flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Paramètres de Session
            </CardTitle>
            <CardDescription>
              Configurez votre session D&D parfaite
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Niveau des joueurs : {params.playerLevel[0]}
              </Label>
              <Slider
                value={params.playerLevel}
                onValueChange={(value) => setParams({...params, playerLevel: value})}
                max={20}
                min={1}
                step={1}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Nombre de joueurs : {params.playerCount[0]}
              </Label>
              <Slider
                value={params.playerCount}
                onValueChange={(value) => setParams({...params, playerCount: value})}
                max={8}
                min={2}
                step={1}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Durée (heures) : {params.duration[0]}h
              </Label>
              <Slider
                value={params.duration}
                onValueChange={(value) => setParams({...params, duration: value})}
                max={8}
                min={2}
                step={1}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Thème / Ambiance</Label>
              <Select onValueChange={(value) => setParams({...params, theme: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un thème" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exploration">🗺️ Exploration & Découverte</SelectItem>
                  <SelectItem value="intrigue">🎭 Intrigue & Mystère</SelectItem>
                  <SelectItem value="combat">⚔️ Combat & Action</SelectItem>
                  <SelectItem value="social">👥 Social & Politique</SelectItem>
                  <SelectItem value="horror">💀 Horreur & Suspense</SelectItem>
                  <SelectItem value="urban">🏰 Urbain & Civilisation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Contexte de campagne (optionnel)</Label>
              <Textarea
                placeholder="Décrivez le contexte de votre campagne, les événements précédents, les PNJ importants..."
                value={params.context}
                onChange={(e) => setParams({...params, context: e.target.value})}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Contraintes spécifiques (optionnel)</Label>
              <Textarea
                placeholder="Lieux à inclure, PNJ à faire apparaître, éléments d'intrigue à développer..."
                value={params.constraints}
                onChange={(e) => setParams({...params, constraints: e.target.value})}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !params.theme}
              className="w-full text-lg py-6 bg-primary hover:bg-primary/90 transition-all duration-300"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Dice6 className="w-5 h-5 mr-2" />
                  Générer la Session
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Zone de résultats */}
      <div className="lg:col-span-2">
        {result ? (
          <GenerationResult result={result} type="session" />
        ) : (
          <Card className="card-shadow h-full flex items-center justify-center min-h-[600px]">
            <CardContent className="text-center">
              <Dice6 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="font-cinzel text-2xl mb-2">
                Prêt à créer votre session ?
              </CardTitle>
              <CardDescription className="text-lg">
                Configurez les paramètres et cliquez sur "Générer" pour créer votre session D&D personnalisée
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
