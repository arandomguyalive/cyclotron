"use client";
import { useUser } from "@/lib/UserContext";
import { useState } from "react";

export function DebugOverlay() {
    const { user, firebaseUser } = useUser();
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 left-4 z-[9999] bg-red-900/20 text-red-500 text-[10px] px-2 py-1 rounded border border-red-900/50 hover:bg-red-900 hover:text-white transition-colors"
            >
                DEBUG
            </button>
        );
    }

    return (
        <div className="fixed bottom-24 left-4 z-[9999] bg-black/95 border border-red-500/50 p-4 rounded-xl text-[10px] font-mono text-green-400 w-72 max-h-80 overflow-y-auto shadow-2xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                <h3 className="text-white font-bold tracking-widest">SYSTEM DIAGNOSTICS</h3>
                <button onClick={() => setIsOpen(false)} className="text-red-500 hover:text-white font-bold">X</button>
            </div>
            
            <div className="space-y-1">
                <div className="flex justify-between"><span className="text-secondary-text">Auth Status:</span> <span className={firebaseUser ? "text-green-500" : "text-red-500"}>{firebaseUser ? "Authenticated" : "Guest"}</span></div>
                <div className="flex justify-between"><span className="text-secondary-text">UID:</span> <span>{firebaseUser?.uid?.substring(0, 12)}...</span></div>
                
                <div className="h-px bg-white/10 my-2" />
                
                <div className="flex justify-between"><span className="text-secondary-text">Handle:</span> <span className="text-white font-bold">{user?.handle || "N/A"}</span></div>
                <div className="flex justify-between"><span className="text-secondary-text">Tier:</span> <span className="text-brand-cyan font-bold">{user?.tier || "N/A"}</span></div>
                
                <div className="flex justify-between mt-1">
                    <span className="text-secondary-text">isOwner:</span> 
                    <span className={user?.isOwner ? "bg-brand-blue text-black px-1 rounded font-bold" : "text-secondary-text"}>{String(user?.isOwner)}</span>
                </div>
                
                <div className="flex justify-between">
                    <span className="text-secondary-text">isBlacklist:</span> 
                    <span className={user?.isBlacklist ? "text-brand-orange" : "text-secondary-text"}>{String(user?.isBlacklist)}</span>
                </div>

                <div className="h-px bg-white/10 my-2" />
                <div className="text-secondary-text mb-1">Raw Config:</div>
                <pre className="text-[8px] text-secondary-text/70 whitespace-pre-wrap break-all bg-white/5 p-2 rounded border border-white/5">
                    {JSON.stringify(user, (key, value) => {
                        if (key === 'bio' || key === 'avatarUrl') return undefined; // Hide bulky fields
                        return value;
                    }, 2)}
                </pre>
            </div>
        </div>
    );
}