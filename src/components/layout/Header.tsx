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
  CreditCard,
  PenTool,
  Search,
  Scroll,
  Menu,
  X,
  Gem
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  const closeMenu = () => setIsOpen(false);

  const NavItems = () => (
    <>
      <Button
        variant={isActive('/') ? 'default' : 'ghost'}
        size="sm"
        asChild
        onClick={closeMenu}
        className="w-full justify-start md:w-auto"
      >
        <Link to="/" className="flex items-center">
          <Home className="mr-2 h-4 w-4" /> Accueil
        </Link>
      </Button>

      <Button
        variant={isActive('/parties') ? 'default' : 'ghost'}
        size="sm"
        asChild
        onClick={closeMenu}
        className="w-full justify-start md:w-auto"
      >
        <Link to="/parties" className="flex items-center">
          <Users className="mr-2 h-4 w-4" /> Groupes
        </Link>
      </Button>

      <Button
        variant={isActive('/monsters') ? 'default' : 'ghost'}
        size="sm"
        asChild
        onClick={closeMenu}
        className="w-full justify-start md:w-auto"
      >
        <Link to="/monsters" className="flex items-center">
          <Book className="mr-2 h-4 w-4" /> Bestiaire
        </Link>
      </Button>

      <Button
        variant={isActive('/grimoire') ? 'default' : 'ghost'}
        size="sm"
        asChild
        onClick={closeMenu}
        className="w-full justify-start md:w-auto"
      >
        <Link to="/grimoire" className="flex items-center">
          <Scroll className="mr-2 h-4 w-4" /> Grimoire
        </Link>
      </Button>

      <Button
        variant={isActive('/items') ? 'default' : 'ghost'}
        size="sm"
        asChild
        onClick={closeMenu}
        className="w-full justify-start md:w-auto"
      >
        <Link to="/items" className="flex items-center">
          <Gem className="mr-2 h-4 w-4" /> Objets
        </Link>
      </Button>

      <Button
        variant={isActive('/encounters') || isActive('/custom') ? 'default' : 'ghost'}
        size="sm"
        asChild
        onClick={closeMenu}
        className="w-full justify-start md:w-auto"
      >
        <Link to="/encounters" className="flex items-center">
          <PenTool className="mr-2 h-4 w-4" /> Rencontres
        </Link>
      </Button>

      <Button
        variant={isActive('/history') ? 'default' : 'ghost'}
        size="sm"
        asChild
        onClick={closeMenu}
        className="w-full justify-start md:w-auto"
      >
        <Link to="/history" className="flex items-center">
          <History className="mr-2 h-4 w-4" /> Historique
        </Link>
      </Button>
    </>
  );

  return (
    <header className="glass-panel sticky top-0 z-50 border-b-0">
      <div className="w-full max-w-[1920px] mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo et titre */}
          <div className="flex items-center space-x-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
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
                <div className="flex flex-col gap-2 mt-6">
                  <NavItems />
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
            <NavItems />
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
                  <DropdownMenuItem onClick={() => navigate('/subscription')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Abonnement Premium</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <X className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" onClick={() => navigate('/login')} className="flex items-center">
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
