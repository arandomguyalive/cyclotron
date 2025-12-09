"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle, Shield, Briefcase, Crown, X, ArrowLeft } from "lucide-react";
import { useUser } from "@/lib/UserContext";
import { useState } from "react";
import { PaymentModal } from "@/components/common/PaymentModal";

export default function UpgradePage() {
    const router = useRouter();
    const { user } = useUser();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<"premium" | "gold" | "ultimate">("premium");

    const tiers = [
        { 
            id: "premium", 
            name: "The Shield", 
            price: "₹999/mo", 
            features: ["Ad-Free Access", "Standard Encryption", "Digital Watermark", "Full Signal Bandwidth"],
            buttonText: "Activate Shield",
            bgColor: "bg-cyan-400/10",
            borderColor: "border-cyan-400/20",
            textColor: "text-cyan-400"
        },
        { 
            id: "gold", 
            name: "The Professional", 
            price: "₹9999/mo", 
            features: ["All Shield Features", "Forensic Watermarking", "Geo-Fencing Control", "Priority Support"],
            buttonText: "Go Professional",
            bgColor: "bg-amber-400/10",
            borderColor: "border-amber-400/20",
            textColor: "text-amber-400"
        },
        { 
            id: "ultimate", 
            name: "The Ultra Elite", 
            price: "₹99999/mo", 
            features: ["All Professional Features", "Biometric Focus Lock", "Device Binding (Mock)", "Zero KM18 Commission"],
            buttonText: "Join Ultra Elite",
            bgColor: "bg-purple-500/10",
            borderColor: "border-purple-500/20",
            textColor: "text-purple-500"
        },
    ];

    return (
        <div className="min-h-screen bg-primary-bg text-primary-text pb-20 relative overflow-hidden">
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
                    className="text-center text-secondary-text max-w-md mx-auto"
                >
                    Unlock the full power of ABHED. Secure your digital existence with KM18's advanced protocols.
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative p-6 rounded-3xl ${tier.bgColor} ${tier.borderColor} border flex flex-col items-center text-center shadow-lg`}
                        >
                            <div className={`p-3 rounded-full ${tier.bgColor} mb-4 ${tier.textColor}`}>
                                {tier.id === "premium" && <Shield className="w-8 h-8" />}
                                {tier.id === "gold" && <Briefcase className="w-8 h-8" />}
                                {tier.id === "ultimate" && <Crown className="w-8 h-8" />}
                            </div>
                            <h2 className={`text-2xl font-bold mb-2 ${tier.textColor}`}>{tier.name}</h2>
                            <p className="text-4xl font-extrabold mb-4">{tier.price}</p>
                            
                            <ul className="text-sm text-secondary-text space-y-2 mb-6 text-left w-full">
                                {tier.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
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
                                        setSelectedTier(tier.id as any);
                                        setIsPaymentModalOpen(true);
                                    }}
                                    className={`mt-auto w-full py-3 rounded-xl font-bold ${tier.bgColor.replace('/10', '/30').replace('bg-', 'hover:bg-')} ${tier.textColor.replace('text-', 'bg-')} text-primary-bg transition-colors`}
                                >
                                    {tier.buttonText}
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            </main>

            <PaymentModal 
                isOpen={isPaymentModalOpen} 
                onClose={() => setIsPaymentModalOpen(false)} 
                upgradeToTier={selectedTier} 
            />
        </div>
    );
}
