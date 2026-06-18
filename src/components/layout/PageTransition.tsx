import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '@/hooks/useSettings';

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
    const { settings } = useSettings();

    // Si l'effet de transition de page est désactivé, on rend directement les enfants
    // sans motion.div (pas d'animation).
    if (!settings.effects.pageTransition) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
