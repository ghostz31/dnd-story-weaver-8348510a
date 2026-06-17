import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
    type User,
    onAuthStateChanged,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const isTestMode = import.meta.env.VITE_TEST_MODE === 'true';

function createTestUser(): User {
    return {
        uid: 'test-user-001',
        email: 'bottest@besace.local',
        displayName: 'Beta Testeur',
        photoURL: null,
        phoneNumber: null,
        providerId: 'test',
        isAnonymous: false,
        tenantId: null,
        metadata: { creationTime: '', lastSignInTime: '' },
        providerData: [],
        emailVerified: true,
        refreshToken: '',
        getIdToken: async () => 'test-token',
        getIdTokenResult: async () => ({ token: 'test-token' } as any),
        toJSON: () => ({}),
        delete: async () => {},
        reload: async () => {},
    };
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isTestMode) {
            setUser(createTestUser());
            const userRef = doc(db, 'users', 'test-user-001');
            getDoc(userRef).then(async (userDoc) => {
                if (!userDoc.exists()) {
                    await setDoc(userRef, {
                        email: 'bottest@besace.local',
                        displayName: 'Beta Testeur',
                        photoURL: '',
                        createdAt: serverTimestamp(),
                        lastLogin: serverTimestamp(),
                    });
                } else {
                    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
                }
            });
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);

            if (currentUser) {
                setUser(currentUser);

                const userRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userRef);

                if (!userDoc.exists()) {
                    await setDoc(userRef, {
                        email: currentUser.email,
                        displayName: currentUser.displayName || '',
                        photoURL: currentUser.photoURL || '',
                        createdAt: serverTimestamp(),
                        lastLogin: serverTimestamp(),
                    });
                } else {
                    await setDoc(userRef, {
                        lastLogin: serverTimestamp()
                    }, { merge: true });
                }
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        if (isTestMode) return;
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Erreur de connexion Google:", error);
            throw error;
        }
    };

    const logout = async () => {
        if (isTestMode) return;
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Erreur de déconnexion:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated: !!user,
            signInWithGoogle,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
