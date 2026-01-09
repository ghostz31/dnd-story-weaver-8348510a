import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
    getParties as getLocalParties,
    getEncounters as getLocalEncounters,
    deleteEncounter as deleteLocalEncounter
} from '../lib/api';
import {
    subscribeToParties,
    subscribeToEncounters,
    saveEncounter as saveFirestoreEncounter,
    deleteEncounter as deleteFirestoreEncounter
} from '../lib/firebaseApi';
import { Party, Encounter } from '../lib/types';
import { LocalEncounter, transformLocalEncounters } from '../lib/EncounterUtils';
import { toast } from './use-toast';
import { v4 as uuidv4 } from 'uuid';

export const useEncounterRepository = () => {
    const { isAuthenticated } = useAuth();
    const [parties, setParties] = useState<Party[]>([]);
    const [encounters, setEncounters] = useState<LocalEncounter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Charger les données (Rencontres et Parties)
    useEffect(() => {
        setLoading(true);

        // Abonnements
        let unsubscribeEncounters: (() => void) | undefined;
        let unsubscribeParties: (() => void) | undefined;

        const loadData = () => {
            if (isAuthenticated) {
                // --- MODE CONNECTÉ (FIREBASE) ---
                try {
                    // 1. Abonnements aux Parties
                    unsubscribeParties = subscribeToParties((fetchedParties) => {
                        setParties(fetchedParties);
                    });

                    // 2. Abonnements aux Rencontres
                    unsubscribeEncounters = subscribeToEncounters(
                        (fetchedEncounters) => {
                            // Transformer avec les localParties en fallback immédiat ou fetchedParties si dispo (asynchrone)
                            // Note: Comme les subscriptions sont async, on peut avoir une desynchro temporaire
                            // Idéalement on devrait combiner les streams, mais ici on fait au mieux
                            const currentParties = getLocalParties(); // Fallback
                            const transformed = transformLocalEncounters(fetchedEncounters, parties.length > 0 ? parties : currentParties);
                            setEncounters(transformed);
                            setLoading(false);
                        },
                        (err) => {
                            console.error("Erreur abonnements rencontres:", err);
                            setError(err instanceof Error ? err : new Error("Erreur inconnue"));
                            toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" });
                            setLoading(false);
                        }
                    );
                } catch (err) {
                    console.error("Erreur init abonnements:", err);
                    setLoading(false);
                    // Fallback Local
                    loadLocalData();
                }
            } else {
                // --- MODE DÉCONNECTÉ (LOCALSTORAGE) ---
                loadLocalData();
                setLoading(false);
            }
        };

        const loadLocalData = () => {
            const localParties = getLocalParties();
            const localEncounters = getLocalEncounters();
            setParties(localParties);
            setEncounters(transformLocalEncounters(localEncounters, localParties));
        };

        loadData();

        return () => {
            if (unsubscribeEncounters) unsubscribeEncounters();
            if (unsubscribeParties) unsubscribeParties();
        };
    }, [isAuthenticated]); // On reload si l'auth change

    // --- ACTIONS ---

    const saveEncounter = async (encounterData: any) => {
        try {
            if (isAuthenticated) {
                const saved = await saveFirestoreEncounter(encounterData);
                if (!saved) throw new Error("Erreur sauvegarde Firestore");
                return saved;
            } else {
                // Sauvegarde Locale
                const newEncounterId = encounterData.id || uuidv4();
                const localEncounterData = {
                    ...encounterData,
                    id: newEncounterId,
                    createdAt: encounterData.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                // Retirer 'party' pour le stockage (garder partyId)
                const { party, ...storageData } = localEncounterData;

                const currentEncounters = getLocalEncounters();
                // Update or Create
                const existingIndex = currentEncounters.findIndex(e => e.id === newEncounterId);
                let updatedEncounters;

                if (existingIndex >= 0) {
                    updatedEncounters = currentEncounters.map(e => e.id === newEncounterId ? storageData : e);
                } else {
                    updatedEncounters = [storageData, ...currentEncounters];
                }

                localStorage.setItem('dnd_encounters', JSON.stringify(updatedEncounters));

                // Mettre à jour l'état local immédiatement
                const localParties = getLocalParties();
                setEncounters(transformLocalEncounters(updatedEncounters, localParties));

                return localEncounterData;
            }
        } catch (err) {
            console.error("Erreur saveEncounter:", err);
            throw err;
        }
    };

    const deleteEncounter = async (id: string): Promise<boolean> => {
        try {
            console.log(`[useEncounterRepository] Début suppression rencontre ID: ${id}`);

            if (isAuthenticated) {
                console.log("[useEncounterRepository] Mode authentifié - suppression Firestore");
                await deleteFirestoreEncounter(id);
                // Mettre à jour immédiatement l'état local pour un feedback instantané
                setEncounters(prev => prev.filter(e => e.id !== id));
                console.log("[useEncounterRepository] Suppression Firestore réussie");
            } else {
                console.log("[useEncounterRepository] Mode local - suppression LocalStorage");
                deleteLocalEncounter(id);
                setEncounters(prev => prev.filter(e => e.id !== id));
                console.log("[useEncounterRepository] Suppression locale réussie");
            }

            return true;
        } catch (err) {
            console.error("[useEncounterRepository] Erreur deleteEncounter:", err);
            toast({ title: "Erreur", description: "Impossible de supprimer la rencontre.", variant: "destructive" });
            throw err;
        }
    };

    return {
        parties,
        encounters,
        loading,
        error,
        saveEncounter,
        deleteEncounter
    };
};
