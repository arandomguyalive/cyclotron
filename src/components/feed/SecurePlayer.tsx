"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@/lib/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { EyeOff, Lock } from "lucide-react";

export function SecurePlayer({ src, securityLevel = 'none' }: { src: string, securityLevel?: 'none' | 'blacklist' | 'tier3' }) {
        const { user, firebaseUser } = useUser();
        const videoRef = useRef<HTMLVideoElement>(null);
        const [isLocked, setIsLocked] = useState(true); // Start locked for hold-to-view
        const [isPressing, setIsPressing] = useState(false);
        
        // Security Features Active for Tier 3 (Gold) and above
        const isBlacklist = securityLevel === 'blacklist' || ['gold', 'platinum', 'sovereign', 'lifetime'].includes(user?.tier || 'free');
        const isHoldToViewActive = isBlacklist; // Activate hold-to-view for blacklist content
        const viewerIdentifier = firebaseUser?.email || firebaseUser?.uid || 'UNAUTHORIZED_VIEWER';
    
        // Platinum Feature: Biometric Lock Simulation
        const isPlatinum = ['platinum', 'ultimate'].includes(user?.tier || 'free');
    
        useEffect(() => {
            if (!isHoldToViewActive && isLocked) { // Only unlock if it's currently locked
                // If hold-to-view is not active, behave normally (not locked initially)
                // eslint-disable-next-line react-hooks/exhaustive-deps
                setIsLocked(false);
            }
        }, [isHoldToViewActive, isLocked]); // Added isLocked to deps
    
        const handlePress = () => {
            if (isHoldToViewActive) {
                setIsPressing(true);
                setIsLocked(false); // Unlock to play
                videoRef.current?.play();
            }
        };
    
        const handleRelease = () => {
            if (isHoldToViewActive) {
                setIsPressing(false);
                setIsLocked(true); // Relock on release
                videoRef.current?.pause();
            }
        };

    useEffect(() => {
        if (!isPlatinum || isHoldToViewActive) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsLocked(true);
                videoRef.current?.pause();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isPlatinum, isHoldToViewActive, isLocked]);

    const handleMouseLeave = () => {
        if (isPlatinum && !isHoldToViewActive) {
            setIsLocked(true);
            videoRef.current?.pause();
        }
    };

    const handleMouseEnter = () => {
        if (isPlatinum && isLocked && !isHoldToViewActive) {
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
            onMouseDown={handlePress}
            onMouseUp={handleRelease}
            onTouchStart={handlePress}
            onTouchEnd={handleRelease}
            onTouchCancel={handleRelease} // Handle cases where touch is interrupted
        >
            <video 
                ref={videoRef}
                src={src} 
                className={`w-full h-full object-cover transition-opacity duration-500 ${isLocked ? 'opacity-20 blur-md' : 'opacity-80'}`}
                autoPlay={!isHoldToViewActive} // Only autoPlay if hold-to-view is not active
                muted 
                loop 
                playsInline
                // No controls attribute = Hidden native controls
            />

            {isHoldToViewActive && isLocked && (
                <div 
                    className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300"
                >
                    <div className="p-4 rounded-full bg-brand-orange/20 border border-brand-orange/50 mb-4 animate-pulse">
                        <Lock className="w-12 h-12 text-brand-orange" />
                    </div>
                    <h3 className="text-2xl font-bold text-brand-orange tracking-widest uppercase">SOVEREIGN LOCK</h3>
                    <p className="text-xs text-brand-orange font-mono mt-2">HOLD TO VIEW</p>
                    <div className="mt-8 px-6 py-3 bg-white/10 rounded-full text-sm font-bold tracking-wider opacity-70">
                        <span className="sr-only">Hold to view content</span>
                    </div>
                </div>
            )}

            {isBlacklist && (
                <div 
                    className="absolute inset-0 flex flex-wrap content-around justify-around pointer-events-none opacity-10 font-mono text-white text-xs z-40"
                    style={{
                        transform: 'rotate(-30deg) scale(1.5)',
                        overflow: 'hidden',
                    }}
                >
                    {Array(20).fill(0).map((_, i) => (
                        <span key={i} className="mx-4 my-2 whitespace-nowrap">{viewerIdentifier}</span>
                    ))}
                </div>
            )}
            <AnimatePresence>
                {isLocked && !isHoldToViewActive && (
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
