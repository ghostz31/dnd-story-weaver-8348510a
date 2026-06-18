import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/auth/AuthContext';
import {
  Home,
  Users,
  Book,
  History,
  User,
  ChevronDown,
  LogIn,
  PenTool,
  Search,
  Scroll,
  Menu,
  X,
  Gem,
  Library
} from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';

// Éléments de navigation principaux (boutons directs)
const primaryNav = [
  { to: '/', label: 'Accueil', icon: Home, matchPaths: ['/'] },
  { to: '/parties', label: 'Groupes', icon: Users, matchPaths: ['/parties'] },
  { to: '/encounters', label: 'Rencontres', icon: PenTool, matchPaths: ['/encounters', '/custom'] },
  { to: '/history', label: 'Historique', icon: History, matchPaths: ['/history'] },
] as const;

// Éléments regroupés dans le menu déroulant "Bibliothèque"
const libraryNav = [
  { to: '/monsters', label: 'Bestiaire', icon: Book, matchPaths: ['/monsters'] },
  { to: '/grimoire', label: 'Grimoire', icon: Scroll, matchPaths: ['/grimoire'] },
  { to: '/items', label: 'Objets magiques', icon: Gem, matchPaths: ['/items'] },
] as const;

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (paths: readonly string[]) => {
    return paths.some((p) => location.pathname === p);
  };

  const isLibraryActive = () => isActive(libraryNav.flatMap((n) => n.matchPaths));

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  const closeMenu = () => setIsOpen(false);

  // Classes communes pour un bouton de nav (desktop ou mobile)
  const navButtonClass = (active: boolean, mobile: boolean) =>
    `w-full justify-start md:w-auto touch-target interactive-tap relative ${active ? 'bg-primary/10 text-primary font-semibold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
    } ${mobile ? 'h-12 text-base' : ''}`;

  // Rendu d'un item de nav (bouton direct)
  const renderNavItem = (item: typeof primaryNav[number], mobile: boolean) => {
    const active = isActive(item.matchPaths);
    const Icon = item.icon;
    return (
      <Button
        key={item.to}
        variant="ghost"
        size={mobile ? 'lg' : 'sm'}
        asChild
        onClick={closeMenu}
        className={navButtonClass(active, mobile)}
      >
        <Link to={item.to} className="flex items-center" aria-current={active ? 'page' : undefined}>
          <Icon className={mobile ? 'mr-3 h-5 w-5' : 'mr-2 h-4 w-4'} /> {item.label}
        </Link>
      </Button>
    );
  };

  // Rendu du sous-menu Bibliothèque (dropdown desktop ou items mobile)
  const renderLibraryItems = (mobile: boolean, onItemClick?: () => void) =>
    libraryNav.map((item) => {
      const active = isActive(item.matchPaths);
      const Icon = item.icon;
      if (mobile) {
        return (
          <Button
            key={item.to}
            variant="ghost"
            size="lg"
            asChild
            onClick={() => {
              closeMenu();
              onItemClick?.();
            }}
            className={navButtonClass(active, true)}
          >
            <Link to={item.to} className="flex items-center" aria-current={active ? 'page' : undefined}>
              <Icon className="mr-3 h-5 w-5" /> {item.label}
            </Link>
          </Button>
        );
      }
      return (
        <DropdownMenuItem key={item.to} asChild>
          <Link
            to={item.to}
            className={`flex items-center cursor-pointer ${active ? 'bg-primary/10 text-primary font-semibold' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={onItemClick}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        </DropdownMenuItem>
      );
    });

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="w-full px-2 mx-auto py-3">
        <div className="flex justify-between items-center">
          {/* Logo et titre */}
          <div className="flex items-center space-x-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden touch-target h-11 w-11">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle className="text-left flex items-center gap-2 font-cinzel">
                    <PenTool className="h-5 w-5 text-primary" />
                    Trame
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-1 mt-6">
                  {primaryNav.map((item) => renderNavItem(item, true))}
                  {/* Section Bibliothèque en mobile */}
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <Library className="h-4 w-4" /> Bibliothèque
                    </div>
                    {renderLibraryItems(true)}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <PenTool className="h-6 w-6 text-primary hidden md:block" />
              <Link to="/" className="text-xl font-bold font-cinzel">
                Trame
              </Link>
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {primaryNav.map((item) => renderNavItem(item, false))}

            {/* Menu déroulant Bibliothèque */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`touch-target interactive-tap relative ${isLibraryActive() ? 'bg-primary/10 text-primary font-semibold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}
                >
                  <Library className="mr-2 h-4 w-4" /> Bibliothèque
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Bibliothèque</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {renderLibraryItems(false)}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              className="ml-4 text-muted-foreground bg-white/50 border-glass-border/30 w-48 justify-between"
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            >
              <span className="flex items-center"><Search className="mr-2 h-3.5 w-3.5" /> Rechercher...</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </nav>

          {/* Menu utilisateur */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden touch-target h-10 w-10"
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
              title="Rechercher (⌘K)"
            >
              <Search className="h-5 w-5" />
            </Button>
            <ModeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <User className="mr-1 h-4 w-4" />
                    <span className="max-w-[100px] truncate hidden sm:inline">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Mon profil</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <X className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" onClick={() => navigate('/auth?mode=login')} className="flex items-center">
                <LogIn className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Connexion</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
