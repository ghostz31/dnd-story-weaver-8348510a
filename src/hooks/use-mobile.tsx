import { useState, useEffect } from 'react';
import { useScreenSize } from '@/components/ui/responsive-layout';

export const useMobile = () => {
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'mobile';
  const isTablet = screenSize === 'tablet';
  const isDesktop = screenSize === 'desktop';
  
  const [touchSupport, setTouchSupport] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  useEffect(() => {
    // Détecter le support tactile
    setTouchSupport('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    // Détecter l'orientation
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    
    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);
  
  // Classes CSS utilitaires pour mobile
  const mobileClasses = {
    container: isMobile ? "px-4 py-2" : "px-6 py-4",
    spacing: isMobile ? "space-y-2" : "space-y-4",
    padding: isMobile ? "p-3" : "p-4",
    text: {
      sm: isMobile ? "text-xs" : "text-sm",
      base: isMobile ? "text-sm" : "text-base",
      lg: isMobile ? "text-base" : "text-lg",
      xl: isMobile ? "text-lg" : "text-xl"
    },
    button: {
      sm: isMobile ? "h-7 px-2 text-xs" : "h-8 px-3 text-sm",
      md: isMobile ? "h-8 px-3 text-sm" : "h-9 px-4 text-sm",
      lg: isMobile ? "h-9 px-4 text-sm" : "h-10 px-6 text-base"
    },
    icon: {
      sm: isMobile ? "h-3 w-3" : "h-4 w-4",
      md: isMobile ? "h-4 w-4" : "h-5 w-5",
      lg: isMobile ? "h-5 w-5" : "h-6 w-6"
    },
    grid: {
      auto: isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      two: isMobile ? "grid-cols-1" : "grid-cols-2",
      three: isMobile ? "grid-cols-1" : "grid-cols-3",
      four: isMobile ? "grid-cols-2" : "grid-cols-4"
    }
  };
  
  // Fonctions utilitaires
  const getResponsiveValue = <T,>(mobileValue: T, desktopValue: T): T => {
    return isMobile ? mobileValue : desktopValue;
  };
  
  const shouldUseFullScreen = () => isMobile && orientation === 'portrait';
  
  const getTouchFeedback = () => touchSupport && isMobile ? "active:scale-95 transition-transform" : "";
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    touchSupport,
    orientation,
    classes: mobileClasses,
    getResponsiveValue,
    shouldUseFullScreen,
    getTouchFeedback
  };
};
