"use client";

import { Shield, Zap, Diamond, Crown, Infinity as InfinityIcon, CheckCircle2, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface IdentityBadgesProps {
    tier?: string;
    faction?: string;
    isBlacklist?: boolean;
    isOwner?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function IdentityBadges({ tier = "lobby", faction, isBlacklist = false, isOwner = false, size = "md", className }: IdentityBadgesProps) {
    const iconSize = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5"
    }[size];

    // Tier 1 (Lobby) has no badge, but everyone gets a Verified check if registered
    if (tier === "lobby" && !isBlacklist) {
        return (
            <div className={cn("flex items-center", className)}>
                <CheckCircle2 className={cn(iconSize, "text-secondary-text opacity-40")} />
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            {/* System Architect (Owner Only) */}
            {isOwner && (
                <motion.div 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-brand-cyan drop-shadow-[0_0_8px_#00D4E5]"
                    title="System Architect"
                >
                    <Cpu className={cn(iconSize)} />
                </motion.div>
            )}

            {/* Tier 5: Sovereign (The Crown) */}
            {tier === "sovereign" && (
                <motion.div 
                    animate={{ scale: [1, 1.1, 1], filter: ["drop-shadow(0 0 2px #006096)", "drop-shadow(0 0 8px #00D4E5)", "drop-shadow(0 0 2px #006096)"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-brand-blue"
                >
                    <Crown className={cn(iconSize, "fill-current")} />
                </motion.div>
            )}

            {/* Tier 4: Ultra Elite (The Diamond) */}
            {tier === "ultra_elite" && (
                <div className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">
                    <Diamond className={cn(iconSize, "fill-current")} />
                </div>
            )}

            {/* Special: Blacklist Member (The Infinity Key) */}
            {isBlacklist && (
                <motion.div 
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                >
                    <InfinityIcon className={cn(size === "lg" ? "w-6 h-6" : "w-4 h-4", "stroke-[3px]")} />
                </motion.div>
            )}

            {/* Tier 3: Professional (The Zap) */}
            {tier === "professional" && !isBlacklist && (
                <div className="text-brand-hot-pink drop-shadow-[0_0_5px_#FF53B2]">
                    <Zap className={cn(iconSize, "fill-current")} />
                </div>
            )}

            {/* Tier 2: Shield (The Shield) */}
            {tier === "shield" && (
                <div className="text-brand-cyan drop-shadow-[0_0_5px_#00D4E5]">
                    <Shield className={cn(iconSize, "fill-current")} />
                </div>
            )}

            <CheckCircle2 className={cn(iconSize, "text-brand-cyan opacity-80")} />
        </div>
    );
}
