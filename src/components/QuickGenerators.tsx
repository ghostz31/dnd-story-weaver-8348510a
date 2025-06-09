import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MapPin, Scroll, Sword, Zap, Copy, FileText, Wand2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import EncounterGenerator from './EncounterGenerator';
import { SessionGenerator } from './SessionGenerator';
import CustomEncounterGenerator from './CustomEncounterGenerator';

const QuickGenerators = () => {
  const [npcResult, setNpcResult] = useState('');
  const [tavernResult, setTavernResult] = useState('');
  const [questResult, setQuestResult] = useState('');
  const [isGenerating, setIsGenerating] = useState('');

  const generateNPC = async () => {
    setIsGenerating('npc');
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const names = ['Aldric le Sage', 'Mira Coeur-de-Pierre', 'Finn Languefourchue', 'Lyra Chassevent'];
    const professions = ['marchand', 'forgeron', 'érudit', 'aventurier retraité'];
    const traits = ['nerveux et bavard', 'stoïque et direct', 'jovial et généreux', 'mystérieux et distant'];
    const secrets = ['cache des dettes importantes', 'était autrefois un voleur', 'connaît un passage secret', 'cherche un objet perdu'];
    
    const name = names[Math.floor(Math.random() * names.length)];
    const profession = professions[Math.floor(Math.random() * professions.length)];
    const trait = traits[Math.floor(Math.random() * traits.length)];
    const secret = secrets[Math.floor(Math.random() * secrets.length)];
    
    setNpcResult(`**${name}**
    
**Profession :** ${profession}
**Personnalité :** ${trait}
**Secret :** ${secret}
**Motivation :** Cherche à protéger sa réputation tout en aidant discrètement les aventuriers.`);
    
    setIsGenerating('');
    toast({
      title: "PNJ généré !",
      description: "Un nouveau personnage non-joueur a été créé.",
    });
  };

  const generateTavern = async () => {
    setIsGenerating('tavern');
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const names = ['Le Dragon Doré', 'La Licorne Dansante', 'Le Chaudron Bouillant', 'L\'Épée et la Rose'];
    const atmospheres = ['chaleureuse et animée', 'sombre et mystérieuse', 'rustique et familiale', 'élégante et raffinée'];
    const specialties = ['ragoût de sanglier aux herbes', 'hydromel aux baies', 'pain frais et fromage local', 'vin elfique rare'];
    const rumors = [
      'Des bandits attaquent les convois sur la route du nord',
      'Un trésor serait caché dans les ruines près du village',
      'Le maire cache quelque chose dans sa cave',
      'Des créatures étranges ont été vues dans la forêt'
    ];
    
    const name = names[Math.floor(Math.random() * names.length)];
    const atmosphere = atmospheres[Math.floor(Math.random() * atmospheres.length)];
    const specialty = specialties[Math.floor(Math.random() * specialties.length)];
    const rumor = rumors[Math.floor(Math.random() * rumors.length)];
    
    setTavernResult(`**${name}**
    
**Ambiance :** ${atmosphere}
**Spécialité :** ${specialty}
**Rumeur du jour :** ${rumor}
**Prix :** 2 po la nuit, 5 pa le repas
**Tenancier :** Personnage accueillant qui connaît tous les potins locaux.`);
    
    setIsGenerating('');
    toast({
      title: "Taverne générée !",
      description: "Un nouvel établissement a été créé.",
    });
  };

  const generateQuest = async () => {
    setIsGenerating('quest');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const hooks = [
      'Un marchand a perdu sa caravane',
      'Des enfants ont disparu du village',
      'Un noble demande une escorte',
      'Un temple a été profané'
    ];
    const locations = ['dans les bois environnants', 'dans les montagnes proches', 'dans les ruines antiques', 'dans les égouts de la ville'];
    const rewards = ['100 po et la gratitude du village', '50 po et un objet magique', '200 po et des contacts influents', '75 po et des informations précieuses'];
    const complications = [
      'les responsables ne sont pas ceux qu\'on croit',
      'un ancien rival interfère avec la mission',
      'des complications magiques surviennent',
      'le commanditaire cache ses vraies motivations'
    ];
    
    const hook = hooks[Math.floor(Math.random() * hooks.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    const complication = complications[Math.floor(Math.random() * complications.length)];
    
    setQuestResult(`**Accroche :** ${hook}
    
**Lieu :** L'aventure se déroule ${location}
**Récompense :** ${reward}
**Complication :** Attention, ${complication}
**Durée estimée :** 1-2 sessions selon l'approfondissement`);
    
    setIsGenerating('');
    toast({
      title: "Quête générée !",
      description: "Une nouvelle aventure attend vos joueurs.",
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié !",
        description: "Le contenu a été copié dans le presse-papiers.",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le contenu.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Tabs defaultValue="encounters" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-12 bg-muted/50 p-1">
          <TabsTrigger value="encounters" className="text-sm data-[state=active]:bg-white">
            <Sword className="w-4 h-4 mr-1" />
            Rencontres
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-sm data-[state=active]:bg-white">
            <Wand2 className="w-4 h-4 mr-1" />
            Personnalisé
          </TabsTrigger>
          <TabsTrigger value="npcs" className="text-sm data-[state=active]:bg-white">
            <Users className="w-4 h-4 mr-1" />
            PNJ
          </TabsTrigger>
          <TabsTrigger value="locations" className="text-sm data-[state=active]:bg-white">
            <MapPin className="w-4 h-4 mr-1" />
            Lieux
          </TabsTrigger>
          <TabsTrigger value="quests" className="text-sm data-[state=active]:bg-white">
            <Scroll className="w-4 h-4 mr-1" />
            Quêtes
          </TabsTrigger>
          <TabsTrigger value="session" className="text-sm data-[state=active]:bg-white">
            <FileText className="w-4 h-4 mr-1" />
            Session
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encounters" className="mt-6">
          <EncounterGenerator />
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <CustomEncounterGenerator />
        </TabsContent>

        <TabsContent value="session" className="mt-6">
          <SessionGenerator />
        </TabsContent>

        <TabsContent value="npcs" className="mt-6">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-cinzel">
                <Users className="w-5 h-5 text-primary" />
                Générateur de PNJ
              </CardTitle>
              <CardDescription>
                Créez instantanément des personnages non-joueurs mémorables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={generateNPC} 
                disabled={isGenerating === 'npc'}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isGenerating === 'npc' ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Générer un PNJ
                  </>
                )}
              </Button>
              
              {npcResult && (
                <div className="relative">
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm">{npcResult}</pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(npcResult)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="mt-6">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-cinzel">
                <MapPin className="w-5 h-5 text-primary" />
                Générateur de Tavernes
              </CardTitle>
              <CardDescription>
                Créez des lieux d'accueil pour vos aventuriers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={generateTavern} 
                disabled={isGenerating === 'tavern'}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isGenerating === 'tavern' ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Générer une taverne
                  </>
                )}
              </Button>
              
              {tavernResult && (
                <div className="relative">
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm">{tavernResult}</pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(tavernResult)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quests" className="mt-6">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-cinzel">
                <Scroll className="w-5 h-5 text-primary" />
                Générateur de Quêtes
              </CardTitle>
              <CardDescription>
                Créez rapidement des aventures pour vos joueurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={generateQuest} 
                disabled={isGenerating === 'quest'}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isGenerating === 'quest' ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Générer une quête
                  </>
                )}
              </Button>
              
              {questResult && (
                <div className="relative">
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm">{questResult}</pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(questResult)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuickGenerators;
