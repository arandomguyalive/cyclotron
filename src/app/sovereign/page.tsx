"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@/lib/UserContext";
import { Users, Signal, Globe, Zap, AlertTriangle, ShieldOff, CheckCircle, Crown, X, Loader2 } from "lucide-react";
import { useToast } from "@/lib/ToastContext";
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserProfileSimple {
    uid: string;
    handle: string;
    tier: string;
    status?: 'active' | 'banned';
}

interface Alert {
    id?: string;
    message: string;
    timestamp: Timestamp | Date;
}

export default function SovereignDashboardPage() {
    const { user, firebaseUser, loading } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const [alertMessage, setAlertMessage] = useState("");
    const [recentUsers, setRecentUsers] = useState<UserProfileSimple[]>([]);
    const [globalStats, setGlobalStats] = useState({
        users: 15432,
        activeSignals: 876,
        threatLevel: "GREEN",
        netStability: "99.8%"
    });

    useEffect(() => {
        if (!loading && (!firebaseUser || (user?.tier !== 'sovereign' && !user?.isOwner))) {
            toast("Access Denied: Sovereign Clearance Required", "error");
            router.push("/home");
        }
    }, [user, firebaseUser, loading, router, toast]);

    // Fetch Recent Users
    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("timestamp", "desc"), limit(5));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedUsers: UserProfileSimple[] = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            })) as UserProfileSimple[];
            setRecentUsers(fetchedUsers);
        });
        return () => unsubscribe();
    }, []);

    const handleBroadcastAlert = async () => {
        if (!alertMessage.trim()) return;
        try {
            await addDoc(collection(db, "alerts"), {
                message: alertMessage,
                timestamp: serverTimestamp(),
                sender: user?.handle || "Sovereign Agent"
            });
            toast("System Alert Broadcasted", "success");
            setAlertMessage("");
        } catch (error) {
            console.error("Failed to broadcast alert:", error);
            toast("Error broadcasting alert", "error");
        }
    };

    const handleBanUser = async (uid: string, handle: string) => {
        if (confirm(`Confirm banning user @${handle}?`)) {
            try {
                // In a real app, this would trigger a backend function
                await updateDoc(doc(db, "users", uid), { status: 'banned' });
                toast(`User @${handle} Banned (Simulated)`, "warning");
                // Update local state to reflect change
                setRecentUsers(prev => prev.map(u => u.uid === uid ? { ...u, status: 'banned' } : u));
            } catch (error) {
                console.error("Failed to ban user:", error);
                toast("Error banning user", "error");
            }
        }
    };

    if (loading || (user?.tier !== 'sovereign' && !user?.isOwner)) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-primary-bg text-accent-1">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="font-mono text-xs tracking-widest animate-pulse">VERIFYING CLEARANCE...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary-bg text-primary-text pb-20 relative overflow-hidden font-sans">
            {/* Header */}
            <header className="px-6 py-4 pt-safe-area-top flex items-center justify-between sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-brand-blue/50">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Crown className="w-6 h-6 text-brand-blue" />
                    SOVEREIGN CONSOLE
                </h1>
                <button onClick={() => router.push("/profile")} className="text-brand-blue hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </header>

            {/* Global Stats */}
            <main className="p-6 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                    <StatCard icon={Users} label="Total Users" value={globalStats.users} color="text-brand-blue" />
                    <StatCard icon={Signal} label="Active Signals" value={globalStats.activeSignals} color="text-brand-cyan" />
                    <StatCard icon={AlertTriangle} label="Threat Level" value={globalStats.threatLevel} color={globalStats.threatLevel === "GREEN" ? "text-green-500" : "text-brand-orange"} />
                    <StatCard icon={Zap} label="Net Stability" value={globalStats.netStability} color="text-brand-cyan" />
                </div>

                {/* System Alert Broadcast */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-3xl bg-black border border-brand-blue/30 relative overflow-hidden"
                >
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-brand-blue" />
                        BROADCAST SYSTEM ALERT
                    </h2>
                    <textarea
                        value={alertMessage}
                        onChange={(e) => setAlertMessage(e.target.value)}
                        placeholder="Type urgent transmission..."
                        className="w-full bg-secondary-bg/50 border border-border-color rounded-xl p-3 text-white placeholder:text-secondary-text/50 focus:border-brand-blue outline-none text-sm font-mono resize-none h-24 mb-4"
                    />
                    <button
                        onClick={handleBroadcastAlert}
                        disabled={!alertMessage.trim()}
                        className="w-full py-3 bg-brand-blue hover:bg-brand-blue/80 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        BROADCAST
                    </button>
                </motion.div>

                {/* Recent User Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-3xl bg-black border border-brand-blue/30 relative overflow-hidden"
                >
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-brand-blue" />
                        RECENT USER ACTIVITY
                    </h2>
                    <div className="space-y-3">
                        {recentUsers.length === 0 ? (
                            <p className="text-secondary-text text-sm">No recent activity detected.</p>
                        ) : (
                            recentUsers.map(u => (
                                <div key={u.uid} className="flex items-center justify-between bg-secondary-bg/50 border border-border-color p-3 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-1 to-accent-2 p-[2px] overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.handle}`} className="w-full h-full rounded-full bg-primary-bg" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">@{u.handle}</p>
                                            <p className="text-xs text-secondary-text">{u.tier} Tier {u.status === 'banned' && <span className="text-brand-orange">(BANNED)</span>}</p>
                                        </div>
                                    </div>
                                    {u.status !== 'banned' && (
                                        <button onClick={() => handleBanUser(u.uid, u.handle)} className="flex items-center gap-1 text-xs text-brand-orange hover:text-white hover:bg-brand-orange/20 px-3 py-1 rounded-full border border-brand-orange/50 transition-colors">
                                            <ShieldOff className="w-4 h-4" />
                                            BAN
                                        </button>
                                    )}
                                    {u.status === 'banned' && (
                                         <span className="flex items-center gap-1 text-xs text-secondary-text/50">
                                            <CheckCircle className="w-4 h-4" />
                                            BLOCKED
                                         </span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: string | number, color: string }) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-2xl bg-black border border-brand-blue/30 flex flex-col items-start gap-2 shadow-lg ${color}`}
        >
            <Icon className="w-8 h-8 opacity-70" />
            <p className="text-sm text-secondary-text uppercase">{label}</p>
            <p className="text-2xl font-bold font-mono">{value}</p>
        </motion.div>
    );
}