"use client";

import { useUser } from "@/lib/UserContext";
import { Hash } from "lucide-react";

const TAGS = [
    "#Cyberpunk", "#TechPrivacy", "#NightCity", "#Netrunners", "#DataLeak", "#GlitchArt", "#Synthwave"
];

export function TrendingTags() {
    return (
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 px-1">
                <div className="flex items-center gap-1 text-xs font-bold text-secondary-text uppercase tracking-wider shrink-0 mr-2">
                    <Hash className="w-3 h-3" />
                    Trending
                </div>
                {TAGS.map((tag) => (
                    <div 
                        key={tag}
                        className="px-3 py-1.5 rounded-full bg-secondary-bg/5 border border-white/5 backdrop-blur-md text-[10px] font-medium text-secondary-text whitespace-nowrap cursor-pointer hover:bg-white/10 hover:text-primary-text transition-colors"
                    >
                        {tag}
                    </div>
                ))}
            </div>
        </div>
    );
}
