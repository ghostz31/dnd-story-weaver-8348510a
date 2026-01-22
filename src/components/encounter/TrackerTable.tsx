import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sword, Skull, Plus, Minus, Square, User, Ghost, Link,
    ArrowDown, Users, EyeOff, Smile, Droplets, Anchor, Clock, Brain, Eye, ShieldX, Zap, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EncounterParticipant } from '@/lib/types';
import { CONDITIONS, getConditionInfo, extractNumericHP } from '@/lib/EncounterUtils';
import { getMonsterImageUrl } from '@/lib/monsterUtils';
import { getHPBarColor } from '@/lib/hpColorUtils';

interface TrackerTableProps {
    participants: EncounterParticipant[];
    currentTurnParticipantId: string | undefined;
    selectedParticipantId: string | null;
    quickInitiativeMode: boolean;

    // UI States managed by parent
    hpModifierValue: number;
    showHpModifier: string | null;

    // Actions
    onSelect: (id: string | null) => void;
    onUpdateHp: (id: string, amount: number) => void;
    onMove: (id: string, direction: 'up' | 'down') => void;
    onInitiativeChange: (id: string, value: number) => void;
    onOpenInitiativeEditor: (participant: EncounterParticipant) => void;
    onSetHpModifier: (value: number) => void;
    onToggleHpModifier: (id: string | null) => void;
    onToggleCondition: (id: string, condition: string) => void;
    onOpenNotes: (participant: EncounterParticipant) => void;
    onRemove: (id: string) => void;
    onOpenCreatureFrame: (id: string) => void;
    onSetTempHp?: (id: string, value: number) => void;
}

