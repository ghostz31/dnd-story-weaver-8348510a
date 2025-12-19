import { useMemo } from 'react';
import { Party, EncounterMonster, xpThresholds, getEncounterMultiplier } from '../lib/types';

interface EncounterStats {
    totalXP: number;
    adjustedXP: number;
    difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';
    xpPerPlayer: number;
    difficultyColor: string;
}

export const useEncounterLogic = (
    monsters: EncounterMonster[],
    party: Party | null
): EncounterStats => {
    return useMemo(() => {
        // 0. Cas de base : pas de monstres ou pas de groupe
        if (!monsters.length) {
            return {
                totalXP: 0,
                adjustedXP: 0,
                difficulty: 'trivial',
                xpPerPlayer: 0,
                difficultyColor: 'text-gray-500'
            };
        }

        // 1. Calcul XP Total brut
        // On s'assure que xp est traité comme un nombre, avec 0 comme fallback
        const totalXP = monsters.reduce((acc, { monster, quantity }) =>
            acc + (typeof monster.xp === 'number' ? monster.xp : 0) * quantity, 0
        );

        // 2. Calcul Multiplicateur pour XP Ajusté
        const monsterCount = monsters.reduce((acc, m) => acc + m.quantity, 0);
        // Si pas de party, on assume un groupe standard de 4 joueurs pour l'estimation
        const partySize = party?.players.length || 4;
        const multiplier = getEncounterMultiplier(monsterCount, partySize);

        // 3. XP Ajusté (celui qui détermine la difficulté)
        const adjustedXP = Math.floor(totalXP * multiplier);

        // 4. Calcul de la difficulté
        let difficulty: EncounterStats['difficulty'] = 'trivial';
        let difficultyColor = 'text-gray-500';

        if (party && party.players.length > 0) {
            // Calcul des seuils du groupe
            const thresholds = {
                easy: 0,
                medium: 0,
                hard: 0,
                deadly: 0
            };

            party.players.forEach(player => {
                // Cap niveau 20 pour éviter les crashs si niveau > 20
                const level = Math.min(Math.max(1, player.level || 1), 20);
                const playerThresholds = xpThresholds[level];

                if (playerThresholds) {
                    thresholds.easy += playerThresholds.easy;
                    thresholds.medium += playerThresholds.medium;
                    thresholds.hard += playerThresholds.hard;
                    thresholds.deadly += playerThresholds.deadly;
                }
            });

            if (adjustedXP >= thresholds.deadly) {
                difficulty = 'deadly';
                difficultyColor = 'text-red-600';
            } else if (adjustedXP >= thresholds.hard) {
                difficulty = 'hard';
                difficultyColor = 'text-orange-500';
            } else if (adjustedXP >= thresholds.medium) {
                difficulty = 'medium';
                difficultyColor = 'text-yellow-500';
            } else if (adjustedXP >= thresholds.easy) {
                difficulty = 'easy';
                difficultyColor = 'text-green-500';
            }
        }

        return {
            totalXP,
            adjustedXP,
            difficulty,
            xpPerPlayer: (party && party.players.length > 0) ? Math.floor(totalXP / party.players.length) : 0,
            difficultyColor
        };
    }, [monsters, party]);
};

// Fonction utilitaire pour calculer le XP depuis le CR (à exposer si besoin hors du hook)
export const calculateXPFromCR = (cr: number): number => {
    if (cr <= 0) return 10;
    if (cr <= 0.25) return 50;
    if (cr <= 0.5) return 100;
    if (cr <= 1) return 200;
    if (cr <= 2) return 450;
    if (cr <= 3) return 700;
    if (cr <= 4) return 1100;
    if (cr <= 5) return 1800;
    if (cr <= 6) return 2300;
    if (cr <= 7) return 2900;
    if (cr <= 8) return 3900;
    if (cr <= 9) return 5000;
    if (cr <= 10) return 5900;
    if (cr <= 11) return 7200;
    if (cr <= 12) return 8400;
    if (cr <= 13) return 10000;
    if (cr <= 14) return 11500;
    if (cr <= 15) return 13000;
    if (cr <= 16) return 15000;
    if (cr <= 17) return 18000;
    if (cr <= 18) return 20000;
    if (cr <= 19) return 22000;
    if (cr <= 20) return 25000;
    if (cr <= 21) return 33000;
    if (cr <= 22) return 41000;
    if (cr <= 23) return 50000;
    if (cr <= 24) return 62000;
    if (cr <= 25) return 75000;
    if (cr <= 26) return 90000;
    if (cr <= 27) return 105000;
    if (cr <= 28) return 120000;
    if (cr <= 29) return 135000;
    return 155000;
};
