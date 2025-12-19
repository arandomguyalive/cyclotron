"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Loader2, CreditCard, Banknote } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/lib/UserContext";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  upgradeToTier: "premium" | "gold" | "platinum" | "sovereign" | "lifetime";
}

export function PaymentModal({ isOpen, onClose, upgradeToTier }: PaymentModalProps) {
  const { updateUser } = useUser();
  const [paymentStep, setPaymentStep] = useState<"form" | "processing" | "success">("form");

  useEffect(() => {
    if (!isOpen && paymentStep !== 'form') {
      setPaymentStep("form"); // Reset state when closed
    }
  }, [isOpen, paymentStep]);

  const handlePayment = () => {
    setPaymentStep("processing");
    setTimeout(() => {
      setPaymentStep("success");
      
      // Special Handling for Lifetime: Set accessType
      const updates: any = { tier: upgradeToTier };
      if (upgradeToTier === 'lifetime') {
          updates.accessType = 'LIFETIME_BLACKLIST';
      }
      
      // Simulate success and upgrade user
      updateUser(updates);
      setTimeout(onClose, 1500); // Close after success animation
    }, 2000);
  };

  const tierDetails = {
    premium: { name: "The Shield", price: "₹999/mo", color: "text-brand-cyan" },
    gold: { name: "The Professional", price: "₹9,999/mo", color: "text-brand-pale-pink" },
    platinum: { name: "The Ultra Elite", price: "₹99,999/mo", color: "text-white" },
    sovereign: { name: "The Sovereign", price: "₹10,00,000", color: "text-brand-blue" },
    lifetime: { name: "The Blacklist", price: "₹20,000", color: "text-amber-500" },
  }[upgradeToTier] || { name: "Unknown", price: "0", color: "text-gray-500" }; // Fallback

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
              
              {/* Header */}
              <div className="relative px-6 py-4 border-b border-border-color flex items-center justify-center bg-primary-bg">
                <h2 className="text-lg font-bold text-primary-text">KM18 Protocol Payment</h2>
                <button onClick={onClose} className="absolute right-4 p-2 hover:bg-secondary-bg rounded-full transition-colors">
                  <X className="w-5 h-5 text-secondary-text" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto flex flex-col items-center justify-center">
                
                {paymentStep === "form" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-center">
                        <h3 className="text-2xl font-bold text-primary-text mb-2">Upgrade to {tierDetails.name}</h3>
                        <p className={`text-4xl font-extrabold mb-6 ${tierDetails.color}`}>{tierDetails.price}</p>
                        
                        <div className="space-y-3">
                            <button className="w-full py-3 rounded-xl flex items-center justify-center gap-3 bg-accent-1 text-primary-bg font-bold hover:bg-accent-1/90 transition-colors">
                                <CreditCard className="w-5 h-5" />
                                Pay with Chip/Card
                            </button>
                            <button className="w-full py-3 rounded-xl flex items-center justify-center gap-3 bg-secondary-bg border border-border-color text-primary-text font-bold hover:bg-secondary-bg/50 transition-colors">
                                <Banknote className="w-5 h-5" />
                                Pay with Digital Wallet
                            </button>
                            <button onClick={handlePayment} className="w-full py-3 rounded-xl flex items-center justify-center gap-3 bg-accent-2 text-primary-bg font-bold hover:bg-accent-2/90 transition-colors">
                                <CheckCircle2 className="w-5 h-5" />
                                Simulate Payment
                            </button>
                        </div>
                    </motion.div>
                )}

                {paymentStep === "processing" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 animate-spin text-accent-1 mb-4" />
                        <h3 className="text-xl font-bold text-primary-text">Processing Transaction...</h3>
                        <p className="text-sm text-secondary-text">Verifying secure channels.</p>
                    </motion.div>
                )}

                {paymentStep === "success" && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                        <CheckCircle2 className="w-16 h-16 text-brand-cyan mb-4" />
                        <h3 className="text-xl font-bold text-brand-cyan">Upgrade Complete!</h3>
                        <p className="text-sm text-primary-text">Welcome to {tierDetails.name}.</p>
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
