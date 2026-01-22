import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sword, Heart, Skull, Clock, Activity, AlertCircle } from 'lucide-react';
import { CombatLogEntry } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CombatLogProps {
    logs: CombatLogEntry[];
    className?: string;
}

const CombatLog: React.FC<CombatLogProps> = ({ logs, className = "" }) => {
    const scrollEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new log
    useEffect(() => {
        if (scrollEndRef.current) {
            scrollEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const getIcon = (type: CombatLogEntry['type']) => {
        switch (type) {
            case 'damage': return <Sword className="h-4 w-4 text-red-500" />;
            case 'heal': return <Heart className="h-4 w-4 text-green-500" />;
            case 'death-save': return <Skull className="h-4 w-4 text-gray-800" />;
            case 'turn': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'condition': return <Activity className="h-4 w-4 text-orange-500" />;
            default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
        }
    };

    return (
        <Card className={`h-full flex flex-col ${className}`}>
            <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Journal de Combat
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full w-full">
                    <div className="flex flex-col p-4 gap-2">
                        {logs.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center italic">
                                Le combat commence...
                            </p>
                        )}
                        {logs.slice().reverse().map((log) => (
                            <div key={log.id} className="flex items-start gap-2 text-sm even:bg-muted/30 p-1 rounded">
                                <span className="mt-0.5 shrink-0">{getIcon(log.type)}</span>
                                <div className="flex flex-col w-full">
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                                    </span>
                                    <span>{log.message}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={scrollEndRef} />
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default CombatLog;
