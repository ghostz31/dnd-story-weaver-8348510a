
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, Scroll, ShoppingBag, Dice6, Crown, Sword } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { GenerationResult } from './GenerationResult';

interface Generator {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
}

const generators: Generator[] = [
  {
    id: 'npc',
    name: 'PNJ Aléatoire',
    description: 'Générez un personnage non-joueur complet avec backstory',
    icon: Users,
    category: 'Personnages'
  },
  {
    id: 'tavern',
    name: 'Taverne',
    description: 'Créez une taverne unique avec ambiance et habitués',
    icon: ShoppingBag,
    category: 'Lieux'
  },
  {
    id: 'quest',
    name: 'Quête Rapide',
    description: 'Générez une quête secondaire en quelques secondes',
    icon: Scroll,
    category: 'Aventures'
  },
  {
    id: 'location',
    name: 'Lieu Mystérieux',
    description: 'Découvrez un lieu intrigant pour vos aventures',
    icon: MapPin,
    category: 'Lieux'
  },
  {
    id: 'noble',
    name: 'Noble & Politique',
    description: 'Créez des personnages influents et leurs intrigues',
    icon: Crown,
    category: 'Personnages'
  },
  {
    id: 'encounter',
    name: 'Encounter Surprise',
    description: 'Générez un encounter équilibré pour votre groupe',
    icon: Sword,
    category: 'Combat'
  }
];

