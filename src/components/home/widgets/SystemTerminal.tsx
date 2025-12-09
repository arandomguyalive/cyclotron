"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/UserContext";

const LOGS_FREE = [
    "Basic Protection Active",
    "Location: Visible to Public",
    "Data Stream: Unencrypted",
    "Upgrade to mask your digital footprint...",
    "Status: Online (Public IP)"
];

const LOGS_PREMIUM = [
    "Encryption handshake complete.",
    "Route optimized: <12ms latency.",
    "Scanning local subnet...",
    "Threat neutralized in Sector 9.",
    "System nominal."
];

export function SystemTerminal() {
    const { user } = useUser();
    const isFree = user?.tier === 'free';
    const logs = isFree ? LOGS_FREE : LOGS_PREMIUM;
    
    const [currentLog, setCurrentLog] = useState(logs[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            const randomLog = logs[Math.floor(Math.random() * logs.length)];
            setCurrentLog(randomLog);
        }, 3000);
        return () => clearInterval(interval);
    }, [logs]);

    return (
        <div className="w-full py-2 px-4 border-t border-border-color bg-black/40 backdrop-blur-md fixed bottom-0 left-0 right-0 z-40 pb-safe-area-inset-bottom">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider overflow-hidden">
                <span className={`shrink-0 font-bold ${isFree ? 'text-secondary-text' : 'text-green-500'}`}>
                    {isFree ? "> STATUS:" : "> SYSTEM:"}
                </span>
                <span className="text-secondary-text truncate">
                    {currentLog}
                </span>
                <span className="animate-blink ml-1 block w-1.5 h-3 bg-secondary-text/50" />
            </div>
        </div>
    );
}
