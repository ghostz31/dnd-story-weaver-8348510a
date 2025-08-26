import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  variant?: 'default' | 'primary' | 'secondary';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const variantClasses = {
  default: 'border-gray-300 border-t-gray-600',
  primary: 'border-blue-200 border-t-blue-600',
  secondary: 'border-gray-200 border-t-gray-500'
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
  variant = 'default'
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2",
          sizeClasses[size],
          variantClasses[variant]
        )}
        role="status"
        aria-label="Chargement"
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Composants de chargement spécialisés
export const PageLoader: React.FC<{ text?: string }> = ({ text = "Chargement de la page..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="xl" variant="primary" text={text} />
  </div>
);

export const SectionLoader: React.FC<{ text?: string }> = ({ text = "Chargement..." }) => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner size="lg" variant="primary" text={text} />
  </div>
);

export const ButtonLoader: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center">
    <LoadingSpinner size="sm" className="mr-2" />
    {text && <span>{text}</span>}
  </div>
);

export const TableLoader: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="animate-pulse">
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 py-3 border-b">
        {Array.from({ length: columns }, (_, colIndex) => (
          <div
            key={colIndex}
            className="h-4 bg-gray-200 rounded flex-1"
          />
        ))}
      </div>
    ))}
  </div>
);

export const CardLoader: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("animate-pulse bg-white rounded-lg shadow-md p-4", className)}>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="h-3 bg-gray-200 rounded w-4/6" />
    </div>
  </div>
);

export const ListLoader: React.FC<{ items?: number; className?: string }> = ({ 
  items = 3, 
  className 
}) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: items }, (_, index) => (
      <div key={index} className="animate-pulse flex items-center space-x-4">
        <div className="rounded-full bg-gray-200 h-10 w-10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSpinner; 