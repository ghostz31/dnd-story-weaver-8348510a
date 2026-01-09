import React from 'react';
import { EncounterParticipant } from '../lib/types'; // Assurez-vous que le chemin est correct
import { getAideDDMonsterSlug } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Heart, Zap, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatBlock } from './StatBlock';

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
                            <span className="font-semibold">PV:</span> {participant.currentHp}/{typeof participant.maxHp === 'object' ? JSON.stringify(participant.maxHp) : participant.maxHp}
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
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold">CA:</span> {participant.ac}
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="font-semibold">PV:</span> {participant.currentHp}/{participant.maxHp}
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
                    <div>
                        <CardTitle className="text-lg font-bold text-blue-900">
                            {participant.name}
                        </CardTitle>
                        <p className="text-sm text-blue-700">{participant.isPC ? 'Personnage Joueur' : (participant.notes || 'Note')}</p>
                    </div>
                </div>

                {/* Zone de contrôle D&D Beyond */}
                <div className="mt-3 pt-2 border-t border-blue-200">
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
                            <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-2 py-1 rounded text-xs">
                                <Badge variant="outline" className="border-yellow-500 text-yellow-700">Non lié</Badge>
                                <span>Pas de synchronisation</span>
                            </div>

                            {onLinkDndBeyond ? (
                                !isLinking ? (
                                    <button
                                        onClick={() => setIsLinking(true)}
                                        className="text-xs bg-white border border-blue-300 text-blue-700 px-2 py-1 rounded hover:bg-blue-50 flex items-center gap-1 w-fit"
                                    >
                                        <ExternalLink size={12} /> Lier une fiche D&D Beyond
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-2 bg-white p-2 rounded shadow-sm border border-blue-200">
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
                                            <button
                                                onClick={handleLink}
                                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                                            >
                                                OK
                                            </button>
                                            <button
                                                onClick={() => setIsLinking(false)}
                                                className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded"
                                            >
                                                X
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-400">Collez l'URL complète de la fiche personnage</p>
                                    </div>
                                )
                            ) : (
                                <span className="text-xs text-red-500">Fonction de liaison indisponible</span>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                        <Shield className="w-8 h-8 text-blue-500 mb-2" />
                        <span className="text-2xl font-bold text-gray-800">{participant.ac}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">CA</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                        <div className="relative">
                            <Heart className="w-8 h-8 text-red-500 mb-2" />
                        </div>
                        <span className="text-2xl font-bold text-gray-800">
                            {participant.currentHp} <span className="text-gray-400 text-lg">/ {participant.maxHp}</span>
                        </span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">PV</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                        <Zap className="w-8 h-8 text-yellow-500 mb-2" />
                        <span className="text-2xl font-bold text-gray-800">{participant.initiative}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Initiative</span>
                    </div>
                </div>

                {/* Caractéristiques */}
                {(participant.str !== undefined) && (
                    <div className="grid grid-cols-6 gap-2 mb-6">
                        {[
                            { label: 'FOR', val: participant.str },
                            { label: 'DEX', val: participant.dex },
                            { label: 'CON', val: participant.con },
                            { label: 'INT', val: participant.int },
                            { label: 'SAG', val: participant.wis },
                            { label: 'CHA', val: participant.cha }
                        ].map((stat, idx) => {
                            const mod = Math.floor(((stat.val || 10) - 10) / 2);
                            const sign = mod >= 0 ? '+' : '';
                            return (
                                <div key={idx} className="flex flex-col items-center p-2 bg-white rounded shadow-sm border border-gray-100">
                                    <span className="text-xs font-bold text-gray-500">{stat.label}</span>
                                    <span className="text-lg font-bold text-gray-800">{stat.val}</span>
                                    <span className="text-xs text-blue-600 bg-blue-50 px-1 rounded">{sign}{mod}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Vitesse */}
                {participant.speed && participant.speed.length > 0 && (
                    <div className="flex gap-2 mb-4">
                        {participant.speed.map((s, i) => (
                            <Badge key={i} variant="outline" className="bg-white">
                                🦶 {s}
                            </Badge>
                        ))}
                    </div>
                )}

                {participant.conditions && participant.conditions.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-red-100 mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Conditions</h4>
                        <div className="flex flex-wrap gap-2">
                            {participant.conditions.map((condition, idx) => (
                                <Badge key={idx} variant="destructive">{condition}</Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
                    <textarea
                        className="w-full text-sm p-2 border rounded resize-y min-h-[100px] text-gray-700 bg-transparent focus:ring-2 focus:ring-blue-200 focus:outline-none"
                        value={localNotes}
                        onChange={(e) => setLocalNotes(e.target.value)}
                        onBlur={() => onUpdate?.({ notes: localNotes })}
                        placeholder="Notes temporaires pour ce combat (sauvegardées uniquement dans la session)..."
                    />
                </div>
            </CardContent>
            {/* Pied de page informatif si lié mais pas d'iframe */}

        </Card>
    );
}

export default ActiveCombatantDisplay;
