import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-card/50 text-muted-foreground mt-auto">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">
                    {/* Logo / Brand Section */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <span className="text-primary italic">Trame</span>
                        </h2>
                        <p className="text-sm max-w-xs leading-relaxed">
                            L'outil compagnon ultime pour les Maîtres de Jeu D&D 5e. Créez, gérez et vivez vos aventures en toute simplicité.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div className="grid grid-cols-2 gap-8 md:col-span-1">
                        <div className="flex flex-col gap-3">
                            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">Navigation</h3>
                            <Link to="/monsters" className="text-sm hover:text-primary transition-colors">Bestiaire</Link>
                            <Link to="/grimoire" className="text-sm hover:text-primary transition-colors">Sorts</Link>
                            <Link to="/encounters" className="text-sm hover:text-primary transition-colors">Rencontres</Link>
                        </div>
                        <div className="flex flex-col gap-3">
                            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">Communauté</h3>
                            <Link to="/news" className="text-sm hover:text-primary transition-colors">Actualités</Link>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">GitHub</a>
                            <a href="#" className="text-sm hover:text-primary transition-colors">Discord</a>
                        </div>
                    </div>

                    {/* Legal & Newsletter Section */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">Légal</h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <Link to="/privacy" className="text-sm hover:text-primary transition-colors">Politique de confidentialité</Link>
                            <Link to="/terms" className="text-sm hover:text-primary transition-colors">Conditions d'utilisation</Link>
                            <Link to="/cookies" className="text-sm hover:text-primary transition-colors">Politique des cookies</Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs">
                        © {currentYear} Trame. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-medium">Systèmes Opérationnels</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
