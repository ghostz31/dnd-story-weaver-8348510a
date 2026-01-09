import React, { useMemo } from 'react';
import { Party, EncounterMonster } from '../lib/types';
import {
    calculatePartyXPThresholds,
    calculateEncounterAdjustedXP,
    getEncounterDifficulty
} from '../lib/EncounterUtils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skull, Shield, Zap, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EncounterDifficultyGaugeProps {
    party: Party;
    monsters: EncounterMonster[];
}

const EncounterDifficultyGauge: React.FC<EncounterDifficultyGaugeProps> = ({ party, monsters }) => {

    const difficultyData = useMemo(() => {
        if (!party || !party.players || party.players.length === 0) {
            return null;
        }

        const thresholds = calculatePartyXPThresholds(party);
        // Taille du groupe par défaut à 4 si non spécifiée, mais ici on a party.players.length
        const adjustedXP = calculateEncounterAdjustedXP(monsters, party.players.length);
        const difficulty = getEncounterDifficulty(adjustedXP, thresholds);

        return {
            thresholds,
            adjustedXP,
            difficulty
        };
    }, [party, monsters]);

    if (!difficultyData) {
        return (
            <Badge variant="outline" className="text-muted-foreground bg-muted border-border">
                Difficulté inconnue (Ajoutez des joueurs)
            </Badge>
        );
    }

    const { difficulty, adjustedXP, thresholds } = difficultyData;

    // Déterminer l'icône
    const DifficultyIcon = () => {
        switch (difficulty.label) {
            case 'Trivial': return <Shield className="w-4 h-4 mr-1 text-gray-500" />;
            case 'Facile': return <Shield className="w-4 h-4 mr-1" />;
            case 'Moyen': return <Zap className="w-4 h-4 mr-1" />;
            case 'Difficile': return <AlertTriangle className="w-4 h-4 mr-1" />;
            case 'Mortel': return <Skull className="w-4 h-4 mr-1" />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col gap-1 min-w-[200px]">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground">Difficulté</span>
                <Badge className={`${difficulty.color} text-white hover:${difficulty.color} border-none`}>
                    <DifficultyIcon />
                    {difficulty.label}
                </Badge>
            </div>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="relative w-full h-2.5 bg-gray-200 rounded-full overflow-hidden cursor-help">
                            <div
                                className={`h-full ${difficulty.color} transition-all duration-500 ease-out`}
                                style={{ width: `${difficulty.percentage}%` }}
                            />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="p-3 bg-popover text-popover-foreground border border-border shadow-md backdrop-blur-none">
                        <div className="space-y-1 text-xs">
                            <p className="font-bold">Budget XP: {adjustedXP} XP (Ajusté)</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                                <span className="text-green-600">Facile: {thresholds.easy}</span>
                                <span className="text-yellow-600">Moyen: {thresholds.medium}</span>
                                <span className="text-orange-600">Difficile: {thresholds.hard}</span>
                                <span className="text-red-600">Mortel: {thresholds.deadly}</span>
                            </div>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

export default EncounterDifficultyGauge;
