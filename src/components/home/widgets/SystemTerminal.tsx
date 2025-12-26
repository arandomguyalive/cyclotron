"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/UserContext";
import { motion } from "framer-motion";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const LOGS_FREE = [
    <><span className="font-blackjack text-emerald-500/80 mr-1 text-sm">KM18</span> // Standard Encryption</>,
    <><span className="font-blackjack text-emerald-500/80 mr-1 text-sm">KM18</span> // Public IP Visible</>,
    <><span className="font-blackjack text-emerald-500/80 mr-1 text-sm">KM18</span> // Masking: Off</>,
    <><span className="font-blackjack text-emerald-500/80 mr-1 text-sm">KM18</span> // Connection: Standard</>,
    <><span className="font-blackjack text-emerald-500/80 mr-1 text-sm">KM18</span> // Footprint: Detected</>
];

const LOGS_PREMIUM = [
    <><span className="font-blackjack text-emerald-500/80 mr-1 text-sm">KM18</span> // Enhanced Encryption</>,
    <><span className="font-blackjack text-emerald-500/80 mr-1 text-sm">KM18</span> // Location: Masked</>,
    <><span className="font-blackjack text-emerald-500/80 mr-1 text-sm">KM18</span> // VPN: Tunnel Established</>,
    <><span className="font-blackjack text-emerald-500/80 mr-1 text-sm">KM18</span> // Connection: Optimized</>,
    <><span className="font-blackjack text-emerald-500/80 mr-1 text-sm">KM18</span> // Footprint: Hidden</>
];

export function SystemTerminal() {
    const { user, firebaseUser } = useUser();
    const isFree = user?.tier === 'lobby';
    const logs = isFree ? LOGS_FREE : LOGS_PREMIUM;
    
    const [currentLog, setCurrentLog] = useState(logs[0]);
    const [logIndex, setLogIndex] = useState(0);
    const [alert, setAlert] = useState<string | null>(null);

    // Standard Log Rotation
    useEffect(() => {
        if (alert) return; // Don't rotate if showing alert
        const interval = setInterval(() => {
            const nextIdx = (logIndex + 1) % logs.length;
            setLogIndex(nextIdx);
            setCurrentLog(logs[nextIdx]);
        }, 4000);
        return () => clearInterval(interval);
    }, [logs, alert, logIndex]);

    // Security Alert Listener
    useEffect(() => {
        if (!firebaseUser) return;

        const q = query(
            collection(db, "users", firebaseUser.uid, "notifications"),
            orderBy("timestamp", "desc"),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                // Check if notification is recent (last 10 seconds)
                const notifTime = data.timestamp?.toMillis ? data.timestamp.toMillis() : Date.now();
                if (Date.now() - notifTime < 10000 && data.type === 'SCREENSHOT_POST') {
                     setAlert(`⚠️ ALERT: ${data.actorHandle} captured your post!`);
                     // Clear alert after 8 seconds
                     setTimeout(() => setAlert(null), 8000);
                }
            }
        }, (error) => {
            // Silently fail if permissions denied (User likely knows via other means)
            // console.warn("System alert listener failed:", error); 
        });

        return () => unsubscribe();
    }, [firebaseUser]);

    return (
        <div className={`w-full py-3 px-6 border-t border-border-color backdrop-blur-xl fixed bottom-0 left-0 right-0 z-40 pb-safe-area-inset-bottom transition-colors duration-300 ${alert ? 'bg-red-900/90 border-red-500' : 'bg-primary-bg/80'}`}>
            <div className="flex items-center justify-between text-xs">
                <span className={`font-bold ${alert ? 'text-red-200 animate-pulse' : (isFree ? 'text-secondary-text' : 'text-emerald-500')}`}>
                    {alert ? "SECURITY BREACH" : "Status"}
                </span>
                <motion.span 
                    key={alert ? 'alert' : `log-${logIndex}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={`font-medium ${alert ? 'text-red-100 font-bold' : 'text-secondary-text'}`}
                >
                    {alert || currentLog}
                </motion.span>
            </div>
        </div>
    );
}
