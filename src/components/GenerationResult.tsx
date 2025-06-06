
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Save, Copy, Share2, Users, MapPin, Sword, Crown, Scroll } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GenerationResultProps {
  result: any;
  type: 'session' | 'quick';
}

export const GenerationResult = ({ result, type }: GenerationResultProps) => {
  const handleExport = () => {
    toast({
      title: "Export en cours",
      description: "Votre contenu sera bientôt téléchargé en PDF.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Sauvegardé !",
      description: "Votre contenu a été ajouté à votre bibliothèque.",
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    toast({
      title: "Copié !",
      description: "Le contenu a été copié dans le presse-papiers.",
    });
  };

  if (type === 'session') {
    return (
      <div className="space-y-6">
        {/* Header avec actions */}
        <Card className="card-shadow">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <CardTitle className="font-cinzel text-2xl">{result.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span>Niveau {result.playerLevel}</span>
                  <span>•</span>
                  <span>{result.duration}h de jeu</span>
                  <span>•</span>
                  <span>{result.playerCount} joueurs</span>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copier
                </Button>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Sauver
                </Button>
                <Button size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Synopsis */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-cinzel flex items-center gap-2">
              <Scroll className="w-5 h-5 text-primary" />
              Synopsis de la Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{result.synopsis}</p>
          </CardContent>
        </Card>

        {/* PNJ */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-cinzel flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Personnages Non-Joueurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.npcs.map((npc: any, index: number) => (
              <div key={index} className="border-l-4 border-primary/30 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{npc.name}</h3>
                  <Badge variant="secondary">{npc.role}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Motivation :</strong> {npc.motivation}</p>
                  <p><strong>Secret :</strong> <em>{npc.secret}</em></p>
                  <p><strong>Stats :</strong> {npc.stats}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Lieux */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-cinzel flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Lieux Importants
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.locations.map((location: any, index: number) => (
              <div key={index} className="border-l-4 border-secondary/50 pl-4">
                <h3 className="font-semibold text-lg mb-2">{location.name}</h3>
                <p className="mb-3">{location.description}</p>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm"><strong>Secret :</strong> <em>{location.secrets}</em></p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Encounters */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-cinzel flex items-center gap-2">
              <Sword className="w-5 h-5 text-primary" />
              Encounters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.encounters.map((encounter: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{encounter.name}</h3>
                  <Badge variant={encounter.type === 'Combat' ? 'destructive' : 'default'}>
                    {encounter.type}
                  </Badge>
                </div>
                <p className="mb-2">{encounter.description}</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Tactiques/Solution :</strong> {encounter.tactics || encounter.solution}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Hooks pour futures sessions */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-cinzel">Hooks pour Sessions Futures</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.hooks.map((hook: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>{hook}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Affichage pour les générateurs rapides
  const renderQuickResult = () => {
    const data = result.data;
    
    switch (result.type) {
      case 'npc':
        return (
          <Card className="card-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-cinzel text-2xl">{data.name}</CardTitle>
                  <CardDescription>{data.race} • {data.profession}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Apparence & Personnalité</h3>
                <p className="mb-2"><strong>Âge :</strong> {data.age}</p>
                <p className="mb-2"><strong>Apparence :</strong> {data.appearance}</p>
                <p><strong>Personnalité :</strong> {data.personality}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Histoire & Motivations</h3>
                <p className="mb-2">{data.backstory}</p>
                <p className="mb-2"><strong>Motivation :</strong> {data.motivation}</p>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p><strong>Secret :</strong> <em>{data.secret}</em></p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Statistiques de Jeu</h3>
                <p className="mb-2">{data.stats}</p>
                <p className="mb-2"><strong>Inventaire :</strong> {data.inventory.join(', ')}</p>
                <p><strong>Relations :</strong> {data.relationships}</p>
              </div>
            </CardContent>
          </Card>
        );

      case 'tavern':
        return (
          <Card className="card-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-cinzel text-2xl">{data.name}</CardTitle>
                  <CardDescription>{data.type}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Ambiance & Description</h3>
                <p className="mb-2"><strong>Atmosphère :</strong> {data.atmosphere}</p>
                <p>{data.description}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Propriétaire</h3>
                <p className="mb-1"><strong>{data.owner.name}</strong></p>
                <p className="mb-2">{data.owner.description}</p>
                <p><strong>Personnalité :</strong> {data.owner.personality}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Habitués</h3>
                <ul className="space-y-1">
                  {data.regulars.map((regular: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>{regular}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Menu & Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Spécialités</h4>
                    <ul className="space-y-1 text-sm">
                      {data.specialties.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Hébergement</h4>
                    <p className="text-sm">{data.rooms}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Rumeurs & Secrets</h3>
                <div className="bg-muted/50 p-3 rounded-lg mb-3">
                  <p><strong>Secret :</strong> <em>{data.secrets}</em></p>
                </div>
                <h4 className="font-medium mb-2">Rumeurs entendues :</h4>
                <ul className="space-y-1">
                  {data.rumors.map((rumor: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                      <span>"{rumor}"</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case 'quest':
        return (
          <Card className="card-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-cinzel text-2xl">{data.title}</CardTitle>
                  <CardDescription>{data.type} • {data.level} • {data.duration}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Donneur de Quête</h3>
                <p className="mb-1"><strong>{data.giver.name}</strong></p>
                <p className="mb-2">{data.giver.description}</p>
                <p><strong>Récompense :</strong> {data.giver.reward}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Situation Initiale</h3>
                <p>{data.setup}</p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Indices & Investigation</h3>
                <ul className="space-y-1">
                  {data.investigation.map((clue: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>{clue}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">La Vérité</h3>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p>{data.truth}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Lieux Importants</h3>
                <ul className="space-y-1">
                  {data.locations.map((location: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                      <span>{location}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Encounters & Complications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Encounters</h4>
                    <ul className="space-y-1 text-sm">
                      {data.encounters.map((encounter: string, index: number) => (
                        <li key={index}>• {encounter}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Complications</h4>
                    <ul className="space-y-1 text-sm">
                      {data.complications.map((complication: string, index: number) => (
                        <li key={index}>• {complication}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Résolution</h3>
                <p>{data.resolution}</p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="font-cinzel">Contenu Généré</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderQuickResult()}
    </div>
  );
};
