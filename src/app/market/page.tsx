"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Zap, Shield, Eye, Lock, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useUser } from "@/lib/UserContext";
import { useSonic } from "@/lib/SonicContext";
import { useToast } from "@/lib/ToastContext";

interface MarketItem {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: React.ElementType;
    type: "consumable" | "unlock";
    color: string;
}

const items: MarketItem[] = [
    {
        id: "boost-signal",
        name: "Signal Boost",
        description: "Amplify your next post to reach 2x more scanners in your sector.",
        price: 500,
        icon: Zap,
        type: "consumable",
        color: "text-brand-orange"
    },
    {
        id: "ghost-cloak",
        name: "Ghost Cloak",
        description: "Total invisibility on the Local Scanner for 1 hour.",
        price: 1200,
        icon: Eye,
        type: "consumable",
        color: "text-brand-pale-pink"
    },
    {
        id: "theme-matrix",
        name: "Matrix Protocol",
        description: "Unlock the legacy 'Matrix' visual interface theme.",
        price: 5000,
        icon: Lock,
        type: "unlock",
        color: "text-brand-cyan"
    },
    {
        id: "burner-phone",
        name: "Burner Identity",
        description: "Generate a temporary alias for anonymous faction chatting.",
        price: 2500,
        icon: Shield,
        type: "consumable",
        color: "text-brand-purple"
    }
];

export default function MarketPage() {
    const { user, updateUser, loading } = useUser();
    const router = useRouter();
    const { playClick } = useSonic();
    const { toast } = useToast();
    
    const [purchasing, setPurchasing] = useState<string | null>(null);

    const credits = parseInt(user?.stats?.credits || "0");

    const handlePurchase = async (item: MarketItem) => {
        playClick(600, 0.05, 'square');
        if (credits < item.price) {
            toast("Insufficient Funds. Complete directives to earn cycles.", "error");
            return;
        }

        setPurchasing(item.id);
        
        // Simulate Network Latency for immersion
        setTimeout(async () => {
            try {
                const newCredits = credits - item.price;
                const newInventory = [...(user?.inventory || []), item.id];

                await updateUser({ 
                    inventory: newInventory,
                    stats: { 
                        ...(user?.stats || { following: "0", followers: "0", likes: "0", credits: "0", reputation: "0" }), 
                        credits: newCredits.toString() 
                    } 
                });

                setPurchasing(null);
                toast(`Acquired: ${item.name}`, "success");
                playClick(880, 0.2, 'sine');
            } catch (err) {
                console.error("Market transaction failed", err);
                setPurchasing(null);
                toast("Transaction Failed: Connection Lost.", "error");
            }
        }, 1500);
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-black text-primary-text pb-20 relative overflow-hidden font-sans">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20" />
            
            {/* Header */}
            <header className="px-6 py-4 pt-safe-area-top flex items-center justify-between sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="text-secondary-text hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold tracking-widest text-white uppercase flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-brand-orange" />
                        Black Market
                    </h1>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-secondary-text uppercase tracking-wider">Balance</span>
                    <span className="font-mono text-brand-cyan font-bold">{credits} ₵</span>
                </div>
            </header>

            {/* Inventory Grid */}
            <main className="p-6">
                <div className="grid grid-cols-1 gap-4">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative p-6 rounded-2xl bg-white/5 border border-white/10 overflow-hidden group"
                        >
                            {/* Hover Glow */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r from-transparent via-${item.color.replace('text-', '')} to-transparent`} />

                            <div className="relative z-10 flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl bg-black border border-white/10 ${item.color}`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{item.name}</h3>
                                        <p className="text-xs text-secondary-text leading-relaxed max-w-[200px] mb-2">
                                            {item.description}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded border border-white/10 uppercase tracking-wider ${item.type === 'consumable' ? 'text-brand-orange' : 'text-brand-purple'}`}>
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    <span className="font-mono font-bold text-white text-lg">{item.price} ₵</span>
                                    <button 
                                        onClick={() => handlePurchase(item)}
                                        disabled={purchasing === item.id || (item.type === 'unlock' && user?.inventory?.includes(item.id)) || (item.type === 'unlock' && credits < item.price)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                                            (item.type === 'unlock' && user?.inventory?.includes(item.id))
                                            ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 cursor-default"
                                            : credits >= item.price 
                                            ? "bg-white text-black hover:bg-brand-cyan hover:text-black" 
                                            : "bg-white/10 text-white/30 cursor-not-allowed"
                                        }`}
                                    >
                                        {purchasing === item.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (item.type === 'unlock' && user?.inventory?.includes(item.id)) ? (
                                            <div className="flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                Owned
                                            </div>
                                        ) : (
                                            "Acquire"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
