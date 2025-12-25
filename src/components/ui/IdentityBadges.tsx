"use client";

import { ShieldCheck, Star, Zap, Terminal, Briefcase, Truck, Ghost, Diamond } from "lucide-react";
import { cn } from "@/lib/utils";

interface IdentityBadgesProps {
    tier?: string;
    faction?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function IdentityBadges({ tier = "free", faction, size = "md", className }: IdentityBadgesProps) {
    const iconSize = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5"
    }[size];

    const factionIcons: Record<string, any> = {
        Netrunner: Terminal,
        Corp: Briefcase,
        Drifter: Truck,
        Ghost: Ghost
    };

    const FactionIcon = faction ? factionIcons[faction] : null;

    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            {/* 1. Verified Operative (All Registered) */}
            <div title="Verified Operative" className="text-brand-cyan drop-shadow-[0_0_5px_rgba(0,212,229,0.5)]">
                <ShieldCheck className={iconSize} />
            </div>

            {/* 2. Network Founder (Lifetime) */}
            {tier === "lifetime" && (
                <div title="Network Founder" className="text-amber-500 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
                    <Star className={cn(iconSize, "fill-current")} />
                </div>
            )}

            {/* 3. High Clearance (Platinum/Sovereign) */}
            {(tier === "platinum" || tier === "sovereign") && (
                <div title="High Clearance" className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                    <Diamond className={cn(iconSize, "fill-current")} />
                </div>
            )}

            {/* 4. Circle Emblem (Allegiance) */}
            {FactionIcon && (
                <div title={`${faction} Circle`} className="text-secondary-text opacity-80 border border-white/10 p-0.5 rounded bg-white/5">
                    <FactionIcon className={cn(size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3")} />
                </div>
            )}
        </div>
    );
}
