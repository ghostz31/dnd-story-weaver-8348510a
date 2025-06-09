import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../auth/AuthContext';
import { 
  Home, 
  Users, 
  Book, 
  Sword,
  History, 
  Settings, 
  LogOut, 
  User, 
  ChevronDown,
  LogIn,
  CreditCard,
  PenTool
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
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
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo et titre */}
          <div className="flex items-center space-x-2">
            <PenTool className="h-6 w-6 text-primary" />
            <Link to="/" className="text-xl font-bold font-cinzel">
              Trame
            </Link>
          </div>
          
          {/* Navigation principale */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button 
              variant={isActive('/') ? 'default' : 'ghost'} 
              size="sm" 
              asChild
            >
              <Link to="/" className="flex items-center">
                <Home className="mr-1 h-4 w-4" /> Accueil
              </Link>
            </Button>
            
            <Button 
              variant={isActive('/parties') ? 'default' : 'ghost'} 
              size="sm" 
              asChild
            >
              <Link to="/parties" className="flex items-center">
                <Users className="mr-1 h-4 w-4" /> Groupes
              </Link>
            </Button>
            
            <Button 
              variant={isActive('/monsters') ? 'default' : 'ghost'} 
              size="sm" 
              asChild
            >
              <Link to="/monsters" className="flex items-center">
                <Book className="mr-1 h-4 w-4" /> Bestiaire
              </Link>
            </Button>
            
            <Button 
              variant={isActive('/encounters') || isActive('/custom') ? 'default' : 'ghost'} 
              size="sm" 
              asChild
            >
              <Link to="/encounters" className="flex items-center">
                <PenTool className="mr-1 h-4 w-4" /> Rencontres
              </Link>
            </Button>
            
            <Button 
              variant={isActive('/history') ? 'default' : 'ghost'} 
              size="sm" 
              asChild
            >
              <Link to="/history" className="flex items-center">
                <History className="mr-1 h-4 w-4" /> Historique
              </Link>
            </Button>
          </nav>
          
          {/* Menu utilisateur */}
          <div className="flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <User className="mr-1 h-4 w-4" />
                    <span className="max-w-[100px] truncate">
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
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" onClick={() => navigate('/login')} className="flex items-center">
                <LogIn className="mr-1 h-4 w-4" />
                Connexion
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 