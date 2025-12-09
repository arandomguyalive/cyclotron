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
    const ALLOWED_FREE = [0, 3]; // PUBLIC, NEON

    // Calculate which channel is active based on X position
    const handleDrag = (event: any, info: PanInfo) => {
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
        if (isFree && !ALLOWED_FREE.includes(activeChannel)) {
            // Snap to nearest allowed
            const nearest = ALLOWED_FREE.reduce((prev, curr) => 
                Math.abs(curr - activeChannel) < Math.abs(prev - activeChannel) ? curr : prev
            );
            setActiveChannel(nearest);
            x.set(-nearest * 60);
            playClick(150, 0.1, 'sawtooth'); // Denied sound
            return;
        }
        
        // Snap to center of nearest channel
        const snapX = -activeChannel * 60;
        x.set(snapX);
    };

    return (
        <div className={`p-4 rounded-3xl border relative overflow-hidden ${isFree ? 'bg-secondary-bg/20 border-border-color' : 'bg-secondary-bg/50 border-accent-1/20'}`}>
            
            <div className="flex items-center justify-end mb-2">
                <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-bold ${isFree ? 'text-secondary-text' : 'text-accent-1'}`}>
                        {isFree && !ALLOWED_FREE.includes(activeChannel) ? "LOCKED" : `${104.5 + activeChannel * 2.5} FM`}
                    </span>
                </div>
            </div>

            {/* The Tuner Window */}
            <div className="relative h-12 bg-black/40 rounded-xl overflow-hidden flex items-center cursor-grab active:cursor-grabbing">
                
                {/* Center Line Indicator */}
                <div className={`absolute left-1/2 top-0 bottom-0 w-0.5 z-20 shadow-[0_0_10px] ${isFree ? 'bg-white shadow-white/50' : 'bg-red-500 shadow-red-500'}`} />
                
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
                            {isFree && !ALLOWED_FREE.includes(i) && <Lock className="w-3 h-3 text-secondary-text mt-1 opacity-50" />}
                        </div>
                    ))}
                    {/* Extra spacing at end */}
                    <div className="w-[50%]" />
                </motion.div>
            </div>

            {isFree ? (
                 <p className="mt-2 text-[10px] text-secondary-text font-mono text-center">
                     Explore Public & Neon. Upgrade for Deep/Void.
                 </p>
            ) : (
                 <p className="mt-2 text-[10px] text-accent-1/70 font-mono text-center">
                     Listening to: {CHANNELS[activeChannel]} STREAM
                 </p>
            )}
        </div>
    );
}
