import React from 'react';
import { EncounterParticipant } from '../lib/types'; // Assurez-vous que le chemin est correct
import { getAideDDMonsterSlug } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Heart, Zap, ExternalLink } from 'lucide-react';

interface ActiveCombatantDisplayProps {
    participant: EncounterParticipant;
    className?: string;
    onLinkDndBeyond?: (id: string, url: string) => void;
    onUpdate?: (updates: Partial<EncounterParticipant>) => void;
}

const ActiveCombatantDisplay: React.FC<ActiveCombatantDisplayProps> = ({ participant, className, onLinkDndBeyond, onUpdate }) => {
    // Déterminer si c'est un monstre ou un joueur
    const isMonster = !participant.isPC;

    console.log(`[ActiveDisplay] Rendering ${participant.name}. ID: ${participant.dndBeyondId}. CanLink: ${!!onLinkDndBeyond}`);

    if (!participant) return null;

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {isMonster ? (
                <MonsterDisplay participant={participant} onUpdate={onUpdate} />
            ) : (
                <PlayerDisplay participant={participant} onLinkDndBeyond={onLinkDndBeyond} />
            )}
        </div>
    );
};

const MonsterDisplay: React.FC<{ participant: EncounterParticipant; onUpdate?: (updates: Partial<EncounterParticipant>) => void }> = ({ participant, onUpdate }) => {
    // Nettoyer le nom pour le slug
    const monsterName = participant.originalName || participant.name.replace(/\s\([A-Z0-9]+\)$/, '').trim();
    const slug = getAideDDMonsterSlug(monsterName);
    const iframeUrl = `https://www.aidedd.org/dnd/monstres.php?vf=${slug}`;

    // Bloodied State Logic
    const isBloodied = participant.currentHp <= (participant.maxHp / 2) && participant.currentHp > 0;

    return (
        <Card className={`w-full h-full flex flex-col overflow-hidden border-none shadow-none transition-all duration-500 ${isBloodied ? 'ring-2 ring-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse-slow' : ''}`}>
            <CardHeader className={`py-2 px-4 border-b flex flex-row items-center justify-between ${isBloodied ? 'bg-red-900/10' : 'bg-red-50'}`}>
                <CardTitle className="text-lg font-bold text-red-900 flex items-center gap-2">
                    {participant.name}
                    <Badge variant="outline" className="text-xs font-normal bg-white text-red-700 border-red-200">
                        {participant.type || 'Monstre'}
                    </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                    {isBloodied && <Badge variant="destructive" className="animate-pulse">BLESSÉ</Badge>}
                    <a href={iframeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-red-600 flex items-center gap-1 hover:underline">
                        AideDD <ExternalLink size={12} />
                    </a>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative">
                <iframe
                    src={iframeUrl}
                    className="w-full h-full border-none"
                    title={`Statistiques de ${participant.name}`}
                    sandbox="allow-scripts allow-same-origin"
                />

                {/* Legendary Actions Overlay */}
                {participant.legendaryActions && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm p-2 rounded-full flex gap-2 border border-yellow-500/50 shadow-lg z-10">
                        {Array.from({ length: participant.legendaryActions.max }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    if (!participant.legendaryActions || !onUpdate) return;
                                    const current = participant.legendaryActions.current;
                                    // Toggle logic: If clicking a filled slot (index < current), remove it.
                                    // Simply: if we have N actions, and user clicks, we decrement? 
                                    // Better UX: Click to toggle individual token state? 
                                    // Let's implement: Click = Spend one action if available.
                                    // Actually, standard UI is usually: Show available slots.
                                    // Let's make it simple: specific token click not needed, just list of filled/empty icons.
                                    // But to be interactive: Click the CONTAINER to spend one? Or individual tokens?
                                    // Individual tokens: indexes 0..max-1. If index < current, it is "available".
                                    // Click an available token -> spend it. Click a spent token -> recover it?

                                    const isActive = i < participant.legendaryActions.current;
                                    const newCount = isActive ? participant.legendaryActions.current - 1 : participant.legendaryActions.current + 1;

                                    onUpdate({
                                        legendaryActions: {
                                            ...participant.legendaryActions,
                                            current: Math.max(0, Math.min(participant.legendaryActions.max, newCount))
                                        }
                                    });
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${i < participant.legendaryActions.current
                                    ? 'bg-yellow-500 text-yellow-950 scale-100 shadow-[0_0_10px_rgba(234,179,8,0.8)]'
                                    : 'bg-gray-800 text-gray-600 scale-90'
                                    }`}
                                title="Action Légendaire"
                            >
                                <Zap size={16} fill={i < participant.legendaryActions.current ? "currentColor" : "none"} />
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const PlayerDisplay: React.FC<{ participant: EncounterParticipant; onLinkDndBeyond?: (id: string, url: string) => void }> = ({ participant, onLinkDndBeyond }) => {
    const [isLinking, setIsLinking] = React.useState(false);
    const [linkUrl, setLinkUrl] = React.useState('');

    const handleLink = () => {
        if (linkUrl && onLinkDndBeyond) {
            onLinkDndBeyond(participant.id, linkUrl);
            setIsLinking(false);
            setLinkUrl('');
        }
    };

    return (
        <Card className="w-full h-full flex flex-col overflow-hidden border-none shadow-none bg-blue-50/50">
            <CardHeader className="py-2 px-4 bg-blue-100 border-b">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-bold text-blue-900">
                            {participant.name}
                        </CardTitle>
                        <p className="text-sm text-blue-700">{participant.notes || 'Personnage Joueur'}</p>
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
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">
                        {participant.notes || "Aucune note pour ce personnage."}
                    </p>
                </div>
            </CardContent>
            {/* Pied de page informatif si lié mais pas d'iframe */}

        </Card>
    );
}

export default ActiveCombatantDisplay;
