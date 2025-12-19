import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, useMotionValue, useAnimation, PanInfo, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';

interface FloatingGrimoireBubbleProps {
    onOpen: () => void;
}

// Particle Physics Constants
const GRAVITY = 0.15;
const DRAG = 0.96; // Air resistance
const JITTER = 0.5; // Random movement intensity
const FADE_RATE = 0.015;
const EMISSION_RATE = 2; // Particles per frame when moving
const BURST_COUNT = 60; // Particles on snap impact

class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;

    constructor(x: number, y: number, hue: number, burst = false) {
        this.x = x;
        this.y = y;
        this.life = 1.0;
        this.size = Math.random() * 3 + 2; // 2-5px size
        this.color = `hsl(${hue}, 100%, 70%)`;

        if (burst) {
            // Explosive velocity for bursts
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        } else {
            // Trail velocity: mostly stationary with slight drift + jitter
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
        }
    }

    update() {
        // Physics
        this.vx += (Math.random() - 0.5) * JITTER;
        this.vy += (Math.random() - 0.5) * JITTER;
        this.vy += GRAVITY;
        this.vx *= DRAG;
        this.vy *= DRAG;

        this.x += this.vx;
        this.y += this.vy;
        this.life -= FADE_RATE;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

const FloatingGrimoireBubble: React.FC<FloatingGrimoireBubbleProps> = ({ onOpen }) => {
    const controls = useAnimation();
    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Canvas Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>();
    const particlesRef = useRef<Particle[]>([]);
    const hueRef = useRef(0);

    // Initialize directly at target (Bottom-Right)
    const initialX = typeof window !== 'undefined' ? window.innerWidth - 80 : 0;
    const initialY = typeof window !== 'undefined' ? window.innerHeight - 150 : 0;

    const x = useMotionValue(initialX);
    const y = useMotionValue(initialY);

    // Track previous position to calculate velocity/movement
    const lastPos = useRef({ x: initialX, y: initialY });

    // --- Particle System Loop ---
    const loop = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update Hue Cycle
        hueRef.current = (hueRef.current + 2) % 360;

        // Emit particles if moving
        const currentX = x.get();
        const currentY = y.get();
        const dx = currentX - lastPos.current.x;
        const dy = currentY - lastPos.current.y;
        const speed = Math.sqrt(dx * dx + dy * dy);

        // Emit based on speed (more speed = more particles)
        // Only emit if moving appreciably
        if (speed > 1 || isDragging) {
            // Center of the bubble (assuming 56px width/height -> radius 28)
            const centerX = currentX + 28;
            const centerY = currentY + 28;

            for (let i = 0; i < EMISSION_RATE; i++) {
                particlesRef.current.push(new Particle(centerX, centerY, hueRef.current));
            }
        }

        lastPos.current = { x: currentX, y: currentY };

        // Update and Draw Particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            p.update();
            p.draw(ctx);
            if (p.life <= 0) {
                particlesRef.current.splice(i, 1);
            }
        }

        animationFrameRef.current = requestAnimationFrame(loop);
    }, [x, y, isDragging]);

    useEffect(() => {
        // Start Loop
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        loop();

        // Handle Resize
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, [loop]);

    // Trigger Burst on Impact
    const triggerImpactBurst = (impactX: number, impactY: number) => {
        // Spawn burst particles
        for (let i = 0; i < BURST_COUNT; i++) {
            particlesRef.current.push(new Particle(impactX + 28, impactY + 28, Math.random() * 360, true));
        }
    };

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = (_: any, info: PanInfo) => {
        setIsDragging(false);

        // Snap Logic
        const windowWidth = window.innerWidth;
        const currentX = x.get(); // Get real-time value
        const MARGIN = 16;
        const BUBBLE_WIDTH = 56;

        // Threshold to snap left or right
        const targetX = currentX < windowWidth / 2 ? MARGIN : windowWidth - BUBBLE_WIDTH - MARGIN;
        const targetY = Math.max(50, Math.min(window.innerHeight - 80, y.get()));

        // Animate snap
        controls.start({
            x: targetX,
            y: targetY,
            transition: { type: "spring", stiffness: 300, damping: 20 }
        }).then(() => {
            // Trigger burst when snap finishes (roughly) or starts? 
            // User asked for burst on impact. The animation finishes AT impact.
            triggerImpactBurst(targetX, targetY);
        });
    };

    return ReactDOM.createPortal(
        <>
            {/* Canvas Layer - Fullscreen, minimal z-index relative to bubble */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 pointer-events-none z-[9998]"
            />

            {/* The Bubble */}
            <motion.div
                drag
                dragMomentum={false}
                dragElastic={0.1}
                animate={controls}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                onClick={() => {
                    if (!isDragging) onOpen();
                }}
                // Anchor to top-left 0,0 so transforms work from absolute coordinates
                style={{ x, y, left: 0, top: 0 }}
                className="fixed z-[9999] cursor-grab active:cursor-grabbing"
            >
                <motion.div
                    animate={{
                        scale: isHovered || isDragging ? 1.1 : 1,
                        opacity: isDragging ? 1 : (isHovered ? 1 : 0.6), // 0.6 opacity at idle
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg border-2 border-white/20 text-white backdrop-blur-sm"
                >
                    <BookOpen className="w-6 h-6" />
                </motion.div>

                {/* Tooltip */}
                <AnimatePresence>
                    {isHovered && !isDragging && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap"
                        >
                            Grimoire
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>,
        document.body
    );
};

export default FloatingGrimoireBubble;
