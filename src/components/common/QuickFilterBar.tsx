import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface QuickFilterOption {
    label: string;
    value: string;
    color?: string;
}

interface QuickFilterBarProps {
    title?: string;
    options: QuickFilterOption[];
    selectedValue: string | null;
    onSelect: (value: string | null) => void;
    className?: string;
}

const QuickFilterBar: React.FC<QuickFilterBarProps> = ({
    title = "Filtres rapides",
    options,
    selectedValue,
    onSelect,
    className = ""
}) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {title && <Label className="text-xs font-cinzel font-bold text-muted-foreground">{title}</Label>}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mb-1">
                {options.map(({ label, value, color }) => (
                    <Badge
                        key={value}
                        variant={selectedValue === value ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all whitespace-nowrap flex-shrink-0 touch-target active:scale-95 ${selectedValue === value
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : color
                                ? `${color} opacity-70 hover:opacity-100`
                                : 'bg-white/50 hover:bg-primary/10'
                            }`}
                        onClick={() => onSelect(selectedValue === value ? null : value)}
                    >
                        {label}
                    </Badge>
                ))}
            </div>
        </div>
    );
};

export default QuickFilterBar;
