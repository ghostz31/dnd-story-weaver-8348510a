import { useState, useEffect, useCallback } from 'react';

interface ViewportState {
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    orientation: 'portrait' | 'landscape';
    safeAreaInsets: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}

const BREAKPOINTS = {
    mobile: 768,
    tablet: 1024,
};

/**
 * Hook for responsive viewport detection and safe area management.
 * Automatically sets --vh CSS variable for Android 100vh fix.
 */
export function useViewport(): ViewportState {
    const getViewport = useCallback((): ViewportState => {
        if (typeof window === 'undefined') {
            return {
                width: 0,
                height: 0,
                isMobile: false,
                isTablet: false,
                isDesktop: true,
                orientation: 'portrait',
                safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
            };
        }

        const width = window.innerWidth;
        const height = window.innerHeight;

        return {
            width,
            height,
            isMobile: width < BREAKPOINTS.mobile,
            isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
            isDesktop: width >= BREAKPOINTS.tablet,
            orientation: width > height ? 'landscape' : 'portrait',
            safeAreaInsets: getSafeAreaInsets(),
        };
    }, []);

    const [viewport, setViewport] = useState<ViewportState>(getViewport);

    useEffect(() => {
        // Set initial viewport height for Android 100vh fix
        const setVh = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        const handleResize = () => {
            setVh();
            setViewport(getViewport());
        };

        // Set initial values
        setVh();
        handleResize();

        // Listen for resize and orientation change
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        // Also listen for visual viewport changes (keyboard, etc.)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
            }
        };
    }, [getViewport]);

    return viewport;
}

/**
 * Get CSS env() safe area insets as numbers
 */
function getSafeAreaInsets() {
    if (typeof window === 'undefined') {
        return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    const computedStyle = getComputedStyle(document.documentElement);

    const parseInset = (property: string): number => {
        const value = computedStyle.getPropertyValue(property);
        return parseInt(value, 10) || 0;
    };

    return {
        top: parseInset('env(safe-area-inset-top)'),
        right: parseInset('env(safe-area-inset-right)'),
        bottom: parseInset('env(safe-area-inset-bottom)'),
        left: parseInset('env(safe-area-inset-left)'),
    };
}

/**
 * Hook for detecting touch device
 */
export function useTouchDevice(): boolean {
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        setIsTouch(
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0
        );
    }, []);

    return isTouch;
}

/**
 * Hook for media query matching
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);

        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
        media.addEventListener('change', listener);

        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
}

/**
 * Convenience hook for common breakpoint checks
 */
export function useBreakpoint() {
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

    return {
        isMobile,
        isTablet,
        isDesktop,
        prefersReducedMotion,
    };
}
