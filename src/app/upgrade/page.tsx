"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Shield, Zap, Diamond, Crown, Infinity, ArrowLeft, Lock, Loader2 } from "lucide-react";
import { useUser, UserTier } from "@/lib/UserContext";
import { useState, useEffect, Suspense } from "react";
import { PaymentModal } from "@/components/common/PaymentModal";

type TierOption = {
    id: UserTier;
    name: string;
    monthlyPrice: number;
    features: string[];
    buttonText: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    buttonBgColor: string;
    icon: any;
};

const tiers: TierOption[] = [
    {
        id: "shield",
        name: "The Shield",
        monthlyPrice: 999,
        features: ["Ad-Free Signal", "Standard Encryption", "Secure Data Flow", "Full Bandwidth"],
        buttonText: "Activate Shield",
        bgColor: "bg-brand-cyan/10",
        borderColor: "border-brand-cyan/20",
        textColor: "text-brand-cyan",
        buttonBgColor: "bg-brand-cyan text-black",
        icon: Shield
    },
    {
        id: "professional",
        name: "Professional",
        monthlyPrice: 9999,
        features: ["All Shield Features", "Forensic Gating", "Geo-Fencing Suite", "Priority Uplink"],
        buttonText: "Go Professional",
        bgColor: "bg-brand-hot-pink/10",
        borderColor: "border-brand-hot-pink/20",
        textColor: "text-brand-hot-pink",
        buttonBgColor: "bg-brand-hot-pink text-black",
        icon: Zap
    },
    {
        id: "ultra_elite",
        name: "Ultra Elite",
        monthlyPrice: 99999,
        features: ["All Professional Features", "Biometric Focus", "Personal Archive", "Zero Commission"],
        buttonText: "Join the Elite",
        bgColor: "bg-white/10",
        borderColor: "border-white/20",
        textColor: "text-white",
        buttonBgColor: "bg-white text-black",
        icon: Diamond
    }
];

function UpgradeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useUser();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<UserTier>("shield");
    const [isBlacklistMode, setIsBlacklistMode] = useState(false);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
    const [spotsLeft, setSpotsLeft] = useState(13); // Default low number

    useEffect(() => {
        // Auto-open blacklist modal if mode is set
        const mode = searchParams.get('mode');
        if (mode === 'blacklist') {
            setSelectedTier("professional");
            setIsBlacklistMode(true);
            setIsPaymentModalOpen(true);
        }

        // Sync simulated spots with landing page or generate new unique number
        const stored = sessionStorage.getItem("blacklist_simulated_count");
        if (stored) {
            const joined = parseInt(stored, 10);
            setSpotsLeft(500 - joined);
        } else {
            // If they came directly, generate a random joined number (412-489)
            // ensuring spots left is between 11 and 88
            const randomJoined = Math.floor(Math.random() * (489 - 412 + 1)) + 412;
            sessionStorage.setItem("blacklist_simulated_count", randomJoined.toString());
            setSpotsLeft(500 - randomJoined);
        }
    }, [searchParams]);

    const formatPrice = (tier: TierOption) => {
        if (billingCycle === 'annual') {
            const discounted = (tier.monthlyPrice * 12) * 0.9;
            return `₹${Math.round(discounted).toLocaleString()}/yr`;
        }
        return `₹${tier.monthlyPrice.toLocaleString()}/mo`;
    };
        
    return (
        <div className="min-h-screen bg-primary-bg text-primary-text pb-20 relative overflow-hidden font-sans">
            <header className="px-6 py-4 pt-safe-area-top flex items-center justify-between sticky top-0 z-50 bg-primary-bg/80 backdrop-blur-md border-b border-border-color/50">
                <button onClick={() => router.back()} className="text-secondary-text hover:text-white transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold tracking-widest text-white uppercase"><span className="font-blackjack text-3xl normal-case tracking-normal text-brand-orange">KM18</span> Protocols</h1>
                <div className="w-6" />
            </header>

            <main className="p-6 space-y-8">
                {/* Blacklist Special Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-8 rounded-3xl bg-black border border-brand-orange/30 overflow-hidden shadow-[0_0_50px_rgba(235,121,85,0.1)]"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Infinity className="w-24 h-24 text-brand-orange" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-brand-orange/20 text-brand-orange rounded-lg border border-brand-orange/30">
                                <Infinity className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-brand-orange uppercase tracking-tighter"><span className="font-blackjack text-4xl normal-case tracking-normal">KM18</span> Blacklist</h2>
                                <span className="text-[10px] font-bold text-brand-orange/70 uppercase tracking-[0.3em]">Alpha Registry Protocol</span>
                            </div>
                        </div>
                        <p className="text-sm text-secondary-text max-w-md mb-6 leading-relaxed">
                            Be among the first 500 creators to secure **Lifetime <span className="font-blackjack text-brand-orange text-2xl">KM18</span> Professional Access**. No recurring fees. Eternal sovereignty.
                        </p>
                        
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between text-xs font-mono border-b border-amber-500/10 pb-2">
                                <span className="text-amber-700">SPOTS REMAINING:</span>
                                <span className="text-amber-500 font-bold">{spotsLeft} / 500</span>
                            </div>
                            <button 
                                onClick={() => { 
                                    setSelectedTier("professional"); 
                                    setIsBlacklistMode(true);
                                    setIsPaymentModalOpen(true); 
                                }}
                                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                            >
                                Claim Lifetime Slot
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Standard Tiers */}
                <div className="flex justify-center items-center gap-4 py-4">
                    <span className={`text-xs font-bold uppercase tracking-widest ${billingCycle === 'monthly' ? 'text-white' : 'text-secondary-text'}`}>Monthly</span>
                    <button onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')} className="w-14 h-7 bg-white/10 rounded-full p-1 relative border border-white/20">
                        <motion.div animate={{ x: billingCycle === 'monthly' ? 0 : 28 }} className="w-5 h-5 bg-brand-cyan rounded-full shadow-[0_0_10px_#00D4E5]" />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-widest ${billingCycle === 'annual' ? 'text-white' : 'text-secondary-text'}`}>Annual</span>
                        <span className="bg-brand-orange/20 text-brand-orange text-[9px] px-2 py-0.5 rounded-full font-bold border border-brand-orange/30">-10%</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tiers.map((tier, i) => (
                        <motion.div key={tier.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`p-6 rounded-3xl ${tier.bgColor} ${tier.borderColor} border flex flex-col items-center text-center backdrop-blur-sm`}>
                            <div className={`p-4 rounded-2xl ${tier.bgColor} mb-4 ${tier.textColor}`}>
                                <tier.icon className="w-10 h-10" />
                            </div>
                            <h2 className={`text-2xl font-bold mb-1 ${tier.textColor}`}>{tier.name}</h2>
                            <p className="text-3xl font-black mb-6">{formatPrice(tier)}</p>
                            <ul className="text-sm text-secondary-text space-y-3 mb-8 text-left w-full">
                                {tier.features.map((f, idx) => <li key={idx} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-cyan shrink-0" /><span>{f}</span></li>)}
                            </ul>
                            <button 
                                onClick={() => { 
                                    setSelectedTier(tier.id); 
                                    setIsBlacklistMode(false);
                                    setIsPaymentModalOpen(true); 
                                }} 
                                className={`mt-auto w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs ${tier.buttonBgColor} hover:scale-[1.02] transition-transform`}
                            >
                                {tier.buttonText}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Sovereign Access Section */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 p-8 rounded-3xl bg-black border border-brand-blue/30 relative overflow-hidden text-center"
                >
                    <div className="relative z-10">
                        <Crown className="w-10 h-10 text-brand-blue mx-auto mb-4 animate-pulse" />
                        <h2 className="text-3xl font-black text-white mb-2 tracking-[0.2em] uppercase italic">The Sovereign</h2>
                        <p className="text-brand-blue/60 text-sm mb-8 max-w-lg mx-auto">Absolute Network Dominion. Custom Security Infrastructure. Total Privacy Isolation.</p>
                        <div className="inline-block border border-brand-blue/50 rounded-2xl p-1 mb-8">
                            <div className="px-8 py-4 bg-brand-blue/10 rounded-xl">
                                <span className="block text-[10px] text-brand-blue uppercase tracking-widest mb-1 font-bold">Refundable Protocol Deposit</span>
                                <span className="text-3xl font-mono text-white font-black">₹10,00,000</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                setSelectedTier("sovereign");
                                setIsBlacklistMode(false);
                                setIsPaymentModalOpen(true);
                            }} 
                            className="block w-full max-w-xs mx-auto py-4 bg-brand-blue hover:bg-brand-blue/80 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_30px_rgba(0,96,150,0.3)]"
                        >
                            Establish Sovereign Channel
                        </button>
                    </div>
                </motion.div>
            </main>

            <PaymentModal 
                isOpen={isPaymentModalOpen} 
                onClose={() => setIsPaymentModalOpen(false)} 
                upgradeToTier={selectedTier} 
                billingCycle={billingCycle} 
                isBlacklistMode={isBlacklistMode}
            />
        </div>
    );
}

export default function UpgradePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-primary-bg"><Loader2 className="w-10 h-10 animate-spin text-brand-orange" /></div>}>
            <UpgradeContent />
        </Suspense>
    );
}