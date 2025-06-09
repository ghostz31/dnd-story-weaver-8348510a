import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Sword, Users, Book, History, CreditCard, Check } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userData } = useAuth();
  
  return (
    <div className="space-y-8">
      {/* Hero section */}
      <section className="text-center py-10">
        <div className="max-w-3xl mx-auto px-4">
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4 font-cinzel">D&D Story Weaver</h1>
          <p className="text-xl text-gray-600 mb-8">
            Créez des rencontres épiques pour vos aventures Donjons & Dragons
          </p>
          
          {!isAuthenticated ? (
            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Créer un compte
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/monsters')}>
                Explorer le bestiaire
              </Button>
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/custom')}>
                Créer une rencontre
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/parties')}>
                Gérer mes groupes
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-8">
        <h2 className="text-2xl font-bold text-center mb-8 font-cinzel">Fonctionnalités</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Sword className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Générateur de Rencontres</CardTitle>
              <CardDescription>
                Créez des rencontres équilibrées pour votre groupe d'aventuriers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Filtrez les monstres par type, environnement et indice de danger pour créer des rencontres parfaitement adaptées au niveau de votre groupe.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/custom')}>
                Créer une rencontre
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Gestion des Groupes</CardTitle>
              <CardDescription>
                Enregistrez vos groupes d'aventuriers pour un usage rapide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Gardez une trace des personnages de vos joueurs avec leurs classes, niveaux et autres caractéristiques pour des calculs de difficulté précis.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/parties')}>
                Gérer les groupes
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <Book className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Bestiaire Complet</CardTitle>
              <CardDescription>
                Accédez à une base de données de créatures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Parcourez notre collection de monstres issus du Manuel des Monstres et d'autres sources, filtrez par type, environnement ou indice de danger.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/monsters')}>
                Explorer le bestiaire
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
      
      {/* Subscription plans */}
      <section className="py-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-2 font-cinzel">Plans d'abonnement</h2>
        <p className="text-center text-gray-600 mb-8">
          Choisissez le plan qui convient à vos besoins
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className={`border ${!isAuthenticated || userData?.role === 'free' ? 'border-primary' : ''}`}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Plan Gratuit</span>
                {userData?.role === 'free' && (
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Actuel
                  </span>
                )}
              </CardTitle>
              <CardDescription>Parfait pour commencer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                0€ <span className="text-sm font-normal text-gray-500">/mois</span>
              </div>
              
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Accès au bestiaire complet</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Générateur de rencontres</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Maximum 3 rencontres sauvegardées</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Maximum 1 groupe de joueurs</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {!isAuthenticated ? (
                <Button className="w-full" onClick={() => navigate('/auth')}>
                  Créer un compte gratuit
                </Button>
              ) : userData?.role === 'free' ? (
                <Button className="w-full" variant="outline" disabled>
                  Votre plan actuel
                </Button>
              ) : (
                <Button className="w-full" variant="outline">
                  Rétrograder
                </Button>
              )}
            </CardFooter>
          </Card>
          
          <Card className={`border ${userData?.role === 'premium' ? 'border-primary' : ''}`}>
            <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100">
              <CardTitle className="flex justify-between items-center">
                <span>Plan Premium</span>
                {userData?.role === 'premium' && (
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Actuel
                  </span>
                )}
              </CardTitle>
              <CardDescription>Pour les maîtres du donjon chevronnés</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                4,99€ <span className="text-sm font-normal text-gray-500">/mois</span>
              </div>
              
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Accès au bestiaire complet</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Générateur de rencontres avancé</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Rencontres et groupes illimités</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Support prioritaire</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Fonctionnalités premium à venir</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {!isAuthenticated ? (
                <Button className="w-full" variant="outline" onClick={() => navigate('/auth')}>
                  Créer un compte pour commencer
                </Button>
              ) : userData?.role === 'premium' ? (
                <Button className="w-full" variant="outline" disabled>
                  Votre plan actuel
                </Button>
              ) : (
                <Button className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Passer au plan premium
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
