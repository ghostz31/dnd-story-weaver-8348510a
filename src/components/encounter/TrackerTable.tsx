import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sword, Skull, Plus, Minus, Square, User, Ghost,
    ArrowDown, Users, EyeOff, Smile, Droplets, Anchor, Clock, Brain, Eye, ShieldX, Zap, Heart, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
    onUpdateHpBatch?: (ids: string[], amount: number) => void;
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
    onUpdateHpBatch,
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
            return <Badge variant="secondary" className="bg-muted text-muted-foreground">Mort</Badge>;
        } else if (hpPercentage <= 25) {
            return <Badge className="bg-[hsl(var(--status-danger))] text-white">Critique</Badge>;
        } else if (hpPercentage <= 50) {
            return <Badge className="bg-[hsl(var(--status-warning))] text-white">Blessé</Badge>;
        } else if (hpPercentage < 100) {
            return <Badge className="bg-[hsl(var(--secondary))] text-secondary-foreground">Touché</Badge>;
        } else {
            return <Badge className="bg-[hsl(var(--status-success))] text-white">Indemne</Badge>;
        }
    };

    return (
        <div className="w-full overflow-x-auto pb-2">
            <Table className="w-full min-w-[600px]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">Tour</TableHead>
                        <TableHead className="min-w-[180px]">Nom</TableHead>
                        <TableHead className="w-[80px]">Init</TableHead>
                        <TableHead className="w-[60px]">CA</TableHead>
                        <TableHead className="w-[120px]">PV</TableHead>
                        <TableHead className="w-[200px] hidden lg:table-cell">État</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
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
                    ${isCurrentTurn ? 'bg-primary/10 hover:bg-primary/20 border-l-4 border-primary shadow-sm' : 'hover:bg-muted/50'}
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
                                            <div className="flex-shrink-0 w-[60px] h-[60px] rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center shadow-sm">
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
                                                                        <User className="h-6 w-6 text-muted-foreground" />
                                                                    ) : (
                                                                        <Ghost className="h-6 w-6 text-muted-foreground" />
                                                                    )}
                                                                </div>
                                                            </>
                                                        );
                                                    }

                                                    // Pas d'image disponible, afficher l'icône directement
                                                    return (
                                                        <div className="flex items-center justify-center w-full h-full">
                                                            {participant.isPC ? (
                                                                <User className="h-6 w-6 text-muted-foreground" />
                                                            ) : (
                                                                <Ghost className="h-6 w-6 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            {/* Nom et détails */}
                                            <div className="flex-1">
                                                <div className="font-medium text-sm flex items-center justify-between gap-1 w-full">
                                                    <div className="whitespace-nowrap flex items-center gap-1 flex-1 min-w-0" title={participant.name}>
                                                        <span className="truncate">{participant.name}</span>
                                                        {participant.isPC && (
                                                            <Badge variant="outline" className="text-xs h-4 px-1 flex-shrink-0">PC</Badge>
                                                        )}
                                                    </div>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className={`h-6 w-6 p-0 flex-shrink-0 transition-all duration-300 ${participant.conditions.some(c => (typeof c === 'string' ? c : c.name) === 'Concentré')
                                                                        ? 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200 hover:text-yellow-700 shadow-[0_0_10px_rgba(234,179,8,0.5)] border border-yellow-200'
                                                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onToggleCondition(participant.id, 'Concentré');
                                                                    }}
                                                                >
                                                                    <Brain className={`h-4 w-4 ${participant.conditions.some(c => (typeof c === 'string' ? c : c.name) === 'Concentré') ? 'animate-pulse drop-shadow-[0_0_2px_rgba(234,179,8,0.8)]' : ''}`} />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top">
                                                                <p>{participant.conditions.some(c => (typeof c === 'string' ? c : c.name) === 'Concentré') ? 'Arrêter la concentration' : 'Démarrer la concentration'}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </div>
                                        </div>
                                        {participant.notes && (
                                            <div className="text-xs text-muted-foreground">{participant.notes}</div>
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
                                                    {typeof participant.tempHp === 'number' && participant.tempHp > 0 && (
                                                        <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] font-semibold bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info))] border-[hsl(var(--status-info))]/20 hover:bg-[hsl(var(--status-info-bg))]">
                                                            +{participant.tempHp}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Interface de modification rapide */}
                                            {showHpModifier === participant.id && (
                                                <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center space-x-1 p-1 bg-muted rounded border">
                                                        <input
                                                            type="number"
                                                            value={hpModifierValue}
                                                            onChange={(e) => onSetHpModifier(parseInt(e.target.value) || 1)}
                                                            className="w-12 h-6 text-xs border rounded px-1 bg-background"
                                                            min="1"
                                                            max="100"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                onUpdateHp(participant.id, hpModifierValue);
                                                                onToggleHpModifier(null);
                                                            }}
                                                            className="flex items-center justify-center w-6 h-6 bg-[hsl(var(--status-success))] hover:opacity-90 text-white rounded"
                                                            title={`Soigner ${hpModifierValue} PV`}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                onUpdateHp(participant.id, -hpModifierValue);
                                                                onToggleHpModifier(null);
                                                            }}
                                                            className="flex items-center justify-center w-6 h-6 bg-[hsl(var(--status-danger))] hover:opacity-90 text-white rounded"
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
                                                                className="flex items-center justify-center w-6 h-6 bg-[hsl(var(--status-info))] hover:opacity-90 text-white rounded"
                                                                title={`Ajouter ${hpModifierValue} PV Temporaires`}
                                                            >
                                                                <Zap className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {typeof participant.tempHp === 'number' && participant.tempHp > 0 && onSetTempHp && (
                                                        <button
                                                            onClick={() => {
                                                                onSetTempHp(participant.id, 0);
                                                                onToggleHpModifier(null);
                                                            }}
                                                            className="flex items-center justify-center gap-1 w-full py-0.5 text-[10px] rounded bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20 transition-colors"
                                                            title="Retirer tous les PV temporaires"
                                                        >
                                                            <ShieldX className="h-3 w-3" /> Retirer {participant.tempHp} PV temp.
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {/* Boutons d'action de groupe pour les monstres multiples */}
                                            {showHpModifier === participant.id && !participant.isPC && onUpdateHpBatch && (
                                                <div className="flex flex-col mt-1 bg-muted border rounded p-1 text-xs">
                                                    <span className="font-semibold text-muted-foreground mb-1">Actions de groupe ({participants.filter(p => !p.isPC && p.id.substring(0, p.id.lastIndexOf('-')) === participant.id.substring(0, participant.id.lastIndexOf('-'))).length} cibles)</span>
                                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => {
                                                                const baseId = participant.id.substring(0, participant.id.lastIndexOf('-'));
                                                                const groupIds = participants.filter(p => !p.isPC && p.id.substring(0, p.id.lastIndexOf('-')) === baseId).map(p => p.id);
                                                                onUpdateHpBatch(groupIds, hpModifierValue);
                                                                onToggleHpModifier(null);
                                                            }}
                                                            className="flex-1 flex items-center justify-center gap-1 bg-[hsl(var(--status-success))] hover:opacity-90 text-white rounded px-2 py-1"
                                                            title={`Soigner tout le groupe de ${hpModifierValue} PV`}
                                                        >
                                                            <Users className="h-3 w-3" /> <Plus className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const baseId = participant.id.substring(0, participant.id.lastIndexOf('-'));
                                                                const groupIds = participants.filter(p => !p.isPC && p.id.substring(0, p.id.lastIndexOf('-')) === baseId).map(p => p.id);
                                                                onUpdateHpBatch(groupIds, -hpModifierValue);
                                                                onToggleHpModifier(null);
                                                            }}
                                                            className="flex-1 flex items-center justify-center gap-1 bg-[hsl(var(--status-danger))] hover:opacity-90 text-white rounded px-2 py-1"
                                                            title={`Infliger ${hpModifierValue} dégâts à tout le groupe`}
                                                        >
                                                            <Users className="h-3 w-3" /> <Minus className="h-3 w-3" />
                                                        </button>
                                                    </div>
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
                                    <TableCell className="hidden lg:table-cell">
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
                                                            <TooltipProvider key={typeof condition === 'string' ? condition : condition.id}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Badge
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
                                                                                <span className="ml-1 text-[10px] bg-gray-200 dark:bg-gray-700 px-1 rounded">{condition.duration}</span>
                                                                            )}
                                                                        </Badge>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="max-w-md bg-stone-900 border-stone-800 text-stone-50 p-3 shadow-xl z-50">
                                                                        <p className="font-bold mb-1">{conditionName}</p>
                                                                        <div className="text-xs whitespace-pre-wrap">{conditionInfo.description}</div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Popover grid pour ajouter/supprimer conditions */}
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
                                                            + Conditions
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-64 p-2">
                                                        <div className="text-xs font-bold mb-2 text-muted-foreground">Gérer les conditions</div>
                                                        <div className="grid grid-cols-2 gap-1">
                                                            {CONDITIONS.map(conditionName => {
                                                                const isActive = participant.conditions.some(c => (typeof c === 'string' ? c : c.name) === conditionName);
                                                                const info = getConditionInfo(conditionName);
                                                                const Icon = info.icon;
                                                                return (
                                                                    <button
                                                                        key={conditionName}
                                                                        onClick={() => onToggleCondition(participant.id, conditionName)}
                                                                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                                                                    >
                                                                        <Icon className="h-3 w-3" />
                                                                        {conditionName}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-0.5">
                                            {/* Bouton conditions - visible sur petits écrans */}
                                            <div className="lg:hidden" onClick={(e) => e.stopPropagation()}>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 relative"
                                                            title="Conditions"
                                                        >
                                                            <ShieldX className="h-3 w-3" />
                                                            {participant.conditions.length > 0 && (
                                                                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-primary rounded-full" />
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-64 p-2">
                                                        <div className="text-xs font-bold mb-2 text-muted-foreground">Conditions</div>
                                                        <div className="grid grid-cols-2 gap-1">
                                                            {CONDITIONS.map(conditionName => {
                                                                const isActive = participant.conditions.some(c => (typeof c === 'string' ? c : c.name) === conditionName);
                                                                const info = getConditionInfo(conditionName);
                                                                const Icon = info.icon;
                                                                return (
                                                                    <button
                                                                        key={conditionName}
                                                                        onClick={() => onToggleCondition(participant.id, conditionName)}
                                                                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                                                                    >
                                                                        <Icon className="h-3 w-3" />
                                                                        {conditionName}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

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
