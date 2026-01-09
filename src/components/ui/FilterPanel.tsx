import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FilterPanelProps {
    title?: string;
    activeFiltersCount?: number;
    children: React.ReactNode;
    onReset?: () => void;
    className?: string;
    defaultOpen?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
    title = "Filtres Avancés",
    activeFiltersCount = 0,
    children,
    onReset,
    className = "",
    defaultOpen = false
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`parchment-panel rounded-xl overflow-hidden mb-4 border border-border transition-all duration-300 ${className}`}>
            {/* Header clickable pour ouvrir/fermer */}
            <div
                className="flex items-center justify-between p-3 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 font-cinzel font-bold text-foreground">
                    <Filter className="h-4 w-4 text-primary" />
                    <span>{title}</span>
                    {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary-foreground ml-2 text-xs">
                            {activeFiltersCount} actifs
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {activeFiltersCount > 0 && onReset && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                onReset();
                            }}
                        >
                            Réinitialiser
                        </Button>
                    )}
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
            </div>

            {/* Contenu des filtres avec animation simple */}
            {isOpen && (
                <div className="p-4 border-t border-border bg-white/40 animate-slide-up">
                    {children}
                </div>
            )}
        </div>
    );
};

export default FilterPanel;
