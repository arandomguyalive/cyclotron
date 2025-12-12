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
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                <div className="p-4 rounded-full bg-brand-orange/20 border border-brand-orange/50 mb-4 animate-pulse">
                    <EyeOff className="w-12 h-12 text-brand-orange" />
                </div>
                <h3 className="text-2xl font-bold text-brand-orange tracking-widest uppercase">Focus Lost</h3>
                <p className="text-xs text-brand-orange font-mono mt-2">KM18 Biometric Lock Active</p>
                <button 
                    onClick={() => {
                        // In a real app, this would require re-authentication
                        setIsLocked(false);
                        if (videoRef.current) videoRef.current.play();
                    }}
                    className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-sm font-bold tracking-wider transition-colors"
                >
                    RESUME SESSION
                </button>
            </div>
                )}
            </AnimatePresence>
        </div>
    );
}
