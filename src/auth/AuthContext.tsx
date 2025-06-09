import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      
      if (currentUser) {
        setUser(currentUser);
        
        // Vérifier/créer le profil utilisateur dans Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // Créer un nouveau profil utilisateur
          await setDoc(userRef, {
            email: currentUser.email,
            displayName: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            subscriptionPlan: 'free',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            stats: {
              parties: 0,
              encounters: 0
            }
          });
        } else {
          // Mettre à jour la date de dernière connexion
          await setDoc(userRef, {
            lastLogin: serverTimestamp()
          }, { merge: true });
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, displayName?: string) => {
    try {
      // Créer le compte utilisateur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      // Créer immédiatement le profil utilisateur dans Firestore
      const userRef = doc(db, 'users', newUser.uid);
      await setDoc(userRef, {
        email: newUser.email,
        displayName: displayName || '',
        photoURL: newUser.photoURL || '',
        subscriptionPlan: 'free',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        stats: {
          parties: 0,
          encounters: 0
        }
      });
      
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  };
  
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Erreur de réinitialisation du mot de passe:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}; 