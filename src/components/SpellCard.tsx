import React, { useState } from 'react';
import { Spell } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, MousePointer, Box, Hourglass, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface SpellCardProps {
    spell: Spell;
    className?: string;
}

const getSchoolColor = (school: string) => {
    const colors: Record<string, string> = {
        'evocation': 'bg-red-100 text-red-800 border-red-200',
        'abjuration': 'bg-blue-100 text-blue-800 border-blue-200',
        'conjuration': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'divination': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        'enchantment': 'bg-pink-100 text-pink-800 border-pink-200',
        'illusion': 'bg-purple-100 text-purple-800 border-purple-200',
        'necromancy': 'bg-gray-100 text-gray-800 border-gray-200',
        'transmutation': 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[school.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// Parse material component for cost and consumption info
const parseMaterialComponent = (components: string) => {
    // Extract material part within parentheses
    const match = components.match(/M\s*\(([^)]+)\)/i);
    if (!match) return null;

    const material = match[1];

    // Look for gold cost (po = pièces d'or, gp = gold pieces)
    const costMatch = material.match(/(\d+[\s,.]?\d*)\s*(po|gp|pièces?\s*d'or)/i);
    const cost = costMatch ? costMatch[1].replace(/[\s,]/g, '') : null;

    // Check if consumed
    const isConsumed = /consomm|consume|détruit|destroy/i.test(material);

    return {
        material,
        cost: cost ? parseInt(cost) : null,
        isConsumed
    };
};

const SpellCard: React.FC<SpellCardProps> = ({ spell, className = '' }) => {
    const materialInfo = parseMaterialComponent(spell.components || '');
    const [showMaterialDetails, setShowMaterialDetails] = useState(false);
    const hasLongMaterial = materialInfo && materialInfo.material.length > 40;

    return (
        <Card className={`h-full flex flex-col ${className}`}>
            <CardHeader className="pb-2 bg-gray-50/50 rounded-t-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-serif text-gray-900">{spell.name}</CardTitle>
                        <div className="flex items-center mt-1 gap-2">
                            <Badge variant="outline" className={getSchoolColor(spell.school)}>
                                {spell.school}
                            </Badge>
                            <span className="text-sm text-gray-500 italic">
                                {spell.level === 0 ? 'Tour de magie' : `Niveau ${spell.level}`}
                            </span>
                            {spell.ritual && (
                                <Badge variant="secondary" className="text-xs">Rituel</Badge>
                            )}
                            {materialInfo?.cost && (
                                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                    💰 {materialInfo.cost} po
                                    {materialInfo.isConsumed && ' (consommé)'}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col relative">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-px bg-gray-200 border-b border-gray-200">
                    <div className="bg-white p-3 flex flex-col gap-1">
                        <div className="flex items-center text-xs text-gray-500 uppercase font-bold tracking-wider">
                            <Clock className="w-3 h-3 mr-1" /> Incantation
                        </div>
                        <span className="text-sm font-medium">{spell.castingTime}</span>
                    </div>
                    <div className="bg-white p-3 flex flex-col gap-1">
                        <div className="flex items-center text-xs text-gray-500 uppercase font-bold tracking-wider">
                            <MousePointer className="w-3 h-3 mr-1" /> Portée
                        </div>
                        <span className="text-sm font-medium">{spell.range}</span>
                    </div>
                    <div className="bg-white p-3 flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs text-gray-500 uppercase font-bold tracking-wider">
                            <div className="flex items-center">
                                <Box className="w-3 h-3 mr-1" /> Composantes
                            </div>
                            {hasLongMaterial && (
                                <button
                                    onClick={() => setShowMaterialDetails(!showMaterialDetails)}
                                    className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                                    title={showMaterialDetails ? "Masquer les détails" : "Voir les détails"}
                                >
                                    {showMaterialDetails ? (
                                        <ChevronUp className="w-3 h-3" />
                                    ) : (
                                        <ChevronDown className="w-3 h-3" />
                                    )}
                                </button>
                            )}
                        </div>
                        <span className="text-sm font-medium truncate" title={spell.components}>
                            {spell.components}
                        </span>
                    </div>
                    <div className="bg-white p-3 flex flex-col gap-1">
                        <div className="flex items-center text-xs text-gray-500 uppercase font-bold tracking-wider">
                            <Hourglass className="w-3 h-3 mr-1" /> Durée
                        </div>
                        <span className="text-sm font-medium">{spell.duration}</span>
                    </div>
                </div>

                {/* Expandable Material Details Overlay */}
                {showMaterialDetails && materialInfo && (
                    <div className="absolute left-0 right-0 top-[92px] z-10 bg-amber-50 border border-amber-200 rounded-b-lg shadow-lg p-3 mx-2">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="text-xs text-amber-700 font-bold uppercase mb-1">Composante Matérielle</div>
                                <p className="text-sm text-amber-900">{materialInfo.material}</p>
                            </div>
                            <button
                                onClick={() => setShowMaterialDetails(false)}
                                className="p-1 hover:bg-amber-100 rounded transition-colors ml-2"
                            >
                                <ChevronUp className="w-4 h-4 text-amber-700" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Description */}
                <ScrollArea className="flex-1 p-4">
                    <div
                        className="prose prose-sm prose-stone max-w-none 
              prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-gray-900
              prose-li:marker:text-gray-400"
                        dangerouslySetInnerHTML={{ __html: spell.description }}
                    />

                    {/* Classes */}
                    {spell.classes && spell.classes.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-2 text-sm text-gray-500 font-medium">
                                <BookOpen className="w-4 h-4" /> Classes
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {spell.classes.map(cls => (
                                    <Badge key={cls} variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-normal">
                                        {cls}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default SpellCard;
