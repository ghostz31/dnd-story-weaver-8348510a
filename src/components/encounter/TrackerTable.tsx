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
import { EncounterParticipant } from '@/lib/types';
import { extractNumericHP } from '@/lib/EncounterUtils';
import { getMonsterImageUrl } from '@/lib/monsterUtils';
import { getHPBarColor, getHPStatusText } from '@/lib/hpColorUtils';
import ConditionPicker from './ConditionPicker';

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

    // Couleur du point de statut HP (visible sur mobile à côté du nom)
    const getStatusDotColor = (participant: EncounterParticipant): string => {
        const numericMaxHp = extractNumericHP(participant.maxHp);
        if (participant.currentHp <= 0) return 'bg-gray-500';
        const hpPercentage = (participant.currentHp / numericMaxHp) * 100;
        if (hpPercentage <= 25) return 'bg-red-500';
        if (hpPercentage <= 50) return 'bg-orange-500';
        if (hpPercentage < 100) return 'bg-yellow-500';
        return 'bg-green-500';
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
                    ${!isCurrentTurn && participant.isPC ? 'bg-blue-950/5 dark:bg-blue-950/20' : ''}
                    ${!isCurrentTurn && !participant.isPC ? 'bg-red-950/5 dark:bg-red-950/20' : ''}
                    ${participant.currentHp <= 0 ? 'opacity-50 grayscale' : ''}
                    ${isSelected && !isCurrentTurn ? 'ring-2 ring-amber-400 bg-amber-50 border-l-4 border-amber-400' : ''}
                  `}
                                    onClick={() => onSelect(participant.id)}
                                >
                                    <TableCell>
                                        {isCurrentTurn && (
                                            <div className="flex justify-center">
                                                <div className="relative">
                                                    <Sword className="h-5 w-5 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)] animate-pulse" />
                                                </div>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {/* Image ou Icône */}
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center shadow-sm">
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
                                                        {/* Dot de statut HP visible sur tous les écrans (M4) */}
                                                        <span
                                                            className={`h-2 w-2 rounded-full flex-shrink-0 ${getStatusDotColor(participant)}`}
                                                            role="img"
                                                            aria-label={`Statut: ${getHPStatusText(extractNumericHP(participant.currentHp), extractNumericHP(participant.maxHp))}`}
                                                            title={`Statut: ${getHPStatusText(extractNumericHP(participant.currentHp), extractNumericHP(participant.maxHp))}`}
                                                        />
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
                                                                    aria-label={participant.conditions.some(c => (typeof c === 'string' ? c : c.name) === 'Concentré')
                                                                        ? `Arrêter la concentration de ${participant.name}`
                                                                        : `Démarrer la concentration de ${participant.name}`}
                                                                    aria-pressed={participant.conditions.some(c => (typeof c === 'string' ? c : c.name) === 'Concentré')}
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
                                                    aria-label={`Monter ${participant.name}`}
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
                                                    aria-label={`Descendre ${participant.name}`}
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
                                                        <Input
                                                            type="number"
                                                            value={hpModifierValue}
                                                            onChange={(e) => onSetHpModifier(parseInt(e.target.value) || 1)}
                                                            className="w-12 h-6 text-xs px-1"
                                                            min={1}
                                                            max={100}
                                                            aria-label={`Valeur de modification des PV de ${participant.name}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                onUpdateHp(participant.id, hpModifierValue);
                                                                onToggleHpModifier(null);
                                                            }}
                                                            className="h-6 w-6 p-0 bg-[hsl(var(--status-success))] hover:opacity-90 text-white"
                                                            aria-label={`Soigner ${hpModifierValue} PV à ${participant.name}`}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                onUpdateHp(participant.id, -hpModifierValue);
                                                                onToggleHpModifier(null);
                                                            }}
                                                            className="h-6 w-6 p-0 bg-[hsl(var(--status-danger))] hover:opacity-90 text-white"
                                                            aria-label={`Infliger ${hpModifierValue} dégâts à ${participant.name}`}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        {onSetTempHp && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    onSetTempHp(participant.id, hpModifierValue);
                                                                    onToggleHpModifier(null);
                                                                }}
                                                                className="h-6 w-6 p-0 bg-[hsl(var(--status-info))] hover:opacity-90 text-white"
                                                                aria-label={`Ajouter ${hpModifierValue} PV temporaires à ${participant.name}`}
                                                            >
                                                                <Zap className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    {typeof participant.tempHp === 'number' && participant.tempHp > 0 && onSetTempHp && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                onSetTempHp(participant.id, 0);
                                                                onToggleHpModifier(null);
                                                            }}
                                                            className="flex items-center justify-center gap-1 w-full py-0.5 h-5 text-[10px] rounded bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20"
                                                            aria-label={`Retirer ${participant.tempHp} PV temporaires de ${participant.name}`}
                                                        >
                                                            <ShieldX className="h-3 w-3" /> Retirer {participant.tempHp} PV temp.
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {/* Boutons d'action de groupe pour les monstres multiples */}
                                            {showHpModifier === participant.id && !participant.isPC && onUpdateHpBatch && (
                                                <div className="flex flex-col mt-1 bg-muted border rounded p-1 text-xs">
                                                    <span className="font-semibold text-muted-foreground mb-1">Actions de groupe ({participants.filter(p => !p.isPC && p.id.substring(0, p.id.lastIndexOf('-')) === participant.id.substring(0, participant.id.lastIndexOf('-'))).length} cibles)</span>
                                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const baseId = participant.id.substring(0, participant.id.lastIndexOf('-'));
                                                                const groupIds = participants.filter(p => !p.isPC && p.id.substring(0, p.id.lastIndexOf('-')) === baseId).map(p => p.id);
                                                                onUpdateHpBatch(groupIds, hpModifierValue);
                                                                onToggleHpModifier(null);
                                                            }}
                                                            className="flex-1 h-7 bg-[hsl(var(--status-success))] hover:opacity-90 text-white gap-1"
                                                            aria-label={`Soigner tout le groupe de ${hpModifierValue} PV`}
                                                        >
                                                            <Users className="h-3 w-3" /> <Plus className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const baseId = participant.id.substring(0, participant.id.lastIndexOf('-'));
                                                                const groupIds = participants.filter(p => !p.isPC && p.id.substring(0, p.id.lastIndexOf('-')) === baseId).map(p => p.id);
                                                                onUpdateHpBatch(groupIds, -hpModifierValue);
                                                                onToggleHpModifier(null);
                                                            }}
                                                            className="flex-1 h-7 bg-[hsl(var(--status-danger))] hover:opacity-90 text-white gap-1"
                                                            aria-label={`Infliger ${hpModifierValue} dégâts à tout le groupe`}
                                                        >
                                                            <Users className="h-3 w-3" /> <Minus className="h-3 w-3" />
                                                        </Button>
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

                                            {/* Conditions actives + grille d'ajout via ConditionPicker (M5) */}
                                            <ConditionPicker
                                                conditions={participant.conditions}
                                                onToggle={(name) => onToggleCondition(participant.id, name)}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-0.5">
                                            {/* Bouton conditions compact - visible sur petits écrans (M5) */}
                                            <div className="lg:hidden">
                                                <ConditionPicker
                                                    conditions={participant.conditions}
                                                    onToggle={(name) => onToggleCondition(participant.id, name)}
                                                    compact
                                                />
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenNotes(participant);
                                                }}
                                                aria-label={`Notes de ${participant.name}`}
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
                                                aria-label={`Supprimer ${participant.name}`}
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
