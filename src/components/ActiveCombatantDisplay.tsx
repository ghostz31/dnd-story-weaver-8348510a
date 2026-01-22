import React from 'react';
import { EncounterParticipant } from '../lib/types';
import { getAideDDMonsterSlug, getConditionInfo } from '../lib/EncounterUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Heart, Zap, ExternalLink, ChevronLeft, ChevronRight, Edit, Save, X, User, Book, Hash, Swords } from 'lucide-react';
import { StatBlock } from './StatBlock';
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
            <div className="h-full overflow-y-auto custom-scrollbar p-2 bg-stone-100/50 relative">
                <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 z-10 h-8 w-8"
                    onClick={onToggleCollapse}
                    title="Afficher les détails complets"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
                <div className="max-w-sm mx-auto bg-white/90 p-4 rounded-lg shadow-md border border-stone-200">
                    <h3 className="text-lg font-bold text-stone-800 mb-3">{participant.name}</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold">CA:</span> {participant.ac}
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="font-semibold">PV:</span>
                            <span>
                                {participant.currentHp}/{typeof participant.maxHp === 'object' ? JSON.stringify(participant.maxHp) : participant.maxHp}
                                {participant.tempHp ? <span className="text-blue-500 ml-1">(+{participant.tempHp})</span> : ''}
                            </span>
                        </div>
                    </div>
                    {monsterData.actions && monsterData.actions.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-stone-200">
                            <h4 className="text-xs font-bold text-stone-600 uppercase mb-2">Action principale</h4>
                            <div className="text-xs text-stone-700">
                                <span className="font-semibold">{monsterData.actions[0].name}</span>
                                {monsterData.actions[0].description && (
                                    <p className="mt-1 text-stone-600 line-clamp-3">{monsterData.actions[0].description}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-2 bg-stone-100/50 relative">
            <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 z-10 h-8 w-8 bg-white/80 hover:bg-white shadow-sm"
                onClick={onToggleCollapse}
                title="Réduire le panneau"
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="max-w-4xl mx-auto bg-white/50 min-h-full">
                <StatBlock monster={monsterData} className="w-full shadow-md border-y md:border-x border-stone-200" hideImage={true} />
            </div>
        </div>
    );
};


const PlayerDisplay: React.FC<{ participant: EncounterParticipant; onLinkDndBeyond?: (id: string, url: string) => void; onUpdate?: (updates: Partial<EncounterParticipant>) => void; isCollapsed: boolean; onToggleCollapse: () => void }> = ({ participant, onLinkDndBeyond, onUpdate, isCollapsed, onToggleCollapse }) => {
    const [isLinking, setIsLinking] = React.useState(false);
    const [linkUrl, setLinkUrl] = React.useState('');
    const [localNotes, setLocalNotes] = React.useState(participant.notes || '');

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
            <div className="h-full overflow-y-auto custom-scrollbar p-2 bg-blue-50/50 relative">
                <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 z-10 h-8 w-8"
                    onClick={onToggleCollapse}
                    title="Afficher les détails complets"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
                <div className="max-w-sm mx-auto bg-white/90 p-4 rounded-lg shadow-md border border-blue-200">
                    <h3 className="text-lg font-bold text-blue-800 mb-3">{participant.name}</h3>
                    <div className="text-xs text-blue-600 mb-2">
                        {participant.race} {participant.class} {participant.level ? `Niv. ${participant.level}` : ''}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold">CA:</span> {participant.ac}
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="font-semibold">PV:</span>
                            <span>
                                {participant.currentHp}/{participant.maxHp}
                                {participant.tempHp ? <span className="text-blue-500 ml-1">(+{participant.tempHp})</span> : ''}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">Init:</span> {participant.initiative}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Card className="w-full h-full flex flex-col overflow-hidden border-none shadow-none bg-blue-50/50 relative">
            <CardHeader className="py-2 px-4 bg-blue-100 border-b">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        {isEditing ? (
                            <Input
                                value={editData.name as string}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="font-bold text-lg h-8 mb-2"
                            />
                        ) : (
                            <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                {participant.name}
                            </CardTitle>
                        )}

                        {!isEditing && (
                            <div className="flex flex-wrap gap-2 text-sm text-blue-700 mt-1">
                                {(participant.race || participant.class || participant.level) ? (
                                    <>
                                        {participant.race && <Badge variant="secondary" className="bg-white/50">{participant.race}</Badge>}
                                        {participant.class && <Badge variant="secondary" className="bg-white/50">{participant.class}</Badge>}
                                        {participant.level && <Badge variant="outline" className="bg-blue-50">Niveau {participant.level}</Badge>}
                                    </>
                                ) : (
                                    <span className="text-blue-400 italic">Détails non définis</span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-1">
                        {!participant.dndBeyondId && !isEditing && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-800" onClick={handleStartEdit} title="Modifier">
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        {isEditing && (
                            <>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-800" onClick={handleSaveEdit} title="Sauvegarder">
                                    <Save className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-800" onClick={handleCancelEdit} title="Annuler">
                                    <X className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Zone de contrôle D&D Beyond */}
                <div className="mt-2 pt-2 border-t border-blue-200">
                    {participant.dndBeyondId ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                                    <Zap size={10} className="fill-green-700" /> Live Sync Actif
                                </Badge>
                                <span className="text-xs text-gray-400">ID: {participant.dndBeyondId}</span>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={`https://www.dndbeyond.com/characters/${participant.dndBeyondId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                                >
                                    <ExternalLink size={12} /> Fiche D&D Beyond
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {!isEditing && (
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-1 text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                                        <span>Mode Manuel</span>
                                    </div>
                                    {onLinkDndBeyond && !isLinking && (
                                        <button
                                            onClick={() => setIsLinking(true)}
                                            className="ml-auto text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                                        >
                                            <ExternalLink size={10} /> Lier D&D Beyond
                                        </button>
                                    )}
                                </div>
                            )}

                            {isLinking && (
                                <div className="flex flex-col gap-2 bg-white p-2 rounded shadow-sm border border-blue-200 mt-1">
                                    <label className="text-xs font-semibold text-gray-700">URL du personnage :</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={linkUrl}
                                            onChange={(e) => setLinkUrl(e.target.value)}
                                            placeholder="https://www.dndbeyond.com/characters/..."
                                            className="text-xs border rounded p-1 flex-1"
                                            autoFocus
                                        />
                                        <button onClick={handleLink} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">OK</button>
                                        <button onClick={() => setIsLinking(false)} className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">X</button>
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
                    <div className="grid grid-cols-3 gap-3 mb-6 bg-white p-3 rounded-lg border border-blue-100">
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
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-blue-100 relative">
                        <Shield className="w-8 h-8 text-blue-500 mb-2" />
                        {isEditing ? (
                            <Input
                                type="number"
                                value={editData.ac as number}
                                onChange={(e) => handleChange('ac', parseInt(e.target.value) || 10)}
                                className="text-center font-bold text-lg h-10 w-20"
                            />
                        ) : (
                            <span className="text-2xl font-bold text-gray-800">{participant.ac}</span>
                        )}
                        <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">CA</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                        <Heart className="w-8 h-8 text-red-500 mb-2" />
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
                                    <Label className="text-xs text-blue-500">Temp</Label>
                                    <Input
                                        type="number"
                                        value={editData.tempHp || 0}
                                        onChange={(e) => handleChange('tempHp', parseInt(e.target.value) || 0)}
                                        className="text-center text-sm h-8 w-16 border-blue-200"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-bold text-gray-800">
                                    {participant.currentHp} <span className="text-gray-400 text-lg">/ {participant.maxHp}</span>
                                </span>
                                {participant.tempHp && participant.tempHp > 0 && (
                                    <span className="text-sm font-bold text-blue-500">+{participant.tempHp} Temp</span>
                                )}
                            </div>
                        )}
                        <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">PV</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                        <Zap className="w-8 h-8 text-yellow-500 mb-2" />
                        {isEditing ? (
                            <Input
                                type="number"
                                value={editData.initiative as number}
                                onChange={(e) => handleChange('initiative', parseInt(e.target.value) || 0)}
                                className="text-center font-bold text-lg h-10 w-20"
                            />
                        ) : (
                            <span className="text-2xl font-bold text-gray-800">{participant.initiative}</span>
                        )}
                        <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">Initiative</span>
                    </div>
                </div >

                {/* Death Saves Checkboxes */}
                {participant.currentHp <= 0 && (
                    <div className="mb-6 bg-stone-100 p-4 rounded-lg border border-stone-300">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-stone-600" />
                            <h4 className="text-sm font-bold text-stone-700">Jets de Mort</h4>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-green-700">Succès</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => (
                                        <div
                                            key={i}
                                            className={`w-4 h-4 rounded-full border border-green-500 cursor-pointer ${participant.deathSaves?.successes && participant.deathSaves.successes >= i ? 'bg-green-500' : 'bg-white'}`}
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
                                <span className="text-sm font-medium text-red-700">Échecs</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => (
                                        <div
                                            key={i}
                                            className={`w-4 h-4 rounded-full border border-red-500 cursor-pointer ${participant.deathSaves?.failures && participant.deathSaves.failures >= i ? 'bg-red-500' : 'bg-white'}`}
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
                {/* Caractéristiques - Toujours afficher pour les joueurs */}
                <div className="grid grid-cols-6 gap-2 mb-6">
                    {[
                        { label: 'FOR', key: 'str', val: isEditing ? editData.str : participant.str },
                        { label: 'DEX', key: 'dex', val: isEditing ? editData.dex : participant.dex },
                        { label: 'CON', key: 'con', val: isEditing ? editData.con : participant.con },
                        { label: 'INT', key: 'int', val: isEditing ? editData.int : participant.int },
                        { label: 'SAG', key: 'wis', val: isEditing ? editData.wis : participant.wis },
                        { label: 'CHA', key: 'cha', val: isEditing ? editData.cha : participant.cha }
                    ].map((stat, idx) => {
                        const val = stat.val as number || 10;
                        const mod = Math.floor((val - 10) / 2);
                        const sign = mod >= 0 ? '+' : '';

                        return (
                            <div key={idx} className={`flex flex-col items-center p-2 rounded shadow-sm border ${isEditing ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-100'}`}>
                                <span className="text-[10px] font-bold text-gray-500 mb-1">{stat.label}</span>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        value={val}
                                        onChange={(e) => handleChange(stat.key as keyof EncounterParticipant, parseInt(e.target.value) || 10)}
                                        className="h-8 text-center text-sm p-0 mb-1"
                                    />
                                ) : (
                                    <span className="text-lg font-bold text-gray-800">{val}</span>
                                )}
                                <span className="text-xs text-blue-600 bg-white/50 px-1 rounded font-mono">{sign}{mod}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Maitrises & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Maitrises - Affichées si non-Beyond */}
                    {!participant.dndBeyondId && (
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Swords className="h-4 w-4 text-gray-600" />
                                <h4 className="text-sm font-semibold text-gray-700">Maîtrises & Aptitudes</h4>
                            </div>
                            {isEditing ? (
                                <Textarea
                                    value={editData.proficiencies as string}
                                    onChange={(e) => handleChange('proficiencies', e.target.value)}
                                    className="min-h-[100px] text-sm"
                                    placeholder="Armures, Armes, Outils, Langues, Dons..."
                                />
                            ) : (
                                <div className="text-sm text-gray-700 whitespace-pre-wrap min-h-[50px]">
                                    {participant.proficiencies || <span className="text-gray-400 italic">Aucune maîtrise renseignée.</span>}
                                </div>
                            )}
                        </div>
                    )}

                    <div className={`${participant.dndBeyondId ? 'col-span-2' : ''} bg-white p-4 rounded-lg shadow-sm border border-gray-100`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Book className="h-4 w-4 text-gray-600" />
                            <h4 className="text-sm font-semibold text-gray-700">Notes de session</h4>
                        </div>
                        <textarea
                            className="w-full text-sm p-2 border rounded resize-y min-h-[100px] text-gray-700 bg-transparent focus:ring-2 focus:ring-blue-200 focus:outline-none"
                            value={localNotes}
                            onChange={(e) => setLocalNotes(e.target.value)}
                            onBlur={() => onUpdate?.({ notes: localNotes })}
                            placeholder="Notes temporaires pour ce combat..."
                        />
                    </div>
                </div>

                {/* Vitesse et Conditions existantes */}
                {
                    participant.speed && participant.speed.length > 0 && !isEditing && (
                        <div className="flex gap-2 mt-4">
                            {participant.speed.map((s: string, i: number) => (
                                <Badge key={i} variant="outline" className="bg-white">
                                    🦶 {s}
                                </Badge>
                            ))}
                        </div>
                    )
                }

                {
                    participant.conditions && participant.conditions.length > 0 && (
                        <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border border-red-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Conditions</h4>
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
            </CardContent >
        </Card >
    );
}

export default ActiveCombatantDisplay;
