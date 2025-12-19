import React from 'react';
import { Button } from '@/components/ui/button';
import { Dice4, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';

interface TurnControlsProps {
    quickInitiativeMode: boolean;
    onToggleQuickInitiative: () => void;
    onRollInitiative: () => void;
    onPreviousTurn: () => void;
    onNextTurn: () => void;
    hasParticipants: boolean;
}

const TurnControls: React.FC<TurnControlsProps> = ({
    quickInitiativeMode,
    onToggleQuickInitiative,
    onRollInitiative,
    onPreviousTurn,
    onNextTurn,
    hasParticipants
}) => {
    return (
        <div className="flex items-center">
            <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={onRollInitiative}
            >
                <Dice4 className="h-4 w-4 mr-1" />
                Lancer
            </Button>

            <Button
                variant={quickInitiativeMode ? "default" : "outline"}
                size="sm"
                className="mr-2"
                onClick={onToggleQuickInitiative}
            >
                <Pencil className="h-4 w-4 mr-1" />
                Éditer
            </Button>

            {hasParticipants && (
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mr-2"
                        onClick={onPreviousTurn}
                        disabled={!hasParticipants}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Précédent
                    </Button>

                    <Button
                        variant="default"
                        size="sm"
                        onClick={onNextTurn}
                        disabled={!hasParticipants}
                    >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        Suivant
                    </Button>
                </>
            )}
        </div>
    );
};

export default TurnControls;
