import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Check, AlertCircle, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success' | 'error'>('details');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Cette fonction simule le processus de paiement
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation de base
    if (!cardDetails.cardNumber.trim() || !cardDetails.cardHolder.trim() || 
        !cardDetails.expiryDate.trim() || !cardDetails.cvv.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    // Validation du numéro de carte (simple)
    if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
      setError('Le numéro de carte doit contenir 16 chiffres');
      return;
    }
    
    // Validation de la date d'expiration (simple)
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      setError('Format de date invalide. Utilisez MM/YY');
      return;
    }
    
    // Validation du CVV (simple)
    if (!/^\d{3}$/.test(cardDetails.cvv)) {
      setError('Le CVV doit contenir 3 chiffres');
      return;
    }
    
    try {
      setIsLoading(true);
      setPaymentStep('processing');
      
      // Simuler un appel API à Stripe ou autre service de paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dans une application réelle, nous enverrions ces données à un serveur sécurisé
      // qui traiterait le paiement via Stripe, et mettrait à jour le rôle utilisateur
      
      // Pour cette démonstration, nous simulons simplement un succès
      setPaymentStep('success');
      
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error);
      setPaymentStep('error');
      setError('Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gérer le formatage du numéro de carte
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
      
      <div className="text-center mb-8">
        <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-2 font-cinzel">Abonnement Premium</h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          Débloquez toutes les fonctionnalités pour devenir le meilleur maître de jeu possible
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardHeader>
              <CardTitle>Plan Premium</CardTitle>
              <CardDescription>Accès complet à toutes les fonctionnalités</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                4,99€ <span className="text-sm font-normal text-gray-500">/mois</span>
              </div>
              
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Rencontres et groupes illimités</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Générateur de rencontres avancé</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Support prioritaire</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Mises à jour premium en avant-première</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>Annulation à tout moment</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <div className="mt-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-medium mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-amber-600" />
                Paiement sécurisé
              </h3>
              <p className="text-sm text-gray-600">
                Tous les paiements sont sécurisés et vos informations bancaires ne sont jamais stockées sur nos serveurs.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium mb-2">Satisfait ou remboursé</h3>
              <p className="text-sm text-gray-600">
                Si vous n'êtes pas satisfait, nous vous remboursons intégralement dans les 30 jours suivant votre abonnement.
              </p>
            </div>
          </div>
        </div>
        
        <div>
          {paymentStep === 'details' && (
            <Card>
              <CardHeader>
                <CardTitle>Informations de paiement</CardTitle>
                <CardDescription>
                  Entrez vos coordonnées bancaires pour vous abonner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Numéro de carte</Label>
                    <div className="flex items-center border rounded-md pl-3 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                      <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={cardDetails.cardNumber}
                        onChange={(e) => setCardDetails({
                          ...cardDetails,
                          cardNumber: formatCardNumber(e.target.value)
                        })}
                        maxLength={19}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardHolder">Titulaire de la carte</Label>
                    <Input
                      id="cardHolder"
                      placeholder="JEAN DUPONT"
                      value={cardDetails.cardHolder}
                      onChange={(e) => setCardDetails({
                        ...cardDetails,
                        cardHolder: e.target.value.toUpperCase()
                      })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Date d'expiration</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Format MM/YY
                          if (/^[0-9]{0,2}$/.test(val)) {
                            setCardDetails({
                              ...cardDetails,
                              expiryDate: val
                            });
                          } else if (/^[0-9]{2}\/[0-9]{0,2}$/.test(val)) {
                            setCardDetails({
                              ...cardDetails,
                              expiryDate: val
                            });
                          } else if (/^[0-9]{2}$/.test(val)) {
                            setCardDetails({
                              ...cardDetails,
                              expiryDate: val + '/'
                            });
                          }
                        }}
                        maxLength={5}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        type="password"
                        value={cardDetails.cvv}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^[0-9]{0,3}$/.test(val)) {
                            setCardDetails({
                              ...cardDetails,
                              cvv: val
                            });
                          }
                        }}
                        maxLength={3}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-4" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Traitement en cours...
                      </>
                    ) : (
                      'S\'abonner maintenant - 4,99€/mois'
                    )}
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500 mt-2">
                    En vous abonnant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
          
          {paymentStep === 'processing' && (
            <Card className="flex flex-col items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <CardTitle className="mb-2">Traitement en cours</CardTitle>
              <CardDescription className="text-center">
                Veuillez patienter pendant que nous traitons votre paiement...
              </CardDescription>
            </Card>
          )}
          
          {paymentStep === 'success' && (
            <Card className="flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="mb-2">Abonnement réussi!</CardTitle>
              <CardDescription className="text-center mb-6">
                Vous êtes maintenant abonné au plan Premium. Profitez de toutes les fonctionnalités!
              </CardDescription>
              <Button onClick={() => navigate('/')}>
                Retour à l'accueil
              </Button>
            </Card>
          )}
          
          {paymentStep === 'error' && (
            <Card className="flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="mb-2">Une erreur est survenue</CardTitle>
              <CardDescription className="text-center mb-6">
                {error || "Nous n'avons pas pu traiter votre paiement. Veuillez réessayer."}
              </CardDescription>
              <Button onClick={() => setPaymentStep('details')}>
                Réessayer
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage; 