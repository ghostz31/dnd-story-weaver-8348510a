import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Sword, Heart, Dice6, Users, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'combat' | 'healing' | 'dice' | 'party' | 'save';

export interface EnhancedToastProps {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
  combat: Sword,
  healing: Heart,
  dice: Dice6,
  party: Users,
  save: Save,
};

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  combat: 'bg-red-50 border-red-300 text-red-900',
  healing: 'bg-green-50 border-green-300 text-green-900',
  dice: 'bg-purple-50 border-purple-300 text-purple-900',
  party: 'bg-blue-50 border-blue-300 text-blue-900',
  save: 'bg-gray-50 border-gray-300 text-gray-900',
};

const toastIconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-yellow-500',
  combat: 'text-red-600',
  healing: 'text-green-600',
  dice: 'text-purple-600',
  party: 'text-blue-600',
  save: 'text-gray-600',
};

export const EnhancedToast: React.FC<EnhancedToastProps> = ({
  id,
  type,
  title,
  description,
  duration = 5000,
  action,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const Icon = toastIcons[type];

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => setIsVisible(true), 50);

    // Auto-fermeture
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-300 transform',
        toastStyles[type],
        isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95',
        isLeaving && '-translate-x-full opacity-0 scale-95'
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn('h-6 w-6', toastIconStyles[type])} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">{title}</p>
            {description && (
              <p className="mt-1 text-sm opacity-90">{description}</p>
            )}
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className="text-sm font-medium underline hover:no-underline focus:outline-none"
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Container pour les toasts
export const ToastContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-sm">
      {children}
    </div>
  );
};

// Hook pour utiliser les toasts améliorés
export const useEnhancedToast = () => {
  const [toasts, setToasts] = useState<EnhancedToastProps[]>([]);

  const addToast = (toast: Omit<EnhancedToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: EnhancedToastProps = {
      ...toast,
      id,
      onClose: removeToast,
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Méthodes de convenance
  const toast = {
    success: (title: string, description?: string, action?: EnhancedToastProps['action']) =>
      addToast({ type: 'success', title, description, action }),
    
    error: (title: string, description?: string, action?: EnhancedToastProps['action']) =>
      addToast({ type: 'error', title, description, action }),
    
    info: (title: string, description?: string, action?: EnhancedToastProps['action']) =>
      addToast({ type: 'info', title, description, action }),
    
    warning: (title: string, description?: string, action?: EnhancedToastProps['action']) =>
      addToast({ type: 'warning', title, description, action }),
    
    combat: (title: string, description?: string, action?: EnhancedToastProps['action']) =>
      addToast({ type: 'combat', title, description, action }),
    
    healing: (title: string, description?: string, action?: EnhancedToastProps['action']) =>
      addToast({ type: 'healing', title, description, action }),
    
    dice: (title: string, description?: string, action?: EnhancedToastProps['action']) =>
      addToast({ type: 'dice', title, description, action }),
    
    party: (title: string, description?: string, action?: EnhancedToastProps['action']) =>
      addToast({ type: 'party', title, description, action }),
    
    save: (title: string, description?: string, action?: EnhancedToastProps['action']) =>
      addToast({ type: 'save', title, description, action }),
  };

  const ToastProvider = () => (
    <ToastContainer>
      {toasts.map(toast => (
        <EnhancedToast key={toast.id} {...toast} />
      ))}
    </ToastContainer>
  );

  return { toast, ToastProvider };
}; 