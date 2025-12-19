import React from 'react';
import { Spell } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, MousePointer, Box, Hourglass, BookOpen } from 'lucide-react';

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

const SpellCard: React.FC<SpellCardProps> = ({ spell, className = '' }) => {
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
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
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
                        <div className="flex items-center text-xs text-gray-500 uppercase font-bold tracking-wider">
                            <Box className="w-3 h-3 mr-1" /> Composantes
                        </div>
                        <span className="text-sm font-medium truncate" title={spell.components}>{spell.components}</span>
                    </div>
                    <div className="bg-white p-3 flex flex-col gap-1">
                        <div className="flex items-center text-xs text-gray-500 uppercase font-bold tracking-wider">
                            <Hourglass className="w-3 h-3 mr-1" /> Durée
                        </div>
                        <span className="text-sm font-medium">{spell.duration}</span>
                    </div>
                </div>

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
