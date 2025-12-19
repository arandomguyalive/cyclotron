"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle, Shield, Briefcase, Crown, X, ArrowLeft, Lock } from "lucide-react";
import { useUser } from "@/lib/UserContext";
import { useState } from "react";
import { PaymentModal } from "@/components/common/PaymentModal";

export default function UpgradePage() {
    const router = useRouter();
    const { user } = useUser();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<"premium" | "gold" | "platinum" | "lifetime">("premium");
    const [spotsLeft, setSpotsLeft] = useState(487); // Simulating some spots already taken

    const tiers = [
                {
                    id: "lifetime",
                    name: "The Blacklist",
                    price: "₹20,000",
                    features: ["Lifetime Access (One-time)", "Forensic Watermarking", "Dead Man's Switch", "Sovereign Wallet", "Limit: 500 Spots"],
                    buttonText: "Join Blacklist",
                    bgColor: "bg-amber-500/10",
                    borderColor: "border-amber-500/50",
                    textColor: "text-amber-500",
                    buttonBgColor: "bg-amber-500 text-black"
                },
                {
                    id: "premium",
                    name: "The Shield",
                    price: "₹999/mo",
                    features: ["Ad-Free Access", "Standard Encryption", "Digital Watermark", "Full Signal Bandwidth"],
                    buttonText: "Activate Shield",
                    bgColor: "bg-brand-cyan/10",
                    borderColor: "border-brand-cyan/20",
                    textColor: "text-brand-cyan",
                    buttonBgColor: "bg-brand-cyan text-black"
                },
                {
                    id: "gold",
                    name: "The Professional",
                    price: "₹9,999/mo",
                    features: ["All Shield Features", "Forensic Watermarking", "Geo-Fencing Control", "Priority Support"],
                    buttonText: "Go Professional",
                    bgColor: "bg-brand-pale-pink/10",
                    borderColor: "border-brand-pale-pink/20",
                    textColor: "text-brand-pale-pink",
                    buttonBgColor: "bg-brand-pale-pink text-black"
                },
                {
                    id: "platinum",
                    name: "The Ultra Elite",
                    price: "₹99,999/mo",
                    features: ["All Professional Features", "Biometric Focus Lock", "Device Binding (Mock)", "Zero KM18 Commission"],
                    buttonText: "Join Ultra Elite",
                    bgColor: "bg-white/10",
                    borderColor: "border-white/20",
                    textColor: "text-white",
                    buttonBgColor: "bg-white text-black"
                },
            ];
        
            return (
                <div className="min-h-screen bg-primary-bg text-primary-text pb-20 relative overflow-hidden font-sans">
                    {/* Header */}
                    <header className="px-6 py-4 pt-safe-area-top flex items-center justify-between sticky top-0 z-50 bg-primary-bg/80 backdrop-blur-md border-b border-border-color/50">
                        <button onClick={() => router.back()} className="text-secondary-text hover:text-primary-text transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold tracking-tight text-primary-text">Upgrade Protocol</h1>
                        <div className="w-6" /> {/* Spacer */}
                    </header>
        
                    {/* Content */}
                    <main className="p-6 space-y-8">
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center text-secondary-text max-w-md mx-auto text-sm"
                        >
                            Unlock the full power of ABHED. Secure your digital existence with KM18's advanced protocols.
                        </motion.p>
                        
                        {/* Blacklist Spots Remaining */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative bg-gradient-to-r from-amber-900/20 to-black border border-amber-500/30 rounded-xl p-4 text-center shadow-lg"
                        >
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                            <p className="text-sm font-bold text-amber-500 uppercase tracking-widest animate-pulse">
                                Limited Offer
                            </p>
                            <h3 className="text-3xl font-black text-white mt-2">
                                <span className="text-amber-500">{spotsLeft}</span> / 500 Blacklist Spots Remaining
                            </h3>
                            <p className="text-xs text-amber-700 mt-2">Act fast before the opportunity is gone.</p>
                        </motion.div>
        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {tiers.map((tier, index) => (
                                <motion.div
                                    key={tier.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`relative p-6 rounded-3xl ${tier.bgColor} ${tier.borderColor} border flex flex-col items-center text-center shadow-lg backdrop-blur-sm`}
                                >
                                    <div className={`p-3 rounded-full ${tier.bgColor} mb-4 ${tier.textColor}`}>
                                        {tier.id === "premium" && <Shield className="w-8 h-8" />}
                                        {tier.id === "gold" && <Briefcase className="w-8 h-8" />}
                                        {tier.id === "platinum" && <Crown className="w-8 h-8" />}
                                        {tier.id === "lifetime" && <Lock className="w-8 h-8" />}
                                    </div>
                                    <h2 className={`text-2xl font-bold mb-2 ${tier.textColor}`}>{tier.name}</h2>
                                    <p className="text-3xl font-extrabold mb-4">{tier.price}</p>
                                    
                                    <ul className="text-sm text-secondary-text space-y-2 mb-6 text-left w-full">
                                        {tier.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
        
                                    {user?.tier === tier.id ? (
                                        <button className={`mt-auto w-full py-3 rounded-xl font-bold ${tier.textColor} border ${tier.borderColor} cursor-default`}>
                                            CURRENT PLAN
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => {
                                                setSelectedTier(tier.id);
                                                setIsPaymentModalOpen(true);
                                            }}
                                            className={`mt-auto w-full py-3 rounded-xl font-bold ${tier.buttonBgColor} transition-colors hover:scale-[1.02] active:scale-[0.98]`}
                                        >
                                            {tier.buttonText}
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                {/* Sovereign Access Section */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 p-8 rounded-3xl bg-black border border-brand-blue/30 relative overflow-hidden text-center"
                >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
                    <div className="relative z-10">
                        <Lock className="w-8 h-8 text-brand-blue mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2 tracking-widest uppercase">The Sovereign</h2>
                        <p className="text-brand-blue/60 text-sm mb-6 max-w-lg mx-auto">
                            For those who operate beyond the grid. Bespoke Infrastructure. Total Isolation. Absolute Dominion.
                        </p>
                        
                        <div className="inline-block border border-brand-blue/50 rounded-xl p-1">
                            <div className="px-6 py-3 bg-brand-blue/10 rounded-lg">
                                <span className="block text-[10px] text-brand-blue uppercase tracking-widest mb-1">Refundable Deposit</span>
                                <span className="text-2xl font-mono text-white font-bold">₹10,00,000</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => alert("Connecting to Secure Handler... (Mock)")}
                            className="block w-full max-w-xs mx-auto mt-6 py-3 bg-brand-blue hover:bg-brand-blue/80 text-white font-bold rounded-xl transition-colors"
                        >
                            REQUEST ENCRYPTED CHANNEL
                        </button>
                    </div>
                </motion.div>

            </main>

            <PaymentModal 
                isOpen={isPaymentModalOpen} 
                onClose={() => setIsPaymentModalOpen(false)} 
                upgradeToTier={selectedTier} 
            />
        </div>
    );
}
