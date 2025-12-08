"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useUser } from "@/lib/UserContext";
import { Radio, Lock, Volume2 } from "lucide-react";
import { useSonic } from "@/lib/SonicContext";

const CHANNELS = ["PUBLIC", "LOCAL", "VOID", "NEON", "DEEP"];

export function FrequencyTuner() {
    const { user } = useUser();
    const { playClick, playHum } = useSonic();
    const [activeChannel, setActiveChannel] = useState(0);
    const x = useMotionValue(0);
    
    const isFree = user?.tier === 'free';
    const width = 300; // Mock width of container
    
    // Calculate which channel is active based on X position
    const handleDrag = (event: any, info: PanInfo) => {
        if (isFree) return; // Locked for free users

        const newX = x.get();
        // Simple snapping logic
        const index = Math.min(Math.max(Math.round(-newX / 60), 0), CHANNELS.length - 1);
        
        if (index !== activeChannel) {
            setActiveChannel(index);
            playClick(200 + index * 50, 0.05, 'sine');
            if (navigator.vibrate) navigator.vibrate(20);
        }
    };

    const handleDragEnd = () => {
        if (isFree) {
            // Snap back
            x.set(0);
            playClick(100, 0.1, 'sawtooth');
            return;
        }
        
        // Snap to center of nearest channel
        const snapX = -activeChannel * 60;
        x.set(snapX);
    };

    return (
        <div className={`p-4 rounded-3xl border relative overflow-hidden ${isFree ? 'bg-secondary-bg/20 border-border-color' : 'bg-secondary-bg/50 border-accent-1/20'}`}>
            
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Radio className={`w-4 h-4 ${isFree ? 'text-secondary-text' : 'text-accent-1'}`} />
                    <span className="text-xs font-bold tracking-wider uppercase text-secondary-text">Frequency Tuner</span>
                </div>
                <div className="flex items-center gap-2">
                    {isFree && <Lock className="w-3 h-3 text-red-500" />}
                    <span className={`font-mono text-xs font-bold ${isFree ? 'text-red-500' : 'text-accent-1'}`}>
                        {isFree ? "LOCKED" : `${104.5 + activeChannel * 2.5} MHz`}
                    </span>
                </div>
            </div>

            {/* The Tuner Window */}
            <div className="relative h-12 bg-black/40 rounded-xl overflow-hidden flex items-center cursor-grab active:cursor-grabbing">
                
                {/* Center Line Indicator */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-500 z-20 shadow-[0_0_10px_red]" />
                
                {/* Draggable Scale */}
                <motion.div 
                    className="flex items-center pl-[50%]"
                    drag="x"
                    dragConstraints={{ left: -200, right: 0 }}
                    style={{ x }}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                >
                    {CHANNELS.map((channel, i) => (
                        <div key={channel} className="w-[60px] flex flex-col items-center justify-center shrink-0 opacity-50 data-[active=true]:opacity-100 transition-opacity" data-active={i === activeChannel}>
                            <div className="h-4 w-0.5 bg-secondary-text mb-2" />
                            <span className="text-[10px] font-mono tracking-widest">{channel}</span>
                        </div>
                    ))}
                    {/* Extra spacing at end */}
                    <div className="w-[50%]" />
                </motion.div>

                {/* Static Noise Overlay for Free Users */}
                {isFree && (
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                )}
            </div>

            {isFree ? (
                 <p className="mt-2 text-[10px] text-red-400 font-mono text-center">
                     Bandwidth Restricted. Locked to Public Channel.
                 </p>
            ) : (
                 <p className="mt-2 text-[10px] text-accent-1/70 font-mono text-center">
                     Listening to: {CHANNELS[activeChannel]} STREAM
                 </p>
            )}
        </div>
    );
}
