"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Shield, Database, LogOut, ChevronRight, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSonic } from "@/lib/SonicContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { playClick } = useSonic();

  const handleButtonClick = () => {
    playClick(350, 0.05, 'square');
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const handleClose = () => {
    handleButtonClick();
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          
          {/* Modal Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-cyber-black border-t border-white/10 rounded-t-3xl h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-4 pb-2" onClick={handleClose}>
                <div className="w-16 h-1.5 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <button onClick={handleClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Section: Account */}
                <Section title="Account">
                    <SettingItem icon={User} label="Edit Profile" value="neon_genesis" onClick={handleButtonClick} />
                    <SettingItem icon={Shield} label="Privacy & Security" onClick={handleButtonClick} />
                </Section>

                {/* Section: Appearance */}
                <Section title="Appearance">
                    <SettingItem icon={Moon} label="Theme" value="Cyber Dark" onClick={handleButtonClick} />
                    <SettingItem icon={Database} label="Data Saver" toggle onClick={handleButtonClick} />
                </Section>

                {/* Section: Danger Zone */}
                <div className="pt-4">
                     <button 
                        onClick={handleButtonClick}
                        className="w-full py-4 flex items-center justify-center gap-2 text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors"
                     >
                        <LogOut className="w-5 h-5" />
                        <span className="font-bold">Log Out</span>
                     </button>
                </div>
                
                <div className="text-center text-xs text-gray-600 pt-8">
                    Cyclotron v0.1.0 (Alpha)
                </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-cyber-blue uppercase tracking-wider">{title}</h3>
            <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/5 divide-y divide-white/5">
                {children}
            </div>
        </div>
    )
}

function SettingItem({ icon: Icon, label, value, toggle, onClick }: { icon: any, label: string, value?: string, toggle?: boolean, onClick: () => void }) {
    const [isEnabled, setIsEnabled] = useState(false);

    const handleClick = () => {
        onClick(); // Play sound and vibrate
        if (toggle) {
            setIsEnabled(!isEnabled);
        }
    };

    return (
        <button 
            onClick={handleClick}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-cyber-blue/10 rounded-lg">
                    <Icon className="w-5 h-5 text-cyber-blue" />
                </div>
                <span className="text-white font-medium">{label}</span>
            </div>
            
            <div className="flex items-center gap-2">
                {value && <span className="text-sm text-gray-500">{value}</span>}
                
                {toggle ? (
                    <div className={cn("w-10 h-6 rounded-full relative transition-colors", isEnabled ? "bg-cyber-blue" : "bg-gray-700")}>
                        <motion.div 
                            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            animate={{ x: isEnabled ? 16 : 0 }}
                        />
                    </div>
                ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
            </div>
        </button>
    )
}
