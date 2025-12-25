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
}

export function UserAvatar({ className, size = "md", showRing = true, seed, url, tier: propTier }: UserAvatarProps) {
    const { user } = useUser();
    const tier = (propTier || user?.tier || 'free') as keyof typeof ringColors;

    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-14 h-14",
        xl: "w-20 h-20"
    };

    const ringColors = {
        free: "border-brand-orange",
        premium: "border-brand-cyan",
        gold: "border-brand-pale-pink",
        platinum: "border-white",
        sovereign: "border-brand-blue",
        lifetime: "border-amber-500",
    };

    const avatarSrc = url || (user?.avatarUrl && !seed ? user.avatarUrl : null) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || user?.avatarSeed || 'Guest'}`;

    return (
        <div className={cn(
            "relative rounded-full overflow-hidden shrink-0",
            sizeClasses[size],
            showRing ? `border-2 ${ringColors[tier] || ringColors.free}` : "",
            className
        )}>
            <img 
                src={avatarSrc} 
                alt="Avatar" 
                className="w-full h-full object-cover bg-black"
            />
        </div>
    );
}
