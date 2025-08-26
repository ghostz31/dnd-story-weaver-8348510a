import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

// Hook pour détecter la taille d'écran
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return screenSize;
};

// Layout responsive pour les pages principales
export const ResponsiveLayout: React.FC<{
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}> = ({ children, sidebar, header, className }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'mobile';

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Header mobile */}
      {header && isMobile && (
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            {header}
            {sidebar && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <Menu size={20} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Desktop sidebar */}
            {!isMobile && (
              <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
                <div className="p-4">
                  {header && <div className="mb-4">{header}</div>}
                  {sidebar}
                </div>
              </div>
            )}

            {/* Mobile sidebar overlay */}
            {isMobile && isSidebarOpen && (
              <div className="fixed inset-0 z-50 flex">
                <div 
                  className="fixed inset-0 bg-black/50" 
                  onClick={() => setIsSidebarOpen(false)}
                />
                <div className="relative w-64 bg-white shadow-xl">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      {header}
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    {sidebar}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {/* Desktop header */}
          {header && !isMobile && !sidebar && (
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              {header}
            </div>
          )}
          
          <div className="p-4 md:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Grille responsive pour les cartes
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  minItemWidth?: string;
  gap?: string;
  className?: string;
}> = ({ children, minItemWidth = '300px', gap = '1rem', className }) => {
  return (
    <div
      className={cn("grid", className)}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`,
        gap
      }}
    >
      {children}
    </div>
  );
};

// Table responsive avec scroll horizontal sur mobile
export const ResponsiveTable: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-full inline-block align-middle">
        <table className={cn("min-w-full", className)}>
          {children}
        </table>
      </div>
    </div>
  );
};

// Stack responsive (vertical sur mobile, horizontal sur desktop)
export const ResponsiveStack: React.FC<{
  children: React.ReactNode;
  direction?: 'row' | 'column';
  breakpoint?: 'sm' | 'md' | 'lg';
  gap?: string;
  className?: string;
}> = ({ children, direction = 'row', breakpoint = 'md', gap = '1rem', className }) => {
  const breakpointClasses = {
    sm: 'sm:flex-row',
    md: 'md:flex-row',
    lg: 'lg:flex-row'
  };

  return (
    <div
      className={cn(
        "flex flex-col",
        direction === 'row' && breakpointClasses[breakpoint],
        className
      )}
      style={{ gap }}
    >
      {children}
    </div>
  );
};

// Modal responsive
export const ResponsiveModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  fullScreenOnMobile?: boolean;
}> = ({ isOpen, onClose, children, title, fullScreenOnMobile = false }) => {
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'mobile';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      <div
        className={cn(
          "relative bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden",
          isMobile && fullScreenOnMobile
            ? "w-full h-full rounded-none"
            : "w-full max-w-lg"
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        <div className="overflow-auto max-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}; 