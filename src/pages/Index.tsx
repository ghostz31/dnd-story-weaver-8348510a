import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Sword, Users, Book, History, CreditCard, Check, PenTool } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';

const IndexPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <div className="bg-background min-h-screen">
      {/* Section héros */}
      <section className="text-center py-10">
        <div className="max-w-3xl mx-auto px-4">
          <PenTool className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4 font-cinzel text-center">Trame</h1>
          <p className="text-xl text-gray-600 mb-8 text-center">
            Créez facilement des rencontres équilibrées pour vos aventures D&D
          </p>
          
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/auth?mode=register">Créer un compte</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth?mode=login">Se connecter</Link>
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button size="lg" asChild>
                <Link to="/encounters">Créer une rencontre</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Section des fonctionnalités */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center font-cinzel">Fonctionnalités</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Sword className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Générateur de Rencontres</CardTitle>
                <CardDescription>
                  Créez des rencontres équilibrées en fonction du niveau et de la taille de votre groupe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Choisissez parmi des centaines de monstres du SRD 5e, ajustez automatiquement la difficulté, et obtenez des statistiques détaillées.</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/encounters">Créer une rencontre</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Gestion de Groupe</CardTitle>
                <CardDescription>
                  Créez et gérez plusieurs groupes d'aventuriers avec leurs personnages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Enregistrez les informations de votre groupe, le niveau des personnages et leurs classes pour faciliter la création de rencontres adaptées.</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/parties">Gérer mes groupes</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <History className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Historique des Rencontres</CardTitle>
                <CardDescription>
                  Conservez un historique de toutes vos rencontres créées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Retrouvez facilement vos rencontres précédentes, dupliquez-les ou modifiez-les pour les adapter à l'évolution de votre groupe.</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/history">Voir l'historique</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Section Premium */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center font-cinzel">Plan Premium</h2>
          <p className="text-xl text-gray-600 mb-8 text-center">Débloquez toutes les fonctionnalités avec notre abonnement premium</p>
          
          <div className="max-w-md mx-auto">
            <Card className="border-primary">
              <CardHeader>
                <CreditCard className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Premium</CardTitle>
                <CardDescription>
                  4,99€ / mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Groupes et personnages illimités</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Rencontres illimitées</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Créer et sauvegarder des monstres personnalisés</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Exportation PDF des rencontres</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Aucune publicité</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link to="/subscription">S'abonner</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IndexPage;
