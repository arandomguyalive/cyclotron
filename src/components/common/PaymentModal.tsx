"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Loader2, CreditCard, Banknote } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser, UserProfile, UserTier } from "@/lib/UserContext";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  upgradeToTier: UserTier;
  billingCycle?: "monthly" | "annual";
  isBlacklistMode?: boolean;
}

export function PaymentModal({ isOpen, onClose, upgradeToTier, billingCycle = "monthly", isBlacklistMode = false }: PaymentModalProps) {
  const { updateUser } = useUser();
  const [paymentStep, setPaymentStep] = useState<"form" | "processing" | "success">("form");

  useEffect(() => {
    if (!isOpen && paymentStep !== 'form') {
      setPaymentStep("form");
    }
  }, [isOpen, paymentStep]);

  const handlePayment = () => {
    setPaymentStep("processing");
    setTimeout(() => {
      setPaymentStep("success");
      
      const updates: Partial<UserProfile> = { 
          tier: upgradeToTier,
          billingCycle: billingCycle 
      };
      
      if (isBlacklistMode) {
          updates.isBlacklist = true;
          updates.accessType = 'LIFETIME_BLACKLIST';
      }
      
      updateUser(updates);
      setTimeout(onClose, 1500);
    }, 2000);
  };

  const getPrice = () => {
      const basePrices: Record<string, number> = {
          shield: 999,
          professional: 9999,
          ultra_elite: 99999,
          sovereign: 1000000
      };
      
      const base = basePrices[upgradeToTier] || 0;
      if (isBlacklistMode) return "₹9,999 (Lifetime)";
      if (upgradeToTier === 'sovereign') return `₹${base.toLocaleString()}`;

      if (billingCycle === 'annual') {
          const total = base * 12 * 0.9;
          return `₹${Math.round(total).toLocaleString()}/yr`;
      }
      return `₹${base.toLocaleString()}/mo`;
  };

  const tierDetails: Record<string, { name: string, color: string }> = {
    shield: { name: "The Shield", color: "text-brand-cyan" },
    professional: { name: isBlacklistMode ? "The Blacklist" : "Professional", color: isBlacklistMode ? "text-amber-500" : "text-brand-hot-pink" },
    ultra_elite: { name: "Ultra Elite", color: "text-white" },
    sovereign: { name: "The Sovereign", color: "text-brand-blue" },
  };

  const currentTier = tierDetails[upgradeToTier] || { name: "Lobby", color: "text-brand-orange" };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-secondary-bg border border-border-color rounded-3xl overflow-hidden pointer-events-auto shadow-2xl">
              
              <div className="relative px-6 py-4 border-b border-border-color flex items-center justify-center bg-primary-bg">
                <h2 className="text-lg font-bold text-primary-text uppercase tracking-widest"><span className="font-blackjack text-2xl normal-case tracking-normal">KM18</span> Protocol Payment</h2>
                <button onClick={onClose} className="absolute right-4 p-2 hover:bg-secondary-bg rounded-full transition-colors">
                  <X className="w-5 h-5 text-secondary-text" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto flex flex-col items-center justify-center">
                
                {paymentStep === "form" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-center">
                        <h3 className="text-2xl font-bold text-primary-text mb-2 tracking-tight">Request Clearance</h3>
                        <p className={`text-4xl font-black mb-6 ${currentTier.color}`}>{getPrice()}</p>
                        
                        <div className="space-y-3">
                            <button className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-brand-cyan transition-colors">
                                <CreditCard className="w-5 h-5" />
                                Secure Card Link
                            </button>
                            <button onClick={handlePayment} className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 bg-secondary-bg border border-border-color text-primary-text font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-colors">
                                <CheckCircle2 className="w-5 h-5 text-brand-cyan" />
                                Protocol Bypass
                            </button>
                        </div>
                    </motion.div>
                )}

                {paymentStep === "processing" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8">
                        <Loader2 className="w-16 h-16 animate-spin text-brand-cyan mb-4" />
                        <h3 className="text-xl font-bold text-primary-text uppercase tracking-widest font-mono">Verifying Protocols...</h3>
                        <p className="text-[10px] text-secondary-text mt-2 uppercase tracking-widest">Communicating with <span className="font-blackjack text-lg normal-case tracking-normal">KM18</span> Neural Registry</p>
                    </motion.div>
                )}

                {paymentStep === "success" && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-8">
                        <div className="w-20 h-20 bg-brand-cyan/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,212,229,0.3)]">
                            <CheckCircle2 className="w-12 h-12 text-brand-cyan" />
                        </div>
                        <h3 className="text-2xl font-black text-brand-cyan uppercase tracking-tighter italic">Clearance Granted</h3>
                        <p className="text-xs text-primary-text mt-2 font-mono">Welcome to the <span className="font-blackjack text-lg normal-case tracking-normal">KM18</span> {currentTier.name} Protocol.</p>
                    </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}