export const QuickGenerators = () => {
  const [result, setResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGenerator, setCurrentGenerator] = useState<string>('');

  const handleGenerate = async (generatorId: string) => {
    setIsGenerating(true);
    setCurrentGenerator(generatorId);
    
    // Simulation de génération
    setTimeout(() => {
      const mockResult = generateMockContent(generatorId);
      setResult(mockResult);
      setIsGenerating(false);
      toast({
        title: "Contenu généré !",
        description: `Votre ${generators.find(g => g.id === generatorId)?.name} a été créé.`,
      });
    }, 2000);
  };

  const generateMockContent = (type: string) => {
    const content: any = {
      type: type,
      generatedAt: new Date().toLocaleString('fr-FR')
    };

    switch (type) {
      case 'npc':
        content.data = {
          name: "Seraphina Cœur-de-Braise",
          race: "Tieffelin",
          profession: "Alchimiste & Herboriste",
          age: "147 ans (apparence de 30 ans)",
          personality: "Curieuse, méfiante envers les autorités, passionnée par les plantes rares",
          appearance: "Peau rouge cuivrée, cornes spiralées, yeux verts perçants, toujours tachée d'encre alchimique",
          backstory: "Bannie de sa ville natale après qu'une de ses expériences ait mal tourné, elle voyage maintenant de ville en ville, vendant ses potions et étudiant la flore locale. Elle cache un grimoire interdit dans sa besace.",
          motivation: "Prouver que l'alchimie peut guérir n'importe quelle maladie",
          secret: "Elle est recherchée par l'Inquisition pour possession de magie nécromantique",
          stats: "Niveau 4 | CA 12 | PV 31 | Compétences : Médecine +6, Nature +5, Alchimie +7",
          inventory: ["Trousse d'herboriste", "Grimoire secret", "3 potions de soin", "Ingrédients rares"],
          relationships: "Alliée potentielle si les PJ respectent son travail, ennemie si ils la dénoncent"
        };
        break;

      case 'tavern':
        content.data = {
          name: "Le Chaudron Fumant",
          type: "Taverne-Auberge",
          atmosphere: "Chaleureuse mais mystérieuse, fréquentée par des voyageurs aux histoires étranges",
          description: "Une taverne de deux étages aux poutres noircies par la fumée. L'odeur d'épices exotiques et de ragoût mijote constamment. Des artefacts étranges décorent les murs, trophées des aventures du propriétaire.",
          owner: {
            name: "Gareth Main-d'Fer",
            description: "Ancien aventurier nain, bras droit remplacé par une prothèse magique en mithril",
            personality: "Jovial mais observateur, connaît tous les ragots locaux"
          },
          regulars: [
            "Vieille Marta - Oracle locale qui lit l'avenir dans les feuilles de thé",
            "Les jumeaux Pierrevent - Marchands halfelins aux informations précieuses",
            "Capitaine Rochefort - Garde retraité qui recrute discrètement pour des 'missions'"
          ],
          specialties: [
            "Ragoût du Voyageur (1 po) - Redonne 1d4 PV",
            "Hydromel des Ancêtres (5 po) - Avantage sur les jets de Charisme pendant 1h",
            "Café des Mille Lieues (2 po) - Pas besoin de dormir pendant 8h"
          ],
          rooms: "6 chambres disponibles (2 po/nuit), dont une suite luxueuse (10 po/nuit)",
          secrets: "Cave secrète où Gareth cache des objets magiques de ses anciennes aventures",
          rumors: [
            "Des créatures étranges rôdent près de l'ancien moulin",
            "La fille du maire a disparu il y a trois jours",
            "On dit qu'un trésor est caché dans les collines"
          ]
        };
        break;

      case 'quest':
        content.data = {
          title: "Les Chats Mystérieusement Disparus",
          type: "Quête d'enquête & sauvetage",
          level: "Niveau 2-4",
          duration: "1-2 heures",
          giver: {
            name: "Dame Millicent Pattedouce",
            description: "Vieille dame excentrique, propriétaire de 12 chats",
            reward: "50 po + potion de soins supérieure"
          },
          setup: "Tous les chats du quartier disparaissent mystérieusement la nuit. Dame Millicent est désespérée et soupçonne de la magie noire.",
          investigation: [
            "Les chats ne montrent aucun signe de lutte",
            "Des traces de poudre scintillante près des lieux de disparition",
            "Les témoins rapportent avoir entendu une mélodie étrange la nuit"
          ],
          truth: "Un druide solitaire les attire avec une flûte magique pour les protéger d'un culte qui veut les sacrifier lors de la prochaine lune noire",
          locations: [
            "Quartier résidentiel - Lieux des disparitions",
            "Forêt proche - Cachette du druide",
            "Ruines antiques - Repaire du culte"
          ],
          encounters: [
            "Négociation avec le druide méfiant",
            "Infiltration du repaire cultiste",
            "Combat contre 3 cultistes + leur leader (invocateur)"
          ],
          complications: [
            "Les chats ne veulent pas revenir",
            "Le culte découvre l'enquête des PJ",
            "D'autres animaux commencent à disparaître"
          ],
          resolution: "Sauver les chats ET empêcher le rituel du culte pour obtenir la récompense complète"
        };
        break;

      case 'location':
        content.data = {
          name: "La Tour des Murmures Éternels",
          type: "Ruine magique ancienne",
          size: "Tour de 7 étages, partiellement effondrée",
          history: "Ancienne tour d'un archimage fou qui tentait de communiquer avec les morts. Abandonnée depuis 200 ans après sa disparition mystérieuse.",
          current_state: "Envahie par la végétation, mais des lumières étranges s'y allument parfois la nuit. Les locaux l'évitent soigneusement.",
          floors: [
            "Rez-de-chaussée : Laboratoire en ruines, alambics brisés, créatures de vase",
            "1er étage : Bibliothèque aux livres qui murmurent, fantômes de pages",
            "2e étage : Chambre personnelle, portrait hanté de l'archimage",
            "3e étage : Observatoire, télescope magique encore fonctionnel",
            "4e étage : Effondré",
            "5e étage : Sanctuaire secret, cercle d'invocation actif",
            "6e étage : Sommet, antenne de communication avec l'au-delà"
          ],
          hazards: [
            "Magie instable - Jets de sauvegarde contre les effets chaotiques",
            "Sols fragiles dans les étages supérieurs",
            "Murmures constants qui peuvent rendre fou (Sagesse DC 12)"
          ],
          treasures: [
            "Grimoire de communication avec les morts",
            "Baguette de détection des morts-vivants",
            "Gemme contenant l'âme de l'archimage",
            "Plans secrets d'autres tours similaires"
          ],
          creatures: [
            "Spectres des assistants de l'archimage",
            "Vases grises dans le laboratoire",
            "Familier immortel (corbeau squelettique parlant)"
          ],
          secrets: "L'archimage n'est pas mort - il est piégé dans le plan éthéré et cherche quelqu'un pour le libérer",
          adventure_hooks: [
            "Récupérer un objet spécifique pour un client",
            "Enquêter sur les lumières nocturnes",
            "Libérer (ou bannir définitivement) l'archimage"
          ]
        };
        break;

      case 'noble':
        content.data = {
          name: "Comte Aldric de Valmont",
          title: "Comte de Valmont, Seigneur des Terres de Brume",
          age: "45 ans",
          family: "Marié à Comtesse Elena, deux enfants : Isabelle (20 ans) et Marcus (17 ans)",
          appearance: "Homme distingué aux cheveux argentés prématurément, porte toujours des vêtements sombres et coûteux. Regard perçant et sourire énigmatique.",
          personality: "Charmant en public, calculateur en privé. Intelligent et patient, prêt à attendre des années pour ses plans",
          public_reputation: "Noble généreux et juste, patron des arts et protecteur des pauvres",
          hidden_truth: "Dirige secrètement un réseau d'espionnage et manipule la politique régionale",
          goals: [
            "Étendre son influence politique",
            "Protéger sa famille à tout prix",
            "Découvrir qui a tué son frère il y a 10 ans"
          ],
          resources: [
            "Fortune considérable (200,000 po estimé)",
            "Réseau d'espions dans 5 villes",
            "Garde personnelle de 20 hommes d'armes",
            "Alliances avec 3 autres nobles majeurs"
          ],
          enemies: [
            "Baron Morteus - Rival politique",
            "La Guilde des Voleurs - Il a fait exécuter leur ancien chef",
            "Son propre neveu - Héritier légitime qu'il a déshérité"
          ],
          current_plots: [
            "Marier sa fille à un prince étranger pour une alliance",
            "Infiltrer la cour royale avec ses agents",
            "Éliminer discrètement le Baron Morteus",
            "Retrouver l'assassin de son frère"
          ],
          secrets: [
            "Il correspond secrètement avec des agents d'un royaume ennemi",
            "Sa fortune vient en partie du pillage de tombes anciennes",
            "Il soupçonne sa propre épouse d'infidélité"
          ],
          hooks_for_pcs: [
            "Embauche les PJ comme garde du corps pour sa fille",
            "Leur demande d'enquêter sur la mort de son frère",
            "Les PJ découvrent l'un de ses complots par accident",
            "Propose de financer leur groupe en échange de services"
          ]
        };
        break;

      case 'encounter':
        content.data = {
          name: "Embuscade des Loups-Garous Maudits",
          type: "Combat avec twist narratif",
          cr: "Défi 6 (pour 4 joueurs niveau 4-5)",
          setting: "Route forestière au crépuscule, près d'un ancien carrefour marqué d'une pierre runique",
          setup: "Les PJ entendent des hurlements au loin, puis des cris d'aide. En arrivant, ils trouvent un marchand blessé près de sa carriole renversée.",
          initial_phase: {
            description: "Le marchand (en fait un loup-garou) supplie les PJ de l'aider. Si ils s'approchent, il révèle sa vraie nature.",
            creatures: "1 Loup-garou (le 'marchand')",
            tactics: "Feint la faiblesse puis attaque par surprise avec avantage au premier round"
          },
          escalation: {
            description: "Au round 3, 2 vrais loups-garous sortent des buissons pour aider leur 'frère'",
            creatures: "2 Loups-garous supplémentaires",
            twist: "Ils ne veulent pas tuer les PJ - ils cherchent à les infecter pour agrandir leur meute"
          },
          environment: [
            "Pierre runique : Peut être activée avec un sort de niveau 1+ pour bannir les lycanthropes (Religion DC 15 pour comprendre)",
            "Carriole renversée : Peut être utilisée comme couverture ou arme improvisée",
            "Forêt dense : Visibilité réduite, permet de se cacher (Discrétion DC 12)"
          ],
          special_mechanics: [
            "Malédiction lycanthropique : DC 12 Constitution save ou infection",
            "Régénération réduite près de la pierre runique",
            "Les loups-garous fuient si réduits à moins de 1/4 de leurs PV"
          ],
          treasure: [
            "Vraie cargaison du marchand : 150 po de soies et épices",
            "Amulette de protection contre la lycanthropie (magique)",
            "Carte mentionnant d'autres attaques de loups-garous dans la région"
          ],
          consequences: [
            "Si les PJ sont infectés : Nouveau arc narratif de quête pour guérison",
            "Si ils tuent les lycanthropes : La meute entière les traque",
            "Si ils les laissent fuir : D'autres voyageurs seront attaqués"
          ],
          scaling: {
            easier: "Réduire à 2 loups-garous total, ou leur donner des blessures existantes",
            harder: "Ajouter 2-3 loups normaux, ou rendre la pierre runique plus difficile à activer"
          }
        };
        break;

      default:
        content.data = { message: "Type de générateur non reconnu" };
    }

    return content;
  };

  const groupedGenerators = generators.reduce((acc, generator) => {
    if (!acc[generator.category]) {
      acc[generator.category] = [];
    }
    acc[generator.category].push(generator);
    return acc;
  }, {} as Record<string, Generator[]>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Générateurs */}
      <div className="lg:col-span-1">
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-cinzel">Générateurs Rapides</CardTitle>
            <CardDescription>
              Créez du contenu en quelques secondes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(groupedGenerators).map(([category, gens]) => (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {category}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {gens.map((generator) => (
                    <Button
                      key={generator.id}
                      variant="outline"
                      className="justify-start h-auto p-4 text-left hover:bg-primary/5 transition-all duration-200"
                      onClick={() => handleGenerate(generator.id)}
                      disabled={isGenerating}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <generator.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{generator.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {generator.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Zone de résultats */}
      <div className="lg:col-span-2">
        {result ? (
          <GenerationResult result={result} type="quick" />
        ) : (
          <Card className="card-shadow h-full flex items-center justify-center min-h-[600px]">
            <CardContent className="text-center">
              {isGenerating ? (
                <>
                  <Dice6 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                  <CardTitle className="font-cinzel text-2xl mb-2">
                    Génération en cours...
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Création de votre {generators.find(g => g.id === currentGenerator)?.name}
                  </CardDescription>
                </>
              ) : (
                <>
                  <Dice6 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <CardTitle className="font-cinzel text-2xl mb-2">
                    Générateurs Rapides
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Sélectionnez un générateur pour créer du contenu instantanément
                  </CardDescription>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
