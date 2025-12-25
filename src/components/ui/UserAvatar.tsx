"use client";

import { useUser } from "@/lib/UserContext";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    showRing?: boolean;
    seed?: string;
    url?: string;
    tier?: string;
    isBlacklist?: boolean;
    isOwner?: boolean;
}

export function UserAvatar({ className, size = "md", showRing = true, seed, url, tier: propTier, isBlacklist: propBlacklist, isOwner: propOwner }: UserAvatarProps) {
    const { user } = useUser();
    const tier = (propTier || user?.tier || 'lobby') as keyof typeof ringColors;
    const isBlacklist = propBlacklist ?? user?.isBlacklist;
    const isOwner = propOwner ?? user?.isOwner;

    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-14 h-14",
        xl: "w-20 h-20"
    };

    const ringColors = {
        lobby: "border-brand-orange",
        shield: "border-brand-cyan",
        professional: "border-brand-pale-pink",
        ultra_elite: "border-white",
        sovereign: "border-brand-blue",
        lifetime: "border-amber-500",
    };

    const activeRingColor = isBlacklist ? ringColors.lifetime : (ringColors[tier] || ringColors.lobby);

    const avatarSrc = url || (user?.avatarUrl && !seed ? user.avatarUrl : null) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || user?.avatarSeed || 'Guest'}`;

    return (
        <div className={cn(
            "relative rounded-full shrink-0 flex items-center justify-center",
            sizeClasses[size],
            className
        )}>
            {/* Owner Glow / Outer Ring */}
            {isOwner && showRing && (
                <div className="absolute inset-[-3px] rounded-full border-2 border-brand-cyan animate-pulse shadow-[0_0_15px_#00D4E5]" />
            )}
            
            {/* Standard/Blacklist Ring */}
            <div className={cn(
                "absolute inset-0 rounded-full overflow-hidden flex items-center justify-center bg-black",
                showRing ? `border-2 ${activeRingColor}` : ""
            )}>
                <img 
                    src={avatarSrc} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
}
