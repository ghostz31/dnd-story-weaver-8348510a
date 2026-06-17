import { useEffect, useRef } from 'react';
import { EncounterParticipant } from '../lib/types';
import { toast } from '@/hooks/use-toast';
import { calculateDndBeyondAC } from '@/lib/dndBeyondUtils';

interface UseDnDBeyondLiveProps {
    participants: EncounterParticipant[];
    onUpdateHp: (id: string, updates: Partial<EncounterParticipant>) => void; // Changed signature to generic update
    enabled: boolean;
}

export const useDnDBeyondLive = ({ participants, onUpdateHp, enabled }: UseDnDBeyondLiveProps) => {
    // Ref pour éviter les mises à jour pendant qu'on digère une réponse
    const processingRef = useRef<Record<string, boolean>>({});

    useEffect(() => {
        if (!enabled) return;

        // Filtrer les participants qui ont un ID D&D Beyond et ne sont PAS des monstres (pour l'instant que les joueurs)
        // Seulement les participants avec syncSource 'beyond' ou sans syncSource (rétro-compatibilité)
        const trackedParticipants = participants.filter(p => p.dndBeyondId && p.isPC && (!p.syncSource || p.syncSource === 'beyond'));

        if (trackedParticipants.length === 0) return;

        // Fonction de vérification
        const checkUpdates = async () => {
            for (const p of trackedParticipants) {
                if (!p.dndBeyondId || processingRef.current[p.id]) continue;

                try {
                    processingRef.current[p.id] = true;

                    // Stratégie de récupération
                    let data = null;
                    const timestamp = Date.now();
                    const targetUrl = `https://character-service.dndbeyond.com/character/v5/character/${p.dndBeyondId}`;

                    try {
                        const localResponse = await fetch(`/api/dndbeyond/character/v5/character/${p.dndBeyondId}?t=${timestamp}`);
                        if (localResponse.ok) {
                            const jsonData = await localResponse.json();
                            data = jsonData.data || jsonData;
                        }
                    } catch (e) { /* Fallback silent */ }

                    if (!data) {
                        try {
                            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}?t=${timestamp}`;
                            const proxyResponse = await fetch(proxyUrl);
                            if (proxyResponse.ok) {
                                const jsonData = await proxyResponse.json();
                                data = jsonData.data || jsonData;
                            }
                        } catch (e) {
                            console.error(`[Sync] Échec total pour ${p.name}`, e);
                        }
                    }

                    if (!data) continue;

                    const char = data;

                    const extracted = extractCharacterFromBeyond(data, p.dndBeyondId);

                    // --- Vérification et Update ---
                    const updates: Partial<EncounterParticipant> = {};
                    let hasChanges = false;
                    const changeLog: string[] = [];

                    if (extracted.currentHp !== p.currentHp || (extracted.maxHp !== p.maxHp && extracted.maxHp > 0)) {
                        updates.currentHp = extracted.currentHp;
                        updates.maxHp = extracted.maxHp;
                        hasChanges = true;
                        changeLog.push(`PV: ${extracted.currentHp}/${extracted.maxHp}`);
                    }

                    // CA Update
                    // On ne met à jour que si différent et non nul
                    if (extracted.ac && extracted.ac !== p.ac) {
                        updates.ac = extracted.ac;
                        hasChanges = true;
                        changeLog.push(`CA: ${extracted.ac}`);
                    }

                    // Si stats changent significativement (Optionnel, peut être lourd)
                    // On le fait car ça impacte les jets
                    if (extracted.dex !== p.dex || extracted.con !== p.con) { 
                        updates.str = extracted.str; updates.dex = extracted.dex; updates.con = extracted.con;
                        updates.int = extracted.int; updates.wis = extracted.wis; updates.cha = extracted.cha;
                        hasChanges = true;
                    }



                    if (hasChanges) {
                        console.log(`Live Sync Update pour ${p.name}:`, changeLog);
                        onUpdateHp(p.id, updates); // Using updated generic callback signature

                        toast({
                            title: `Sync D&D Beyond (${p.name})`,
                            description: `Mise à jour: ${changeLog.join(', ')}`,
                            duration: 3000
                        });
                    }

                } catch (err) {
                    console.error(`Erreur sync live pour ${p.name}:`, err);
                } finally {
                    processingRef.current[p.id] = false;
                }
            }
        };

        const intervalId = setInterval(checkUpdates, 5000);
        checkUpdates();

        return () => clearInterval(intervalId);
    }, [participants, enabled, onUpdateHp]);
};
