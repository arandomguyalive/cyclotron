"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/UserContext";
import { motion } from "framer-motion";

const LOGS_FREE = [
    "Standard Encryption Active",
    "Public IP Visible",
    "Masking: Off",
    "Connection: Standard",
    "Digital Footprint: Detected"
];

const LOGS_PREMIUM = [
    "Enhanced Encryption Active",
    "Location: Masked",
    "VPN: Tunnel Established",
    "Connection: Optimized",
    "Digital Footprint: Hidden"
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
        }, 4000);
        return () => clearInterval(interval);
    }, [logs]);

    return (
        <div className="w-full py-3 px-6 border-t border-border-color bg-primary-bg/80 backdrop-blur-xl fixed bottom-0 left-0 right-0 z-40 pb-safe-area-inset-bottom">
            <div className="flex items-center justify-between text-xs">
                <span className={`font-bold ${isFree ? 'text-secondary-text' : 'text-emerald-500'}`}>
                    Status
                </span>
                <motion.span 
                    key={currentLog}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-secondary-text font-medium"
                >
                    {currentLog}
                </motion.span>
            </div>
        </div>
    );
}
