import React from 'react';
import { Monster } from '../lib/types';
import { Separator } from '@/components/ui/separator';

interface StatBlockProps {
    monster: Monster;
    className?: string;
    layoutMode?: 'default' | 'compact';
    hideImage?: boolean;
}

const AbilityScore = ({ label, score }: { label: string; score?: number }) => {
    const val = score || 10;
    const mod = Math.floor((val - 10) / 2);
    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;

    return (
        <div className="flex flex-col items-center text-[#7A200D]">
            <span className="font-bold text-sm">{label}</span>
            <span className="text-sm font-sans text-black whitespace-nowrap">
                {val} ({modStr})
            </span>
        </div>
    );
};

const PropertyLine = ({ label, value }: { label: string; value?: string | number | React.ReactNode }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <div className="text-[13.5px] leading-snug text-black mb-1">
            <span className="font-bold text-[#7A200D]">{label} </span>
            <span className="text-black">{value}</span>
        </div>
    );
};

export const StatBlock: React.FC<StatBlockProps> = ({ monster, className = '', layoutMode = 'default', hideImage = false }) => {
    // ... (formatSpeed and formatDescription remain the same)

    const formatSpeed = (speed: any) => {
        if (!speed) return '9 m';
        if (typeof speed === 'string') return speed;
        if (Array.isArray(speed)) return speed.join(', ');
        const parts = [];
        if (speed.walk) parts.push(`${speed.walk} m (marche)`);
        if (speed.fly) parts.push(`vol ${speed.fly} m`);
        if (speed.swim) parts.push(`nage ${speed.swim} m`);
        if (speed.climb) parts.push(`escalade ${speed.climb} m`);
        if (parts.length === 0 && Object.keys(speed).length > 0) {
            return Object.entries(speed).map(([k, v]) => `${k} ${v}`).join(', ');
        }
        return parts.join(', ') || '9 m';
    };

    const formatDescription = (desc: string) => {
        if (!desc) return '';
        // If it seems to have HTML tags, return as is
        if (/<[a-z][\s\S]*>/i.test(desc)) {
            return desc;
        }
        // Otherwise, replace newlines with <br>
        return desc.replace(/\n/g, '<br />');
    };

    const speedDisplay = formatSpeed(monster.speed);

    // Layout configuration
    // Default: lg:flex-row (side-by-side)
    // Compact: flex-col (stacked) regardless of screen size
    const containerClasses = layoutMode === 'compact'
        ? `flex flex-col gap-4 items-start ${className}`
        : `flex flex-col md:flex-row gap-6 items-start ${className}`;

    const abilityGridClasses = "grid grid-cols-3 gap-x-4 gap-y-4 mb-4 px-2";

    const imageContainerClasses = layoutMode === 'compact'
        ? "w-full flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-700 order-first" // Image on top in compact mode? or bottom? typically top is better for narrow cards. Let's put it top by using order-first if we want. Or Keep bottom.
        // User screenshot shows image on RIGHT (squishing text).
        // Let's stick to flex-col which stacks them. Text first or Image first?
        // Usually Statblock has Image floating or to side. If vertical, Image at bottom or top.
        // Let's try Image at TOP for compact (like a card) or BOTTOM.
        // Actually, pure Statblock usually keeps stats at top. Let's keep image at bottom for stacked.
        : "w-full lg:w-[320px] flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-700";

    return (
        <div className={containerClasses}>
            {/* Main Stat Block */}
            <div className="flex-1 w-full bg-[#FDF1DC] border-[2px] border-[#E69A28] p-5 shadow-sm font-sans text-black relative">
                {/* Header Section (Full Width) */}
                <div className="mb-4">
                    <h1 className="font-cinzel text-3xl font-bold text-[#7A200D] tracking-wide uppercase leading-none mb-1">
                        {monster.name}
                    </h1>
                    {monster.originalName && monster.originalName !== monster.name && (
                        <div className="italic text-sm text-[#7A200D] mb-1">
                            [ {monster.originalName} ]
                        </div>
                    )}
                    <div className="italic text-sm text-black">
                        {monster.type} {monster.subtype ? `(${monster.subtype})` : ''} de taille {monster.size}, {monster.alignment}
                    </div>
                </div>

                <Separator className="bg-[#7A200D] h-[2px] mb-4 opacity-80" />

                <div className="space-y-4">
                    {/* STATS SECTION */}
                    <div>
                        {/* Stats: AC, HP, Speed */}
                        <div className="space-y-1 mb-4 text-[#7A200D]">
                            <PropertyLine label="Classe d'Armure" value={monster.ac} />
                            <PropertyLine label="Points de Vie" value={`${monster.hp}`} />
                            <PropertyLine label="Vitesse" value={speedDisplay} />
                        </div>

                        <Separator className="bg-[#7A200D] h-[2px] mb-4 opacity-80" />

                        {/* Ability Scores */}
                        <div className={abilityGridClasses}>
                            <AbilityScore label="FOR" score={monster.str} />
                            <AbilityScore label="DEX" score={monster.dex} />
                            <AbilityScore label="CON" score={monster.con} />
                            <AbilityScore label="INT" score={monster.int} />
                            <AbilityScore label="SAG" score={monster.wis} />
                            <AbilityScore label="CHA" score={monster.cha} />
                        </div>

                        <Separator className="bg-[#7A200D] h-[2px] mb-4 opacity-80" />

                        {/* Skills & Details */}
                        <div className="space-y-1 mb-4 text-[13.5px]">
                            <PropertyLine label="Jets de sauvegarde" value={monster.savingThrows} />
                            <PropertyLine label="Compétences" value={monster.skills} />
                            <PropertyLine label="Vulnérabilités aux dégâts" value={monster.damageVulnerabilities} />
                            <PropertyLine label="Résistances aux dégâts" value={monster.damageResistances} />
                            <PropertyLine label="Immunités aux dégâts" value={monster.damageImmunities} />
                            <PropertyLine label="Immunités aux états" value={monster.conditionImmunities} />
                            <PropertyLine label="Sens" value={monster.senses} />
                            <PropertyLine label="Langues" value={monster.languages} />
                            <PropertyLine label="Puissance" value={`${monster.cr} (${monster.xp} XP)`} />
                        </div>
                    </div>

                    <Separator className="bg-[#7A200D] h-[2px] mb-4 opacity-80" />

                    {/* ABILITIES & ACTIONS SECTION */}
                    <div>
                        {/* Traits */}
                        {monster.traits && monster.traits.length > 0 && (
                            <div className="space-y-3 mb-6 text-[#7A200D]">
                                {monster.traits.map((trait, idx) => (
                                    <div key={idx} className="text-[13.5px] leading-relaxed text-black">
                                        <span className="font-bold italic text-black">{trait.name}. </span>
                                        <span dangerouslySetInnerHTML={{ __html: formatDescription(trait.desc || (trait as any).description) }} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        {monster.actions && monster.actions.length > 0 && (
                            <div className="mb-6">
                                <h2 className="font-sans text-lg font-normal border-b border-[#7A200D] text-[#7A200D] mb-3 uppercase tracking-wide">
                                    Actions
                                </h2>
                                <div className="space-y-3">
                                    {monster.actions.map((action, idx) => (
                                        <div key={idx} className="text-[13.5px] leading-relaxed">
                                            <span className="font-bold italic text-black">{action.name}. </span>
                                            <span dangerouslySetInnerHTML={{ __html: formatDescription(action.desc || (action as any).description) }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reactions */}
                        {monster.reactions && monster.reactions.length > 0 && (
                            <div className="mb-6">
                                <h2 className="font-sans text-lg font-normal border-b border-[#7A200D] text-[#7A200D] mb-3 uppercase tracking-wide">
                                    Réactions
                                </h2>
                                <div className="space-y-3">
                                    {monster.reactions.map((reaction, idx) => (
                                        <div key={idx} className="text-[13.5px] leading-relaxed">
                                            <span className="font-bold italic text-black">{reaction.name}. </span>
                                            <span dangerouslySetInnerHTML={{ __html: formatDescription(reaction.desc || (reaction as any).description) }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Legendary Actions */}
                        {monster.legendaryActions && monster.legendaryActions.length > 0 && (
                            <div className="mb-6">
                                <h2 className="font-sans text-lg font-normal border-b border-[#7A200D] text-[#7A200D] mb-3 uppercase tracking-wide">
                                    Actions Légendaires
                                </h2>
                                <p className="text-[13.5px] mb-3 text-black">
                                    La créature peut effectuer 3 actions légendaires, en choisissant parmi les options suivantes. Une seule action légendaire peut être utilisée à la fois et uniquement à la fin du tour d'une autre créature. La créature récupère les actions légendaires dépensées au début de son tour.
                                </p>
                                <div className="space-y-3">
                                    {monster.legendaryActions.map((action, idx) => (
                                        <div key={idx} className="text-[13.5px] leading-relaxed">
                                            <span className="font-bold italic text-black">{action.name}. </span>
                                            <span dangerouslySetInnerHTML={{ __html: formatDescription(action.desc || (action as any).description) }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 pt-2 border-t border-[#7A200D]/30 text-xs text-[#7A200D]/70 font-sans">
                    Source: {monster.source || "Base de données"}
                </div>
            </div>

            {/* Image Section */}
            {!hideImage && monster.image && (
                <div className="w-full lg:w-[320px] flex-shrink-0 animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="border-[6px] border-double border-[#7A200D]/20 bg-white p-1 shadow-xl rounded-sm">
                        <img
                            src={monster.image}
                            alt={monster.name}
                            className="w-full h-auto object-cover block"
                            onError={(e) => {
                                // Hide parent div on error if desirable, or show placeholder
                                (e.target as HTMLImageElement).style.display = 'none';
                                ((e.target as HTMLImageElement).parentElement as HTMLElement).style.display = 'none';
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
