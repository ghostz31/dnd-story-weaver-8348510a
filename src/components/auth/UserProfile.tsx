import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../../auth/AuthContext';
import { UserCircle, LogOut, Loader2, CreditCard, AlertCircle, Mail, Lock } from 'lucide-react';
import { getUserStats } from '../../lib/firebaseApi';
import { UserStats } from '../../lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  
  // Informations de profil
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  
  // Email
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  
  // Mot de passe
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // États généraux
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [activeTab, setActiveTab] = useState("profil");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (user) {
          setDisplayName(user.displayName || '');
          setEmail(user.email || '');
          
          // Charger les statistiques de l'utilisateur
          const userStats = await getUserStats();
          setStats(userStats);
          
          // Vérifier si l'utilisateur a un abonnement premium
          setIsPremium(userStats.maxParties === Number.POSITIVE_INFINITY);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
      }
    };
    
    loadUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!displayName.trim()) {
      setError('Le nom d\'utilisateur ne peut pas être vide');
      return;
    }
    
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Mettre à jour le profil Firebase
      await updateProfile(user, { displayName });
      
      // Mettre à jour le document utilisateur dans Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: displayName
      });
      
      setSuccess('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (error) {
      setError('Une erreur est survenue lors de la mise à jour du profil');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email.trim()) {
      setError('L\'adresse email ne peut pas être vide');
      return;
    }
    
    if (!currentPassword) {
      setError('Veuillez entrer votre mot de passe pour confirmer');
      return;
    }
    
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Réauthentifier l'utilisateur
      const credential = EmailAuthProvider.credential(
        user.email!, 
        currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // Mettre à jour l'adresse email
      await updateEmail(user, email);
      
      // Mettre à jour le document utilisateur dans Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        email: email
      });
      
      setSuccess('Adresse email mise à jour avec succès');
      setIsChangingEmail(false);
      setCurrentPassword('');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setError('Mot de passe incorrect');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('Cette adresse email est déjà utilisée');
      } else {
        setError('Une erreur est survenue lors de la mise à jour de l\'email');
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!oldPassword) {
      setError('Veuillez entrer votre mot de passe actuel');
      return;
    }
    
    if (!newPassword) {
      setError('Le nouveau mot de passe ne peut pas être vide');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Réauthentifier l'utilisateur
      const credential = EmailAuthProvider.credential(
        user.email!, 
        oldPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // Mettre à jour le mot de passe
      await updatePassword(user, newPassword);
      
      setSuccess('Mot de passe mis à jour avec succès');
      setIsChangingPassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setError('Mot de passe actuel incorrect');
      } else {
        setError('Une erreur est survenue lors de la mise à jour du mot de passe');
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Mon Compte</CardTitle>
              <CardDescription>Gérez votre profil et vos paramètres</CardDescription>
            </div>
            <Badge variant={isPremium ? "default" : "outline"}>
              {isPremium ? 'Premium' : 'Gratuit'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="profil">Profil</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="motdepasse">Mot de passe</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profil" className="space-y-4">
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nom d'utilisateur</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sauvegarde...
                        </>
                      ) : (
                        'Sauvegarder'
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setDisplayName(user.displayName || '');
                        setError('');
                        setSuccess('');
                      }}
                      disabled={isLoading}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div className="border rounded-md p-2 w-full bg-gray-50">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Nom d'utilisateur</Label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <UserCircle className="h-4 w-4 text-gray-500" />
                        <div className="border rounded-md p-2 flex-grow bg-gray-50">
                          {user.displayName || 'Non défini'}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditing(true)}
                      >
                        Modifier
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 mt-4">
                    <h3 className="font-medium mb-2">Statistiques du compte</h3>
                    {stats && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Groupes créés</p>
                          <p className="font-medium">{stats.parties}/{isPremium ? '∞' : stats.maxParties}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Rencontres sauvegardées</p>
                          <p className="font-medium">{stats.encounters}/{isPremium ? '∞' : stats.maxEncounters}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Nouvelle adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="Entrez votre mot de passe pour confirmer"
                  />
                  <p className="text-xs text-gray-500">Pour des raisons de sécurité, veuillez entrer votre mot de passe actuel</p>
                </div>
                
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    'Mettre à jour l\'email'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="motdepasse" className="space-y-4">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Mot de passe actuel</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">Le mot de passe doit contenir au moins 6 caractères</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    'Mettre à jour le mot de passe'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-4 mt-6">
            <div className="border rounded-md p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Plan actuel</h3>
                  <p className="text-sm text-gray-500">
                    {isPremium 
                      ? 'Vous avez accès à toutes les fonctionnalités premium' 
                      : 'Plan gratuit avec fonctionnalités limitées'}
                  </p>
                </div>
                <Badge variant={isPremium ? "default" : "outline"}>
                  {isPremium ? 'Premium' : 'Gratuit'}
                </Badge>
              </div>
              
              {!isPremium && stats && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Limitations du plan gratuit:</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center">
                      <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                      Maximum {stats.maxParties} groupe
                    </li>
                    <li className="flex items-center">
                      <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                      Maximum {stats.maxEncounters} rencontres sauvegardées
                    </li>
                  </ul>
                  
                  <Button className="w-full mt-4" variant="default" onClick={() => window.location.href = '/subscription'}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Passer au plan premium
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserProfile; 