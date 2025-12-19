import { useCallback, useRef } from 'react';

// Types d'effets sonores disponibles
type SoundEffect = 'turnStart' | 'bloodied' | 'crit' | 'click' | 'success' | 'warning';

export const useAudioSystem = () => {
    // Référence au contexte audio (créé paresseusement)
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialiser le contexte audio (doit être fait suite à une interaction utilisateur)
    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                audioContextRef.current = new AudioContext();
            }
        }

        // Résoudre l'état suspendu si nécessaire
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }

        return audioContextRef.current;
    }, []);

    // Fonction générique pour jouer un son synthétisé
    const playTone = useCallback((frequency: number, type: OscillatorType, duration: number, volume: number = 0.1) => {
        const ctx = initAudioContext();
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + duration);
    }, [initAudioContext]);

    // Jouer un effet spécifique
    const playSound = useCallback((effect: SoundEffect) => {
        const ctx = initAudioContext();
        if (!ctx) return;

        switch (effect) {
            case 'turnStart':
                // "Ding" doux
                playTone(523.25, 'sine', 0.5, 0.1); // Do (C5)
                setTimeout(() => playTone(659.25, 'sine', 0.8, 0.08), 100); // Mi (E5)
                break;

            case 'bloodied':
                // Son grave "Doom"
                playTone(100, 'sawtooth', 0.8, 0.15);
                break;

            case 'crit':
                // Fanfare rapide
                playTone(880, 'square', 0.1, 0.1);
                setTimeout(() => playTone(1108, 'square', 0.1, 0.1), 100);
                setTimeout(() => playTone(1318, 'square', 0.4, 0.1), 200);
                break;

            case 'click':
                // Clic mécanique
                playTone(1200, 'triangle', 0.05, 0.05);
                break;

            case 'success':
                // Accord majeur
                playTone(440, 'sine', 0.3, 0.1);
                setTimeout(() => playTone(554, 'sine', 0.3, 0.1), 50);
                setTimeout(() => playTone(659, 'sine', 0.3, 0.1), 100);
                break;

            case 'warning':
                // Double bip
                playTone(200, 'sawtooth', 0.2, 0.1);
                setTimeout(() => playTone(200, 'sawtooth', 0.2, 0.1), 250);
                break;
        }
    }, [initAudioContext, playTone]);

    return { playSound };
};
