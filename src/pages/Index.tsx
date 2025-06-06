import { useState } from 'react';
import { Dice1, Dice6, Users, Scroll, Sparkles, ChevronRight, Crown, Sword, Shield, Map, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionGenerator } from '@/components/SessionGenerator';
import QuickGenerators from '@/components/QuickGenerators';
import EncounterGenerator from '@/components/EncounterGenerator';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [activeTab, setActiveTab] = useState('session');

  const handleGetStarted = () => {
    setActiveTab('session');
    document.getElementById('generators')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEncounterGenerator = () => {
    setActiveTab('quick');
    document.getElementById('generators')?.scrollIntoView({ behavior: 'smooth' });
    // Small delay to ensure tab switch happens first
    setTimeout(() => {
      const encounterTab = document.querySelector('[value="encounters"]');
      if (encounterTab) {
        (encounterTab as HTMLElement).click();
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden parchment-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="container relative px-4 py-24 mx-auto lg:py-32">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <Crown className="w-4 h-4" />
              L'Assistant IA des Maîtres de Donjon
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-cinzel font-bold mb-6 bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              Divisez par 2 votre temps de préparation
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Créez des sessions D&D épiques en quelques minutes grâce à l'IA spécialisée. 
              PNJ, lieux, encounters et scénarios générés automatiquement.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl group"
                onClick={handleGetStarted}
              >
                Commencer gratuitement
                <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300"
              >
                Voir la démo
                <Dice6 className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-3xl font-cinzel font-bold text-primary mb-2">4h → 30min</div>
                <div className="text-muted-foreground">Temps de préparation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-cinzel font-bold text-primary mb-2">1000+</div>
                <div className="text-muted-foreground">MJ utilisent déjà l'outil</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-cinzel font-bold text-primary mb-2">50K+</div>
                <div className="text-muted-foreground">Sessions générées</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold mb-4">
              Tout ce dont un MJ a besoin
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des outils spécialisés D&D pour créer du contenu de qualité en quelques clics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Scroll,
                title: "Sessions complètes",
                description: "Synopsis, PNJ, lieux et encounters générés automatiquement"
              },
              {
                icon: Users,
                title: "PNJ vivants",
                description: "Personnages avec motivations, secrets et statistiques complètes"
              },
              {
                icon: Map,
                title: "Lieux immersifs",
                description: "Descriptions détaillées et cartes pour vos aventures"
              },
              {
                icon: Sword,
                title: "Encounters équilibrés",
                description: "Combat, social et exploration adaptés à votre groupe"
              }
            ].map((feature, index) => (
              <Card key={index} className="card-shadow border-0 hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="font-cinzel">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Encounter Generator Highlight Section */}
      <section className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="card-shadow border-2 border-primary/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
              <CardHeader className="text-center relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sword className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-3xl md:text-4xl font-cinzel font-bold mb-4">
                  Générateur de Rencontres D&D
                </CardTitle>
                <CardDescription className="text-lg max-w-2xl mx-auto">
                  Créez des rencontres équilibrées en quelques clics. Notre IA calcule automatiquement 
                  la difficulté, l'XP et sélectionne les créatures adaptées à votre groupe.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">Adapté à votre groupe</h4>
                    <p className="text-sm text-muted-foreground">
                      Niveau, taille du groupe et difficulté souhaitée
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">Calculs automatiques</h4>
                    <p className="text-sm text-muted-foreground">
                      XP, multiplicateurs et équilibrage selon les règles D&D 5e
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Map className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">Environnements variés</h4>
                    <p className="text-sm text-muted-foreground">
                      Créatures adaptées au lieu de l'aventure
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl group"
                    onClick={handleEncounterGenerator}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Tester le générateur
                    <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Generators Section */}
      <section id="generators" className="py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold mb-4">
              Générateurs IA spécialisés
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Testez dès maintenant nos outils de génération automatique
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 p-1">
                <TabsTrigger 
                  value="session" 
                  className="text-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Scroll className="w-5 h-5 mr-2" />
                  Générateur de Session
                </TabsTrigger>
                <TabsTrigger 
                  value="quick" 
                  className="text-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Générateurs Rapides
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="session" className="mt-8">
                <SessionGenerator />
              </TabsContent>
              
              <TabsContent value="quick" className="mt-8">
                <QuickGenerators />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-muted-foreground">
              Commencez gratuitement, upgrader quand vous voulez
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="card-shadow border-2 border-muted">
              <CardHeader className="text-center">
                <CardTitle className="font-cinzel text-2xl">Gratuit</CardTitle>
                <CardDescription>Pour découvrir les outils</CardDescription>
                <div className="text-4xl font-bold text-primary mt-4">0€</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    3 sessions complètes / mois
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    Générateurs rapides illimités
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    Export PDF basique
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline">
                  Commencer gratuitement
                </Button>
              </CardContent>
            </Card>

            <Card className="card-shadow border-2 border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">
                Populaire
              </div>
              <CardHeader className="text-center">
                <CardTitle className="font-cinzel text-2xl">Premium</CardTitle>
                <CardDescription>Pour les MJ passionnés</CardDescription>
                <div className="text-4xl font-bold text-primary mt-4">9,99€<span className="text-lg text-muted-foreground">/mois</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    Sessions illimitées
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    Exports PDF premium
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    Templates de campagne
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    Support prioritaire
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-primary hover:bg-primary/90">
                  Passer à Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-background">
        <div className="container px-4 mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Dice1 className="w-6 h-6 text-primary" />
            <span className="text-xl font-cinzel font-bold">Campaign Assistant</span>
          </div>
          <p className="text-muted-foreground">
            L'outil indispensable des Maîtres de Donjon modernes
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
