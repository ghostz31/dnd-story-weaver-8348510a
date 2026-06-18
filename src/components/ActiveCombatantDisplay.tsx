import React from 'react';
import { EncounterParticipant } from '../lib/types';
import { getConditionInfo } from '../lib/EncounterUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Heart, Zap, ExternalLink, ChevronLeft, ChevronRight, Edit, Save, X, User, Book, Hash, Swords } from 'lucide-react';
import { StatBlock } from './StatBlock';
import { pushTrameCommand } from '../hooks/useBesaceSync';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ActiveCombatantDisplayProps {
    participant: EncounterParticipant;
    className?: string;
    onLinkDndBeyond?: (id: string, url: string) => void;
    onUpdate?: (updates: Partial<EncounterParticipant>) => void;
}

const ActiveCombatantDisplay: React.FC<ActiveCombatantDisplayProps> = ({ participant, className, onLinkDndBeyond, onUpdate }) => {
    // Déterminer si c'est un monstre ou un joueur
    const isMonster = !participant.isPC;

    // État de collapse persistant via localStorage
    const [isCollapsed, setIsCollapsed] = React.useState(() => {
        const saved = localStorage.getItem('encounterTracker.statBlockCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    const handleToggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('encounterTracker.statBlockCollapsed', JSON.stringify(newState));
    };

    console.log(`[ActiveDisplay] Rendering ${participant.name}. ID: ${participant.dndBeyondId}. CanLink: ${!!onLinkDndBeyond}`);

    if (!participant) return null;

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {isMonster ? (
                <MonsterDisplay participant={participant} onUpdate={onUpdate} isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />
            ) : (
                <PlayerDisplay participant={participant} onLinkDndBeyond={onLinkDndBeyond} onUpdate={onUpdate} isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />
            )}
        </div>
    );
};

const MonsterDisplay: React.FC<{ participant: EncounterParticipant; onUpdate?: (updates: Partial<EncounterParticipant>) => void; isCollapsed: boolean; onToggleCollapse: () => void }> = ({ participant, onUpdate, isCollapsed, onToggleCollapse }) => {
    // Conversion de EncounterParticipant vers Monster pour le StatBlock
    const monsterData: any = {
        id: participant.id,
        name: participant.name,
        type: participant.type || "Inconnu",
        size: participant.size || "M",
        ac: participant.ac,
        hp: participant.maxHp, // StatBlock attend hp max général
        str: participant.str || 10,
        dex: participant.dex || 10,
        con: participant.con || 10,
        int: participant.int || 10,
        wis: participant.wis || 10,
        cha: participant.cha || 10,
        speed: participant.speed, // StatBlock gère string, array ou object
        alignment: participant.alignment || "Inconnu",
        actions: participant.actions || [],
        traits: participant.traits || [],
        cr: typeof participant.cr === 'number' ? participant.cr : 0,
        xp: participant.xp || 0,
        reactions: participant.reactions || [],
        legendaryActions: participant.legendaryActionsList || [],

        // Champs manquants ajoutés
        image: participant.image,
        savingThrows: participant.savingThrows,
        skills: participant.skills,
        damageVulnerabilities: participant.damageVulnerabilities,
        damageResistances: participant.damageResistances,
        damageImmunities: participant.damageImmunities,
        conditionImmunities: participant.conditionImmunities,
        senses: participant.senses,
        languages: participant.languages,

        custom: true // Force l'affichage "custom" pour éviter les liens auto AideDD si on veut le full StatBlock
    };

    // Si on a des actions légendaires dans le participant (gestion d'état encounter)
    // On pourrait vouloir les passer au StatBlock, mais StatBlock affiche les "textes" des actions.
    // Pour l'interaction (cocher les cases), StatBlock ne le gère pas encore interactivement pour le EncounterTracker.
    // On garde l'affichage simple pour l'instant.

    if (isCollapsed) {
        // Vue condensée - Mode Combat
        return (
            <div className="h-full overflow-y-auto custom-scrollbar p-2 bg-muted/50 relative">
                <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 z-10 h-8 w-8"
                    onClick={onToggleCollapse}
                    title="Afficher les détails complets"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
                <div className="max-w-sm mx-auto bg-card/90 p-4 rounded-lg shadow-md border border-border">
                    <h3 className="text-lg font-bold text-foreground mb-3">{participant.name}</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary/80" />
                            <span className="font-semibold">CA:</span> {participant.ac}
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-destructive/80" />
                            <span className="font-semibold">PV:</span>
                            <span>
                                {participant.currentHp}/{typeof participant.maxHp === 'object' ? JSON.stringify(participant.maxHp) : participant.maxHp}
                                {participant.tempHp ? (
                                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] font-semibold bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info))] border-[hsl(var(--status-info))]/20">
                                        +{participant.tempHp}
                                    </Badge>
                                ) : ''}
                            </span>
                        </div>
                    </div>
                    {monsterData.actions && monsterData.actions.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Actions ({Math.min(3, monsterData.actions.length)})</h4>
                            <div className="flex flex-col gap-2">
                                {monsterData.actions.slice(0, 3).map((action: any, idx: number) => (
                                    <div key={idx} className="text-xs text-foreground/90">
                                        <span className="font-semibold">{action.name}</span>
                                        {action.description && (
                                            <p className="mt-0.5 text-muted-foreground line-clamp-2">{action.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Badge actions légendaires (M7) */}
                    {monsterData.legendaryActions && Array.isArray(monsterData.legendaryActions) && monsterData.legendaryActions.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                            <Badge className="bg-amber-500/90 text-white hover:bg-amber-500">
                                <Zap className="h-3 w-3 mr-1 fill-white" />
                                {monsterData.legendaryActions.length} actions légendaires
                            </Badge>
                            {participant.legendaryActions && (
                                <span className="text-xs text-muted-foreground">
                                    {participant.legendaryActions.current}/{participant.legendaryActions.max} restantes
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-2 bg-muted/50 relative">
            <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 z-10 h-8 w-8 bg-card/80 hover:bg-accent shadow-sm"
                onClick={onToggleCollapse}
                title="Réduire le panneau"
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="max-w-4xl mx-auto bg-card/50 min-h-full">
                <StatBlock monster={monsterData} className="w-full shadow-md border-y md:border-x border-border" hideImage={true} />
            </div>
        </div>
    );
};


const COMMON_CONDITIONS = ['Aveuglé', 'Charmé', 'Effrayé', 'Empoisonné', 'Inconscient', 'Paralysé', 'Étourdi', 'À terre', 'Aveugle', 'Invisible', 'Concentré'];

const PlayerDisplay: React.FC<{ participant: EncounterParticipant; onLinkDndBeyond?: (id: string, url: string) => void; onUpdate?: (updates: Partial<EncounterParticipant>) => void; isCollapsed: boolean; onToggleCollapse: () => void }> = ({ participant, onLinkDndBeyond, onUpdate, isCollapsed, onToggleCollapse }) => {
    const [isLinking, setIsLinking] = React.useState(false);
    const [linkUrl, setLinkUrl] = React.useState('');
    const [localNotes, setLocalNotes] = React.useState(participant.notes || '');
    const [showTempHpDialog, setShowTempHpDialog] = React.useState(false);
    const [tempHpValueInput, setTempHpValueInput] = React.useState('');
    const [showConditionDialog, setShowConditionDialog] = React.useState<'add' | 'remove' | null>(null);
    const [conditionSelect, setConditionSelect] = React.useState('');

    // Edit Mode State
    const [isEditing, setIsEditing] = React.useState(false);
    const [editData, setEditData] = React.useState<Partial<EncounterParticipant>>({});

    // Sync local notes if participant changes externally
    React.useEffect(() => {
        setLocalNotes(participant.notes || '');
    }, [participant.notes]);

    const handleLink = () => {
        if (linkUrl && onLinkDndBeyond) {
            onLinkDndBeyond(participant.id, linkUrl);
            setIsLinking(false);
            setLinkUrl('');
        }
    };

    const handleStartEdit = () => {
        setEditData({
            name: participant.name,
            race: participant.race || '',
            class: participant.class || '',
            level: participant.level || 1,
            str: participant.str || 10,
            dex: participant.dex || 10,
            con: participant.con || 10,
            int: participant.int || 10,
            wis: participant.wis || 10,
            cha: participant.cha || 10,
            proficiencies: participant.proficiencies || '',
            ac: participant.ac,
            maxHp: participant.maxHp,
            currentHp: participant.currentHp,
            initiative: participant.initiative
        });
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        if (onUpdate) {
            onUpdate(editData);
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditData({});
    };

    const handleChange = (field: keyof EncounterParticipant, value: any) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    if (isCollapsed) {
        // Vue condensée pour joueur
        return (
            <div className="h-full overflow-y-auto custom-scrollbar p-2 bg-primary/5 relative">
                <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 z-10 h-8 w-8"
                    onClick={onToggleCollapse}
                    title="Afficher les détails complets"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
                <div className="max-w-sm mx-auto bg-card/90 p-4 rounded-lg shadow-md border border-primary/20">
                    <h3 className="text-lg font-bold text-primary/90 mb-3">{participant.name}</h3>
                    <div className="text-xs text-primary mb-2">
                        {participant.race} {participant.class} {participant.level ? `Niv. ${participant.level}` : ''}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary/80" />
                            <span className="font-semibold">CA:</span> {participant.ac}
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-destructive/80" />
                            <span className="font-semibold">PV:</span>
                            <span>
                                {participant.currentHp}/{participant.maxHp}
                                {participant.tempHp ? (
                                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] font-semibold bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info))] border-[hsl(var(--status-info))]/20">
                                        +{participant.tempHp}
                                    </Badge>
                                ) : ''}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">Init:</span> {participant.initiative}
                        </div>
                        {participant.abilityScores && (
                            <div className="col-span-2 flex gap-1.5 text-xs">
                                {[
                                    { l: 'FOR', v: participant.abilityScores.str },
                                    { l: 'DEX', v: participant.abilityScores.dex },
                                    { l: 'CON', v: participant.abilityScores.con },
                                    { l: 'INT', v: participant.abilityScores.int },
                                    { l: 'SAG', v: participant.abilityScores.wis },
                                    { l: 'CHA', v: participant.abilityScores.cha },
                                ].map(s => (
                                    <span key={s.l} className="bg-muted/60 px-1 py-0.5 rounded font-mono">{s.l} {s.v}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Card className="w-full h-full flex flex-col overflow-hidden border-none shadow-none bg-primary/5 relative">
            <CardHeader className="py-2 px-4 bg-primary/10 border-b">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        {isEditing ? (
                            <Input
                                value={editData.name as string}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="font-bold text-lg h-8 mb-2"
                            />
                        ) : (
                            <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
                                {participant.name}
                            </CardTitle>
                        )}

                        {!isEditing && (
                            <div className="flex flex-wrap gap-2 text-sm text-primary/80 mt-1">
                                {(participant.race || participant.class || participant.level) ? (
                                    <>
                                        {participant.race && <Badge variant="secondary" className="bg-card/50">{participant.race}</Badge>}
                                        {participant.class && <Badge variant="secondary" className="bg-card/50">{participant.class}</Badge>}
                                        {participant.level && <Badge variant="outline" className="bg-primary/5">Niveau {participant.level}</Badge>}
                                    </>
                                ) : (
                                    <span className="text-primary/60 italic">Détails non définis</span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-1">
                        {!participant.dndBeyondId && !isEditing && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:text-primary/90" onClick={handleStartEdit} title="Modifier">
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        {isEditing && (
                            <>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-800" onClick={handleSaveEdit} title="Sauvegarder">
                                    <Save className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={handleCancelEdit} title="Annuler">
                                    <X className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Zone de contrôle D&D Beyond */}
                <div className="mt-2 pt-2 border-t border-primary/20">
                    {participant.dndBeyondId ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 flex items-center gap-1">
                                    <Zap size={10} className="fill-green-700" /> Live Sync Actif
                                </Badge>
                                <span className="text-xs text-muted-foreground/70">ID: {participant.dndBeyondId}</span>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={`https://www.dndbeyond.com/characters/${participant.dndBeyondId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90 flex items-center gap-1"
                                >
                                    <ExternalLink size={12} /> Fiche D&D Beyond
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {!isEditing && (
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-1 text-yellow-600 bg-yellow-500/10 px-2 py-1 rounded">
                                        <span>Mode Manuel</span>
                                    </div>
                                    {onLinkDndBeyond && !isLinking && (
                                        <button
                                            onClick={() => setIsLinking(true)}
                                            className="ml-auto text-primary hover:text-primary/90 underline flex items-center gap-1"
                                        >
                                            <ExternalLink size={10} /> Lier D&D Beyond
                                        </button>
                                    )}
                                </div>
                            )}

                            {isLinking && (
                                <div className="flex flex-col gap-2 bg-card p-2 rounded shadow-sm border border-primary/20 mt-1">
                                    <label className="text-xs font-semibold text-foreground/90">URL du personnage :</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={linkUrl}
                                            onChange={(e) => setLinkUrl(e.target.value)}
                                            placeholder="https://www.dndbeyond.com/characters/..."
                                            className="text-xs border rounded p-1 flex-1"
                                            autoFocus
                                        />
                                        <button onClick={handleLink} className="text-xs bg-primary text-white px-2 py-1 rounded">OK</button>
                                        <button onClick={() => setIsLinking(false)} className="text-xs bg-muted/80 text-muted-foreground px-2 py-1 rounded">X</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto custom-scrollbar">

                {/* Infos Générales Édition */}
                {isEditing && (
                    <div className="grid grid-cols-3 gap-3 mb-6 bg-card p-3 rounded-lg border border-primary/10">
                        <div className="col-span-1">
                            <Label className="text-xs">Race</Label>
                            <Input value={editData.race as string} onChange={(e) => handleChange('race', e.target.value)} className="h-8 text-sm" placeholder="Ex: Elfe" />
                        </div>
                        <div className="col-span-1">
                            <Label className="text-xs">Classe</Label>
                            <Input value={editData.class as string} onChange={(e) => handleChange('class', e.target.value)} className="h-8 text-sm" placeholder="Ex: Magicien" />
                        </div>
                        <div className="col-span-1">
                            <Label className="text-xs">Niveau</Label>
                            <Input type="number" value={editData.level as number} onChange={(e) => handleChange('level', parseInt(e.target.value) || 1)} className="h-8 text-sm" />
                        </div>
                    </div>
                )}

                {/* Stats Vitales */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm border border-primary/10 relative">
                        <Shield className="w-8 h-8 text-primary/80 mb-2" />
                        {isEditing ? (
                            <Input
                                type="number"
                                value={editData.ac as number}
                                onChange={(e) => handleChange('ac', parseInt(e.target.value) || 10)}
                                className="text-center font-bold text-lg h-10 w-20"
                            />
                        ) : (
                            <span className="text-2xl font-bold text-foreground">{participant.ac}</span>
                        )}
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">CA</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm border border-primary/10">
                        <Heart className="w-8 h-8 text-destructive/80 mb-2" />
                        {isEditing ? (
                            <div className="flex flex-col gap-1 items-center">
                                <div className="flex items-center gap-1">
                                    <Input
                                        type="number"
                                        value={editData.currentHp as number}
                                        onChange={(e) => handleChange('currentHp', parseInt(e.target.value) || 0)}
                                        className="text-center font-bold text-lg h-10 w-16"
                                    />
                                    <span className="text-xl">/</span>
                                    <Input
                                        type="number"
                                        value={editData.maxHp as number}
                                        onChange={(e) => handleChange('maxHp', parseInt(e.target.value) || 1)}
                                        className="text-center font-bold text-lg h-10 w-16"
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <Label className="text-xs text-[hsl(var(--status-info))]">Temp</Label>
                                    <Input
                                        type="number"
                                        value={editData.tempHp || 0}
                                        onChange={(e) => handleChange('tempHp', parseInt(e.target.value) || 0)}
                                        className="text-center text-sm h-8 w-16 border-[hsl(var(--status-info))]/30 focus-visible:ring-[hsl(var(--status-info))]/30"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-bold text-foreground">
                                    {participant.currentHp} <span className="text-muted-foreground/70 text-lg">/ {participant.maxHp}</span>
                                </span>
                                {participant.tempHp && participant.tempHp > 0 && (
                                    <Badge variant="secondary" className="mt-1 px-2 py-0.5 text-xs font-semibold bg-[hsl(var(--status-info-bg))] text-[hsl(var(--status-info))] border-[hsl(var(--status-info))]/20">
                                        <Shield className="h-3 w-3 mr-1" />+{participant.tempHp} PV temp.
                                    </Badge>
                                )}
                            </div>
                        )}
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">PV</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm border border-primary/10">
                        <Zap className="w-8 h-8 text-yellow-500 mb-2" />
                        {isEditing ? (
                            <Input
                                type="number"
                                value={editData.initiative as number}
                                onChange={(e) => handleChange('initiative', parseInt(e.target.value) || 0)}
                                className="text-center font-bold text-lg h-10 w-20"
                            />
                        ) : (
                            <span className="text-2xl font-bold text-foreground">{participant.initiative}</span>
                        )}
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Initiative</span>
                    </div>
                </div >

                {/* Death Saves Checkboxes */}
                {participant.currentHp <= 0 && (
                    <div className="mb-6 bg-muted p-4 rounded-lg border border-border/80">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <h4 className="text-sm font-bold text-foreground/90">Jets de Mort</h4>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-green-600">Succès</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => (
                                        <div
                                            key={i}
                                            className={`w-4 h-4 rounded-full border border-green-600 cursor-pointer ${participant.deathSaves?.successes && participant.deathSaves.successes >= i ? 'bg-green-600' : 'bg-card'}`}
                                            onClick={() => {
                                                const current = participant.deathSaves?.successes || 0;
                                                const newVal = current >= i ? i - 1 : i;
                                                onUpdate?.({ deathSaves: { ...participant.deathSaves!, successes: newVal, failures: participant.deathSaves?.failures || 0 } });
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-destructive/90">Échecs</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => (
                                        <div
                                            key={i}
                                            className={`w-4 h-4 rounded-full border border-destructive/80 cursor-pointer ${participant.deathSaves?.failures && participant.deathSaves.failures >= i ? 'bg-destructive/80' : 'bg-card'}`}
                                            onClick={() => {
                                                const current = participant.deathSaves?.failures || 0;
                                                const newVal = current >= i ? i - 1 : i;
                                                onUpdate?.({ deathSaves: { ...participant.deathSaves!, failures: newVal, successes: participant.deathSaves?.successes || 0 } });
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Caractéristiques */}
                <div className="grid grid-cols-6 gap-2 mb-6">
                    {[
                        { label: 'FOR', key: 'str', val: isEditing ? editData.str : (participant.abilityScores?.str ?? participant.str ?? 10), mod: participant.abilityModifiers?.str, save: participant.savingThrowProficiencies?.includes('str') },
                        { label: 'DEX', key: 'dex', val: isEditing ? editData.dex : (participant.abilityScores?.dex ?? participant.dex ?? 10), mod: participant.abilityModifiers?.dex, save: participant.savingThrowProficiencies?.includes('dex') },
                        { label: 'CON', key: 'con', val: isEditing ? editData.con : (participant.abilityScores?.con ?? participant.con ?? 10), mod: participant.abilityModifiers?.con, save: participant.savingThrowProficiencies?.includes('con') },
                        { label: 'INT', key: 'int', val: isEditing ? editData.int : (participant.abilityScores?.int ?? participant.int ?? 10), mod: participant.abilityModifiers?.int, save: participant.savingThrowProficiencies?.includes('int') },
                        { label: 'SAG', key: 'wis', val: isEditing ? editData.wis : (participant.abilityScores?.wis ?? participant.wis ?? 10), mod: participant.abilityModifiers?.wis, save: participant.savingThrowProficiencies?.includes('wis') },
                        { label: 'CHA', key: 'cha', val: isEditing ? editData.cha : (participant.abilityScores?.cha ?? participant.cha ?? 10), mod: participant.abilityModifiers?.cha, save: participant.savingThrowProficiencies?.includes('cha') }
                    ].map((stat, idx) => {
                        const val = stat.val as number || 10;
                        const calculatedMod = Math.floor((val - 10) / 2);
                        const displayMod = stat.mod !== undefined ? stat.mod : calculatedMod;
                        const sign = displayMod >= 0 ? '+' : '';

                        return (
                            <div key={idx} className={`flex flex-col items-center p-2 rounded shadow-sm border ${isEditing ? 'bg-primary/5 border-primary/30' : 'bg-card border-border/50'}`}>
                                <span className="text-[10px] font-bold text-muted-foreground mb-1">{stat.label}</span>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        value={val}
                                        onChange={(e) => handleChange(stat.key as keyof EncounterParticipant, parseInt(e.target.value) || 10)}
                                        className="h-8 text-center text-sm p-0 mb-1"
                                    />
                                ) : (
                                    <span className="text-lg font-bold text-foreground">{val}</span>
                                )}
                                <span className={`text-xs px-1 rounded font-mono ${stat.save ? 'bg-green-600/10 text-green-600 font-bold' : 'bg-muted/60 text-primary'}`}>
                                    {sign}{displayMod}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {participant.proficiencyBonus && (
                    <div className="flex items-center gap-2 mb-4 text-sm">
                        <span className="text-muted-foreground font-medium">Bonus de maîtrise :</span>
                        <Badge variant="outline" className="bg-primary/5 text-primary/80">+{participant.proficiencyBonus}</Badge>
                    </div>
                )}

                {participant.equipmentSummary && participant.equipmentSummary.length > 0 && (
                    <div className="mt-3">
                        <h4 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide mb-1">Équipement</h4>
                        <div className="space-y-1">
                            {participant.equipmentSummary.filter(e => e.equipped || e.attuned).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                    {item.attuned && <span className="text-purple-400">◆</span>}
                                    <span className={item.attuned ? 'text-purple-300' : 'text-muted-foreground/50'}>
                                        {item.name}
                                    </span>
                                    {item.acBonus && <span className="text-primary/60">CA+{item.acBonus}</span>}
                                    {item.attackBonus && <span className="text-destructive/60">ATK+{item.attackBonus}</span>}
                                    {item.damageBonus && <span className="text-orange-400">DMG+{item.damageBonus}</span>}
                                    {item.saveBonus && <span className="text-green-400">JDS+{item.saveBonus}</span>}
                                    {item.abilityBonus && Object.entries(item.abilityBonus).map(([key, val]) => (
                                        <span key={key} className="text-purple-400">{key.toUpperCase()}+{val}</span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Maitrises & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Maitrises - Affichées si non-Beyond */}
                    {!participant.dndBeyondId && (
                        <div className="bg-card p-4 rounded-lg shadow-sm border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Swords className="h-4 w-4 text-muted-foreground" />
                                <h4 className="text-sm font-semibold text-foreground/90">Maîtrises & Aptitudes</h4>
                            </div>
                            {isEditing ? (
                                <Textarea
                                    value={editData.proficiencies as string}
                                    onChange={(e) => handleChange('proficiencies', e.target.value)}
                                    className="min-h-[100px] text-sm"
                                    placeholder="Armures, Armes, Outils, Langues, Dons..."
                                />
                            ) : (
                                <div className="text-sm text-foreground/90 whitespace-pre-wrap min-h-[50px]">
                                    {participant.proficiencies || <span className="text-muted-foreground/70 italic">Aucune maîtrise renseignée.</span>}
                                </div>
                            )}
                        </div>
                    )}

                    <div className={`${participant.dndBeyondId ? 'col-span-2' : ''} bg-card p-4 rounded-lg shadow-sm border border-border/50`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Book className="h-4 w-4 text-muted-foreground" />
                            <h4 className="text-sm font-semibold text-foreground/90">Notes de session</h4>
                        </div>
                        <textarea
                            className="w-full text-sm p-2 border rounded resize-y min-h-[100px] text-foreground/90 bg-transparent focus:ring-2 focus:ring-blue-200 focus:outline-none"
                            value={localNotes}
                            onChange={(e) => setLocalNotes(e.target.value)}
                            onBlur={() => onUpdate?.({ notes: localNotes })}
                            placeholder="Notes temporaires pour ce combat..."
                        />
                    </div>
                </div>

                {/* Conditions existantes */}
                {
                    participant.conditions && participant.conditions.length > 0 && (
                        <div className="mt-4 bg-card p-4 rounded-lg shadow-sm border border-destructive/10">
                            <h4 className="text-sm font-semibold text-foreground/90 mb-2">Conditions</h4>
                            <div className="flex flex-wrap gap-2">
                                <TooltipProvider>
                                    {participant.conditions.map((condition, idx) => {
                                        const info = getConditionInfo(condition);
                                        const ConditionIcon = info.icon;
                                        return (
                                            <Tooltip key={idx}>
                                                <TooltipTrigger>
                                                    <Badge variant="destructive" className={`flex gap-1 items-center cursor-help ${info.color.replace('text-', 'bg-').replace('border-', '')} text-white border-none`}>
                                                        <ConditionIcon className="h-3 w-3" />
                                                        {typeof condition === 'string' ? condition : condition.name}
                                                        {typeof condition !== 'string' && condition.duration > 0 && (
                                                            <span className="text-[10px] bg-black/20 px-1 rounded ml-1">{condition.duration} trs</span>
                                                        )}
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="max-w-md bg-stone-900 border-stone-800 text-stone-50 p-3 shadow-xl">
                                                    <p className="font-bold mb-1">{typeof condition === 'string' ? condition : condition.name}</p>
                                                    <div className="text-xs whitespace-pre-wrap">{info.description}</div>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                                </TooltipProvider>
                            </div>
                        </div>
                    )
                }

                {/* Actions MJ → Besace */}
                {participant.besaceShareCode && participant.syncSource === 'besace' && (
                    <div className="mt-3 px-3 py-2 bg-[hsl(var(--status-info-bg))] rounded border border-[hsl(var(--status-info))]/20">
                        <h4 className="text-xs font-semibold text-[hsl(var(--status-info))] uppercase tracking-wide mb-2">Actions MJ → Besace</h4>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setShowTempHpDialog(true)}
                                className="text-xs px-2 py-1 bg-[hsl(var(--status-info))]/10 text-[hsl(var(--status-info))] rounded hover:bg-[hsl(var(--status-info))]/20"
                            >
                                PV Temp.
                            </button>
                            <button
                                onClick={() => { setConditionSelect(''); setShowConditionDialog('add'); }}
                                className="text-xs px-2 py-1 bg-[hsl(var(--status-warning))]/10 text-[hsl(var(--status-warning))] rounded hover:bg-[hsl(var(--status-warning))]/20"
                            >
                                + Condition
                            </button>
                            <button
                                onClick={() => { setConditionSelect(''); setShowConditionDialog('remove'); }}
                                className="text-xs px-2 py-1 bg-[hsl(var(--status-danger))]/10 text-[hsl(var(--status-danger))] rounded hover:bg-[hsl(var(--status-danger))]/20"
                            >
                                - Condition
                            </button>
                        </div>

                        {showTempHpDialog && (
                            <div className="mt-2 flex items-center gap-2">
                                <input
                                    type="number"
                                    value={tempHpValueInput}
                                    onChange={(e) => setTempHpValueInput(e.target.value)}
                                    placeholder="PV temp."
                                    className="text-xs border rounded px-2 py-1 w-24 bg-background border-[hsl(var(--status-info))]/30 text-foreground placeholder-muted-foreground"
                                    autoFocus
                                    min={0}
                                />
                                <button
                                    onClick={() => {
                                        const val = parseInt(tempHpValueInput);
                                        if (!isNaN(val) && val >= 0) {
                                            pushTrameCommand(participant.besaceShareCode!, { type: 'updateTempHp', payload: { tempHp: val } });
                                            setShowTempHpDialog(false);
                                            setTempHpValueInput('');
                                        }
                                    }}
                                    className="text-xs px-2 py-1 bg-[hsl(var(--status-info))] text-white rounded hover:opacity-90"
                                >
                                    OK
                                </button>
                                <button
                                    onClick={() => { setShowTempHpDialog(false); setTempHpValueInput(''); }}
                                    className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded hover:bg-muted/80"
                                >
                                    Annuler
                                </button>
                            </div>
                        )}

                        {showConditionDialog === 'add' && (
                            <div className="mt-2 flex flex-col gap-2">
                                <select
                                    value={conditionSelect}
                                    onChange={(e) => setConditionSelect(e.target.value)}
                                    className="text-xs border rounded px-2 py-1 bg-background border-[hsl(var(--status-warning))]/30 text-foreground"
                                >
                                    <option value="">Choisir une condition…</option>
                                    {COMMON_CONDITIONS.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            if (conditionSelect) {
                                                pushTrameCommand(participant.besaceShareCode!, { type: 'addCondition', payload: { condition: conditionSelect } });
                                                setShowConditionDialog(null);
                                                setConditionSelect('');
                                            }
                                        }}
                                        className="text-xs px-2 py-1 bg-[hsl(var(--status-warning))] text-white rounded hover:opacity-90"
                                    >
                                        Ajouter
                                    </button>
                                    <button
                                        onClick={() => { setShowConditionDialog(null); setConditionSelect(''); }}
                                        className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded hover:bg-muted/80"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        )}

                        {showConditionDialog === 'remove' && (
                            <div className="mt-2 flex flex-col gap-2">
                                {participant.conditions && participant.conditions.length > 0 ? (
                                    <>
                                        <div className="flex flex-wrap gap-1">
                                            {participant.conditions.map((c, idx) => {
                                                const condName = typeof c === 'string' ? c : c.name;
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            pushTrameCommand(participant.besaceShareCode!, { type: 'removeCondition', payload: { condition: condName } });
                                                            setShowConditionDialog(null);
                                                        }}
                                                        className="text-xs px-2 py-1 bg-[hsl(var(--status-danger))]/10 text-[hsl(var(--status-danger))] rounded hover:bg-[hsl(var(--status-danger))]/20"
                                                    >
                                                        {condName}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={() => { setShowConditionDialog(null); setConditionSelect(''); }}
                                            className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded hover:bg-muted/80 self-start"
                                        >
                                            Annuler
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground/70">Aucune condition active.</span>
                                        <button
                                            onClick={() => setShowConditionDialog(null)}
                                            className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded hover:bg-muted/80"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {
                    participant.speed && participant.speed.length > 0 && !isEditing && (
                        <div className="flex gap-2 mt-4">
                            {participant.speed.map((s: string, i: number) => (
                                <Badge key={i} variant="outline" className="bg-card">
                                    🦶 {s}
                                </Badge>
                            ))}
                        </div>
                    )
                }

                </CardContent >
        </Card >
    );
}

export default ActiveCombatantDisplay;
