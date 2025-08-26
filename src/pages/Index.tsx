import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Sword, Users, Book, History, CreditCard, Check, PenTool, Zap, Star, TrendingUp, Clock, Dice6 } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const IndexPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalMonsters: 314,
    encountersCreated: 1247,
    activeUsers: 89
  });
  const [animatedStats, setAnimatedStats] = useState({
    totalMonsters: 0,
    encountersCreated: 0,
    activeUsers: 0
  });

  // Animation des statistiques au chargement
  useEffect(() => {
    const animateStats = () => {
      const duration = 2000; // 2 secondes
      const steps = 60;
      const interval = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setAnimatedStats({
          totalMonsters: Math.floor(stats.totalMonsters * progress),
          encountersCreated: Math.floor(stats.encountersCreated * progress),
          activeUsers: Math.floor(stats.activeUsers * progress)
        });
        
        if (step >= steps) {
          clearInterval(timer);
          setAnimatedStats(stats);
        }
      }, interval);
    };
    
    animateStats();
  }, []);
  
  return (
    <div className="bg-background min-h-screen">
      {/* Section héros avec animation */}
      <section className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-bounce mb-6">
            <PenTool className="h-20 w-20 text-primary mx-auto" />
          </div>
          <h1 className="text-5xl font-bold mb-6 font-cinzel text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Trame
          </h1>
          <p className="text-xl text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            L'outil ultime pour créer des rencontres épiques et gérer vos aventures D&D 5e
          </p>
          
          {/* Statistiques animées */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border">
              <div className="text-3xl font-bold text-blue-600">{animatedStats.totalMonsters}</div>
              <div className="text-sm text-gray-600">Monstres disponibles</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border">
              <div className="text-3xl font-bold text-green-600">{animatedStats.encountersCreated}</div>
              <div className="text-sm text-gray-600">Rencontres créées</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border">
              <div className="text-3xl font-bold text-purple-600">{animatedStats.activeUsers}</div>
              <div className="text-sm text-gray-600">MJ actifs</div>
            </div>
          </div>
          
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                <Link to="/auth?mode=register">
                  <Star className="h-5 w-5 mr-2" />
                  Créer un compte
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth?mode=login">Se connecter</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600" asChild>
                <Link to="/encounters">
                  <Zap className="h-5 w-5 mr-2" />
                  Créer une rencontre
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/encounter-tracker?source=session">
                  <Dice6 className="h-5 w-5 mr-2" />
                  Lancer un combat
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50" asChild>
                <Link to="/encounter-tracker-test">
                  <Zap className="h-5 w-5 mr-2" />
                  Combat (Système Expérimental)
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Section des fonctionnalités améliorée */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4 text-center font-cinzel">Fonctionnalités</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Découvrez tous les outils dont vous avez besoin pour mener des sessions inoubliables
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Générateur de Rencontres - Amélioré */}
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-red-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Sword className="h-8 w-8 text-red-500 mb-2" />
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Populaire
                  </Badge>
                </div>
                <CardTitle>Générateur de Rencontres</CardTitle>
                <CardDescription>
                  Créez des rencontres équilibrées en fonction du niveau et de la taille de votre groupe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Choisissez parmi des centaines de monstres du SRD 5e, ajustez automatiquement la difficulté, et obtenez des statistiques détaillées.</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Calcul automatique de la difficulté
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Base de données de 314+ monstres
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Génération par environnement
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full hover:bg-red-50" asChild>
                  <Link to="/encounters">Créer une rencontre</Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Gestion de Groupe - Amélioré */}
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-blue-500 mb-2" />
                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                    Nouveau
                  </Badge>
                </div>
                <CardTitle>Gestion de Groupe</CardTitle>
                <CardDescription>
                  Créez et gérez plusieurs groupes d'aventuriers avec leurs personnages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Enregistrez les informations de votre groupe, le niveau des personnages et leurs classes pour faciliter la création de rencontres adaptées.</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Import D&D Beyond
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Statistiques détaillées
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Gestion multi-groupes
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full hover:bg-blue-50" asChild>
                  <Link to="/parties">Gérer mes groupes</Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Tracker de Combat - Nouveau */}
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Shield className="h-8 w-8 text-green-500 mb-2" />
                  <Badge variant="default" className="bg-green-600">
                    <Clock className="h-3 w-3 mr-1" />
                    Temps réel
                  </Badge>
                </div>
                <CardTitle>Tracker de Combat</CardTitle>
                <CardDescription>
                  Gérez l'initiative, les PV, et les conditions en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Interface intuitive pour suivre tous les aspects du combat, avec modification des PV max à la volée.</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Modification PV max en combat
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Gestion des conditions
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Raccourcis clavier
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full hover:bg-green-50" asChild>
                  <Link to="/encounter-tracker">Lancer un combat</Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Navigateur de Monstres */}
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-purple-500">
              <CardHeader>
                <Book className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle>Navigateur de Monstres</CardTitle>
                <CardDescription>
                  Explorez notre base de données complète de créatures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Recherchez, filtrez et découvrez des centaines de monstres avec leurs statistiques complètes en français.</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Recherche avancée
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Filtres par CR, type, taille
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Images et descriptions
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full hover:bg-purple-50" asChild>
                  <Link to="/monsters">Explorer les monstres</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Historique et Sauvegarde */}
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-orange-500">
              <CardHeader>
                <History className="h-8 w-8 text-orange-500 mb-2" />
                <CardTitle>Historique & Sauvegarde</CardTitle>
                <CardDescription>
                  Gardez une trace de toutes vos aventures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Sauvegardez automatiquement vos rencontres et retrouvez l'historique de toutes vos sessions.</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Sauvegarde automatique
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Historique des combats
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Export/Import
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {isAuthenticated ? (
                  <Button variant="ghost" className="w-full hover:bg-orange-50" asChild>
                    <Link to="/encounters">Voir l'historique</Link>
                  </Button>
                ) : (
                  <Button variant="ghost" className="w-full hover:bg-orange-50" asChild>
                    <Link to="/auth?mode=register">Se connecter</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Section de témoignages/avantages */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12 font-cinzel">Pourquoi choisir Trame ?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gain de temps</h3>
              <p className="text-gray-600">Préparez vos sessions 10x plus rapidement avec nos outils automatisés</p>
            </div>
            
            <div className="p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Qualité garantie</h3>
              <p className="text-gray-600">Rencontres équilibrées et testées par la communauté</p>
            </div>
            
            <div className="p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Communauté active</h3>
              <p className="text-gray-600">Rejoignez des milliers de MJ qui utilisent Trame</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action final */}
      {!isAuthenticated && (
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Prêt à révolutionner vos sessions ?</h2>
            <p className="text-xl mb-8 opacity-90">Rejoignez la communauté et créez votre première rencontre en moins de 5 minutes</p>
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link to="/auth?mode=register">
                <Star className="h-5 w-5 mr-2" />
                Commencer gratuitement
              </Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default IndexPage;
