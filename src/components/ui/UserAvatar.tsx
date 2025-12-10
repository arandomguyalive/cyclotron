"use client";

import { useUser } from "@/lib/UserContext";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    showRing?: boolean;
}

export function UserAvatar({ className, size = "md", showRing = true }: UserAvatarProps) {
    const { user } = useUser();
    const tier = user?.tier || 'free';

    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-14 h-14",
        xl: "w-20 h-20"
    };

    const ringColors = {
        free: "border-rose-500",
        premium: "border-sky-400",
        gold: "border-amber-400",
        platinum: "border-white",
        sovereign: "border-purple-500", // or gold for sovereign
    };

    return (
        <div className={cn(
            "relative rounded-full overflow-hidden shrink-0",
            sizeClasses[size],
            showRing ? `border-2 ${ringColors[tier]}` : "",
            className
        )}>
            <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.avatarSeed || 'Guest'}`} 
                alt="Avatar" 
                className="w-full h-full object-cover bg-black"
            />
        </div>
    );
}
