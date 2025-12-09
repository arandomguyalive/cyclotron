"use client";

import { useUser } from "@/lib/UserContext";
import { Crosshair, Award, ChevronRight, AlertCircle } from "lucide-react";

export function DailyDirective() {
    const { user } = useUser();
    const isFree = user?.tier === 'free';

    return (
        <div className={`p-6 rounded-3xl border relative overflow-hidden group cursor-pointer transition-all ${
            isFree 
            ? 'bg-[#f0f0f0]/5 border-white/10' 
            : 'bg-gradient-to-br from-accent-2/10 to-transparent border-accent-2/20 hover:border-accent-2/50'
        }`}>
            
            <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-full ${isFree ? 'bg-secondary-bg' : 'bg-accent-2/20 text-accent-2'}`}>
                    {isFree ? <AlertCircle className="w-5 h-5 text-secondary-text" /> : <Crosshair className="w-5 h-5" />}
                </div>
                {!isFree && (
                    <div className="flex items-center gap-1 text-[10px] text-accent-2 font-mono bg-accent-2/10 px-2 py-0.5 rounded">
                        <Award className="w-3 h-3" />
                        <span>+500 XP</span>
                    </div>
                )}
            </div>

            <h3 className={`font-bold text-lg mb-1 ${isFree ? 'text-secondary-text' : 'text-primary-text'}`}>
                {isFree ? "Daily Drop" : "CLASSIFIED DIRECTIVE"}
            </h3>

            <p className={`text-xs mb-4 ${isFree ? 'text-secondary-text/60' : 'text-accent-2/80 font-mono'}`}>
                {isFree 
                    ? "Post a photo."
                    : "Capture a neon sign in Sector 7. Stealth required."
                }
            </p>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className={isFree ? 'text-secondary-text' : 'text-accent-2'}>
                    {isFree ? "Start" : "Accept Mission"}
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isFree ? 'text-secondary-text' : 'text-accent-2'}`} />
            </div>

            {/* Background Decor */}
            {!isFree && (
                <div className="absolute -right-4 -bottom-4 opacity-10">
                    <Crosshair className="w-24 h-24 text-accent-2" />
                </div>
            )}
        </div>
    );
}
