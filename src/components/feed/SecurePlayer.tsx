"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@/lib/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { EyeOff, Lock } from "lucide-react";

export function SecurePlayer({ src }: { src: string }) {
    const { user } = useUser();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLocked, setIsLocked] = useState(false);
    
    // Platinum Feature: Biometric Lock Simulation
    const isPlatinum = ['platinum', 'ultimate'].includes(user?.tier || 'free');

    useEffect(() => {
        if (!isPlatinum) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsLocked(true);
                videoRef.current?.pause();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isPlatinum]);

    const handleMouseLeave = () => {
        if (isPlatinum) {
            setIsLocked(true);
            videoRef.current?.pause();
        }
    };

    const handleMouseEnter = () => {
        if (isPlatinum && isLocked) {
            // Auto-resume if user comes back
            setIsLocked(false);
            videoRef.current?.play();
        }
    };

    return (
        <div 
            className="relative w-full h-full bg-black overflow-hidden group"
            onContextMenu={(e) => e.preventDefault()} // Disable Right Click
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
        >
            <video 
                ref={videoRef}
                src={src} 
                className={`w-full h-full object-cover transition-opacity duration-500 ${isLocked ? 'opacity-20 blur-md' : 'opacity-80'}`}
                autoPlay 
                muted 
                loop 
                playsInline
                // No controls attribute = Hidden native controls
            />

            <AnimatePresence>
                {isLocked && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none"
                    >
                        <div className="p-4 rounded-full bg-red-500/20 border border-red-500/50 mb-4 animate-pulse">
                            <EyeOff className="w-12 h-12 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-red-500 tracking-widest uppercase">Focus Lost</h3>
                        <p className="text-xs text-red-400 font-mono mt-2">KM18 Biometric Lock Active</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
