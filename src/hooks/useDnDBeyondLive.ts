import { useEffect, useRef } from 'react';
import { EncounterParticipant } from '../lib/types';
import { toast } from '@/hooks/use-toast';

interface UseDnDBeyondLiveProps {
    participants: EncounterParticipant[];
    onUpdateHp: (id: string, newCurrentHp: number, newMaxHp: number) => void;
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

                    // Stratégie de récupération :
                    // 1. Essayer le proxy local (fonctionne en dev)
                    // 2. Fallback sur corsproxy.io (fonctionne en prod / Netlify)

                    let data = null;
                    const timestamp = Date.now();
                    const targetUrl = `https://character-service.dndbeyond.com/character/v5/character/${p.dndBeyondId}`;

                    try {
                        // Tentative 1: Proxy local
                        const localResponse = await fetch(`/api/dndbeyond/character/v5/character/${p.dndBeyondId}?t=${timestamp}`);
                        if (localResponse.ok) {
                            const jsonData = await localResponse.json();
                            data = jsonData.data || jsonData;
                        }
                    } catch (e) {
                        console.log(`[Sync] Proxy local échec, tentative fallback...`);
                    }

                    // Tentative 2: CORS Proxy public (si la tentative 1 a échoué)
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

                    // Calculer les données pour une mise à jour précise
                    // 1. Stats pour le modificateur de CON
                    const stats = char.stats || [];
                    const bonusStats = char.bonusStats || [];
                    const overrideStats = char.overrideStats || [];

                    const getStatValue = (index: number) => {
                        if (overrideStats[index] && overrideStats[index].value) return overrideStats[index].value;
                        return (stats[index]?.value || 10) + (bonusStats[index]?.value || 0);
                    };

                    const con = getStatValue(2); // CON est à l'index 2
                    const conMod = Math.floor((con - 10) / 2);

                    // 2. Niveau total
                    let level = 0;
                    if (char.classes) {
                        level = char.classes.reduce((acc: number, cls: any) => acc + (cls.level || 0), 0);
                    }

                    // 3. Calcul des PV Max
                    let maxHp = 0;
                    let currentHp = 0;
                    if (char.overrideHitPoints) {
                        maxHp = char.overrideHitPoints;
                    } else {
                        const base = char.baseHitPoints || 10;
                        const bonus = char.bonusHitPoints || 0;
                        maxHp = base + bonus + (conMod * level);
                    }

                    // 4. PV Actuels
                    const removed = char.removedHitPoints || 0;
                    // Note: D&D Beyond gère sometimes temporaryHitPoints à part
                    // currentHp = maxHp - removed + (char.temporaryHitPoints || 0); 
                    // Mais généralement display = (Max - Removed) (et Temp est affiché à côté)
                    // On va rester sur Standard HP pour l'instant
                    currentHp = maxHp - removed;

                    // Fallback si calcul échoue (ex: NPC ou format bizarre)
                    if (maxHp <= 0 && char.hitPoints) maxHp = char.hitPoints;
                    if (currentHp <= 0 && char.currentHitPoints) currentHp = char.currentHitPoints;

                    // Si les PV ont changé, on notifie
                    if (currentHp !== p.currentHp || (maxHp !== p.maxHp && maxHp > 0)) {
                        console.log(`Live Sync Update pour ${p.name}: ${p.currentHp} -> ${currentHp} / ${p.maxHp} -> ${maxHp}`);
                        onUpdateHp(p.id, currentHp, maxHp);

                        toast({
                            title: "Synchronisation D&D Beyond",
                            description: `PV de ${p.name} mis à jour : ${currentHp}/${maxHp}`,
                            duration: 2000
                        });
                    }

                } catch (err) {
                    console.error(`Erreur sync live pour ${p.name}:`, err);
                } finally {
                    processingRef.current[p.id] = false;
                }
            }
        };

        // Polling toutes les 5 secondes
        const intervalId = setInterval(checkUpdates, 5000);

        // Première vérification immédiate
        checkUpdates();

        return () => clearInterval(intervalId);
    }, [participants, enabled, onUpdateHp]);
};