const TrackerTable: React.FC<TrackerTableProps> = ({
    participants,
    currentTurnParticipantId,
    selectedParticipantId,
    quickInitiativeMode,
    hpModifierValue,
    showHpModifier,
    onSelect,
    onUpdateHp,
    onMove,
    onInitiativeChange,
    onOpenInitiativeEditor,
    onSetHpModifier,
    onToggleHpModifier,
    onToggleCondition,
    onOpenNotes,
    onRemove,
    onOpenCreatureFrame,
    onSetTempHp
}) => {

    const getStatusBadge = (participant: EncounterParticipant) => {
        const numericMaxHp = extractNumericHP(participant.maxHp);
        const hpPercentage = (participant.currentHp / numericMaxHp) * 100;

        if (participant.currentHp <= 0) {
            return <Badge className="bg-gray-500">Mort</Badge>;
        } else if (hpPercentage <= 25) {
            return <Badge className="bg-red-500">Critique</Badge>;
        } else if (hpPercentage <= 50) {
            return <Badge className="bg-orange-500">Blessé</Badge>;
        } else if (hpPercentage < 100) {
            return <Badge className="bg-yellow-500">Touché</Badge>;
        } else {
            return <Badge className="bg-green-500">Indemne</Badge>;
        }
    };

    return (
        <div className="w-full">
            <Table className="w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">Tour</TableHead>
                        <TableHead className="min-w-[200px]">Nom</TableHead>
                        <TableHead className="w-[80px]">Init</TableHead>
                        <TableHead className="w-[60px]">CA</TableHead>
                        <TableHead className="w-[100px]">PV</TableHead>
                        <TableHead className="w-[180px]">État</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <AnimatePresence mode="popLayout">
                        {participants.map((participant, index) => {
                            const isCurrentTurn = currentTurnParticipantId === participant.id;
                            const isSelected = selectedParticipantId === participant.id;

                            return (
                                <motion.tr
                                    key={participant.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className={`
                    border-b transition-colors data-[state=selected]:bg-muted
                    cursor-pointer
                    ${isCurrentTurn ? 'bg-blue-100 hover:bg-blue-200 border-l-4 border-blue-600 shadow-sm' : 'hover:bg-gray-50'}
                    ${isSelected && !isCurrentTurn ? 'bg-amber-50 border-l-4 border-amber-400' : ''}
                  `}
                                    onClick={() => onSelect(participant.id)}
                                >
                                    <TableCell>
                                        {isCurrentTurn && (
                                            <div className="flex justify-center">
                                                <Sword className="h-5 w-5 text-blue-600 animate-pulse" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {/* Image ou Icône */}
                                            <div className="flex-shrink-0 w-[60px] h-[60px] rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shadow-sm">
                                                {(() => {
                                                    // Déterminer l'URL de l'image
                                                    let imageUrl: string | undefined;

                                                    if (participant.isPC) {
                                                        imageUrl = participant.image;
                                                    } else {
                                                        // Pour les monstres, utiliser le helper du bestiaire
                                                        imageUrl = getMonsterImageUrl(participant as any);
                                                    }

                                                    // Si on a une URL d'image, l'afficher avec fallback
                                                    if (imageUrl) {
                                                        return (
                                                            <>
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={participant.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        const img = e.target as HTMLImageElement;
                                                                        img.style.display = 'none';
                                                                        const fallback = img.nextElementSibling as HTMLElement;
                                                                        if (fallback) {
                                                                            fallback.style.display = 'flex';
                                                                        }
                                                                    }}
                                                                />
                                                                <div className="hidden items-center justify-center w-full h-full">
                                                                    {participant.isPC ? (
                                                                        <User className="h-6 w-6 text-gray-400" />
                                                                    ) : (
                                                                        <Ghost className="h-6 w-6 text-gray-400" />
                                                                    )}
                                                                </div>
                                                            </>
                                                        );
                                                    }

                                                    // Pas d'image disponible, afficher l'icône directement
                                                    return (
                                                        <div className="flex items-center justify-center w-full h-full">
                                                            {participant.isPC ? (
                                                                <User className="h-6 w-6 text-gray-400" />
                                                            ) : (
                                                                <Ghost className="h-6 w-6 text-gray-400" />
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            {/* Nom et détails */}
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">
                                                    <div className="whitespace-nowrap flex items-center gap-1" title={participant.name}>
                                                        {participant.name}
                                                        {participant.concentration && (
                                                            <span className="text-indigo-500 flex items-center gap-0.5" title={`Concentration: ${participant.concentration.spellName}`}>
                                                                <Brain className="h-3 w-3 animate-pulse" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    {participant.isPC && (
                                                        <Badge variant="outline" className="text-xs">PC</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {participant.notes && (
                                            <div className="text-xs text-gray-500">{participant.notes}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-1">
                                            {quickInitiativeMode ? (
                                                <Input
                                                    type="number"
                                                    value={participant.initiative}
                                                    onChange={(e) => onInitiativeChange(participant.id, parseInt(e.target.value) || 0)}
                                                    className="w-16 h-8 text-center"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <span
                                                    className="cursor-pointer hover:underline min-w-[30px] text-center text-2xl font-extrabold"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onOpenInitiativeEditor(participant);
                                                    }}
                                                >
                                                    {participant.initiative}
                                                </span>
                                            )}
                                            <div className="flex flex-col">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMove(participant.id, 'up');
                                                    }}
                                                >
                                                    <span className="text-[10px]">▲</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMove(participant.id, 'down');
                                                    }}
                                                >
                                                    <span className="text-[10px]">▼</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{participant.ac}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {/* Affichage principal des PV */}
                                            <div className="flex items-center space-x-1">
                                                <div
                                                    className="font-bold text-sm cursor-pointer font-mono"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleHpModifier(showHpModifier === participant.id ? null : participant.id);
                                                        if (showHpModifier !== participant.id) onSetHpModifier(1);
                                                    }}
                                                    title={`${extractNumericHP(participant.currentHp)}/${extractNumericHP(participant.maxHp)} PV - Cliquer pour modifier`}
                                                >
                                                    <span className="font-extrabold">{extractNumericHP(participant.currentHp)}</span>/{extractNumericHP(participant.maxHp)}
                                                    {participant.tempHp && participant.tempHp > 0 && (
                                                        <span className="text-xs text-blue-500 ml-1">+{participant.tempHp}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Interface de modification rapide */}
                                            {showHpModifier === participant.id && (
                                                <div className="flex items-center space-x-1 p-1 bg-gray-50 rounded border" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="number"
                                                        value={hpModifierValue}
                                                        onChange={(e) => onSetHpModifier(parseInt(e.target.value) || 1)}
                                                        className="w-12 h-6 text-xs border rounded px-1"
                                                        min="1"
                                                        max="100"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            onUpdateHp(participant.id, hpModifierValue);
                                                            onToggleHpModifier(null);
                                                        }}
                                                        className="flex items-center justify-center w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded"
                                                        title={`Soigner ${hpModifierValue} PV`}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onUpdateHp(participant.id, -hpModifierValue);
                                                            onToggleHpModifier(null);
                                                        }}
                                                        className="flex items-center justify-center w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded"
                                                        title={`Infliger ${hpModifierValue} dégâts`}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    {onSetTempHp && (
                                                        <button
                                                            onClick={() => {
                                                                onSetTempHp(participant.id, hpModifierValue);
                                                                onToggleHpModifier(null);
                                                            }}
                                                            className="flex items-center justify-center w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded"
                                                            title={`Ajouter ${hpModifierValue} PV Temporaires`}
                                                        >
                                                            <Zap className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Barre de progression */}
                                            <Progress
                                                value={(extractNumericHP(participant.currentHp) / extractNumericHP(participant.maxHp)) * 100}
                                                className="h-2"
                                                indicatorClassName={getHPBarColor(extractNumericHP(participant.currentHp), extractNumericHP(participant.maxHp))}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 min-w-[180px]">
                                            {/* Badge de statut */}
                                            <div className="flex justify-start">
                                                {getStatusBadge(participant)}
                                            </div>

                                            {/* Affichage des conditions existantes avec icônes */}
                                            {participant.conditions.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {participant.conditions.map(condition => {
                                                        const conditionName = typeof condition === 'string' ? condition : condition.name;
                                                        const conditionInfo = getConditionInfo(conditionName);
                                                        const IconComponent = conditionInfo.icon;
                                                        return (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Badge
                                                                            key={typeof condition === 'string' ? condition : condition.id}
                                                                            variant="outline"
                                                                            className={`cursor-pointer text-xs flex items-center gap-1 ${conditionInfo.color} hover:opacity-75`}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onToggleCondition(participant.id, conditionName);
                                                                            }}
                                                                        >
                                                                            <IconComponent className="h-3 w-3" />
                                                                            {conditionName}
                                                                            {typeof condition !== 'string' && condition.duration > 0 && (
                                                                                <span className="ml-1 text-[10px] bg-gray-200 px-1 rounded">{condition.duration}</span>
                                                                            )}
                                                                        </Badge>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="max-w-xs text-xs">
                                                                        <p className="font-bold">{conditionName}</p>
                                                                        <p>{conditionInfo.description}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Menu déroulant pour ajouter de nouvelles conditions */}
                                            <div className="w-full" onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    className="w-full h-6 text-xs border rounded px-1 bg-white"
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            onToggleCondition(participant.id, e.target.value);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>+ Ajouter condition</option>
                                                    {CONDITIONS.filter(conditionName => !participant.conditions.some(c => (typeof c === 'string' ? c : c.name) === conditionName)).map(condition => {
                                                        return (
                                                            <option key={condition} value={condition}>
                                                                {condition}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-0.5">
                                            {!participant.isPC && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onOpenCreatureFrame(participant.id);
                                                    }}
                                                    title="Voir la page AideDD"
                                                >
                                                    <Link className="h-3 w-3" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenNotes(participant);
                                                }}
                                                title="Modifier les notes"
                                            >
                                                <Square className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRemove(participant.id);
                                                }}
                                                title="Supprimer"
                                            >
                                                <Skull className="h-3 w-3 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </motion.tr>
                            );
                        })}
                    </AnimatePresence>
                </TableBody>
            </Table>
        </div>
    );
};

export default TrackerTable;
