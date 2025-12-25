"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/lib/UserContext";
import { Globe, Users, Lock, Sparkles, Radio } from "lucide-react";
import { useSonic } from "@/lib/SonicContext";

const CHANNELS = [
    { id: "public", label: "Global", icon: Globe },
    { id: "friends", label: "Friends", icon: Users },
    { id: "exclusive", label: "Exclusive", icon: Sparkles },
    { id: "local", label: "Local", icon: Radio },
];

export function FrequencyTuner() {
    const { user } = useUser();
    const { playClick } = useSonic();
    const [activeTab, setActiveTab] = useState("public");
    
    const isFree = user?.tier === 'lobby';
    
    // Logic: Lobby users can only access 'Global' and 'Friends' (mock logic)
    // Actually, let's lock 'Exclusive' and 'Local'.
    const LOCKED_TABS = ["exclusive", "local"];

    const handleTabClick = (tabId: string) => {
        if (LOCKED_TABS.includes(tabId) && isFree && !user?.isOwner) {
            playClick(150, 0.2, 'sawtooth');
            return;
        }
        
        setActiveTab(tabId);
        playClick(400, 0.05, 'sine'); // Success
    };

    return (
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 p-1 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 w-max mx-auto">
                {CHANNELS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const isLocked = isFree && LOCKED_TABS.includes(tab.id);
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`relative px-4 py-2 rounded-full flex items-center gap-2 text-xs font-medium transition-all ${
                                isActive 
                                    ? "text-primary-bg" 
                                    : isLocked 
                                        ? "text-white/30 cursor-not-allowed" 
                                        : "text-white/70 hover:text-white"
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            
                            <span className="relative z-10 flex items-center gap-2">
                                <Icon className="w-3 h-3" />
                                {tab.label}
                                {isLocked && <Lock className="w-2 h-2 opacity-50" />}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}