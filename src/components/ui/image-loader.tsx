import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Image as ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  placeholder?: React.ReactNode;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = '/images/placeholders/unknown.jpg',
  className,
  width,
  height,
  lazy = true,
  placeholder
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer pour le lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, isInView]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const defaultPlaceholder = (
    <div 
      className={cn(
        "flex items-center justify-center bg-gray-200 text-gray-500",
        className
      )}
      style={{ width, height }}
    >
      <ImageIcon size={width && width < 50 ? 16 : 24} />
    </div>
  );

  // Afficher le placeholder si on n'a pas encore chargé l'image
  if (!isInView || (isLoading && !hasError)) {
    return placeholder || defaultPlaceholder;
  }

  // Afficher l'image d'erreur si le chargement a échoué
  if (hasError) {
    return (
      <img
        ref={imgRef}
        src={fallbackSrc}
        alt={alt}
        className={cn("object-cover", className)}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={() => {
          // Si même l'image de fallback échoue, afficher le placeholder
          return defaultPlaceholder;
        }}
      />
    );
  }

  // Afficher l'image normale
  return (
    <img
      ref={imgRef}
      src={isInView ? src : ''}
      alt={alt}
      className={cn("object-cover", className)}
      width={width}
      height={height}
      onLoad={handleLoad}
      onError={handleError}
      loading={lazy ? "lazy" : "eager"}
    />
  );
};

// Composant spécialisé pour les images de monstres
export const MonsterImage: React.FC<{
  monster: { name: string; image?: string };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ monster, size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const imageSrc = monster.image 
    ? `/data/aidedd-complete/images/${monster.image}`
    : '';

  return (
    <div className={cn("rounded-full overflow-hidden bg-gray-200", sizeClasses[size], className)}>
      <OptimizedImage
        src={imageSrc}
        alt={monster.name}
        fallbackSrc="/images/monsters/unknown.jpg"
        className="h-full w-full"
        lazy={true}
      />
    </div>
  );
};

export default OptimizedImage; 