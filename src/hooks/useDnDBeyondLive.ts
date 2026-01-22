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
        const trackedParticipants = participants.filter(p => p.dndBeyondId && p.isPC);

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
                            console.error(`[Sync] Echec total pour ${p.name}`, e);
                        }
                    }

                    if (!data) continue;

                    const char = data;

                    // --- Extraction Stats ---
                    const stats = char.stats || [];
                    const bonusStats = char.bonusStats || [];
                    const overrideStats = char.overrideStats || [];

                    const getStatValue = (index: number) => {
                        if (overrideStats[index] && overrideStats[index].value) return overrideStats[index].value;
                        return (stats[index]?.value || 10) + (bonusStats[index]?.value || 0);
                    };

                    const str = getStatValue(0);
                    const dex = getStatValue(1);
                    const con = getStatValue(2);
                    const int = getStatValue(3);
                    const wis = getStatValue(4);
                    const cha = getStatValue(5);

                    const conMod = Math.floor((con - 10) / 2);

                    // --- Calcul PV ---
                    let level = 0;
                    if (char.classes) {
                        level = char.classes.reduce((acc: number, cls: any) => acc + (cls.level || 0), 0);
                    }

                    let maxHp = 0;
                    let currentHp = 0;
                    if (char.overrideHitPoints) {
                        maxHp = char.overrideHitPoints;
                    } else {
                        const base = char.baseHitPoints || 10;
                        const bonus = char.bonusHitPoints || 0;
                        maxHp = base + bonus + (conMod * level);
                    }

                    const removed = char.removedHitPoints || 0;
                    currentHp = maxHp - removed;

                    if (maxHp <= 0 && char.hitPoints) maxHp = char.hitPoints;
                    if (currentHp <= 0 && char.currentHitPoints) currentHp = char.currentHitPoints;

                    // --- Calcul CA (Nouveau) ---
                    const newAc = calculateDndBeyondAC(char, { dex, con, wis });

                    // --- Vérification et Update ---
                    const updates: Partial<EncounterParticipant> = {};
                    let hasChanges = false;
                    const changeLog: string[] = [];

                    if (currentHp !== p.currentHp || (maxHp !== p.maxHp && maxHp > 0)) {
                        updates.currentHp = currentHp;
                        updates.maxHp = maxHp;
                        hasChanges = true;
                        changeLog.push(`PV: ${currentHp}/${maxHp}`);
                    }

                    // CA Update
                    // On ne met à jour que si différent et non nul
                    if (newAc && newAc !== p.ac) {
                        updates.ac = newAc;
                        hasChanges = true;
                        changeLog.push(`CA: ${newAc}`);
                    }

                    // Si stats changent significativement (Optionnel, peut être lourd)
                    // On le fait car ça impacte les jets
                    if (dex !== p.dex || con !== p.con) { // Juste exemples
                        updates.str = str; updates.dex = dex; updates.con = con;
                        updates.int = int; updates.wis = wis; updates.cha = cha;
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
