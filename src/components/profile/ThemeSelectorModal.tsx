"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Save, RefreshCw, Palette } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/lib/UserContext";
import { useSonic } from "@/lib/SonicContext";
import { useTheme } from "@/lib/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeSelectorModal({ isOpen, onClose }: ThemeSelectorModalProps) {
    const { theme, setTheme, availableThemes } = useTheme();
    const { playClick } = useSonic();

    const handleThemeSelect = (selectedTheme: string) => {
        setTheme(selectedTheme as any); // Type assertion, as availableThemes are ThemeName
        playClick(selectedTheme === theme ? 200 : 500, 0.05, 'triangle'); // Different sound for changing vs. selecting same
        if (navigator.vibrate) navigator.vibrate(20);
    };

    const handleClose = () => {
        playClick(300, 0.05, 'square');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-primary-bg/60 backdrop-blur-sm z-[80]"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="w-full max-w-md bg-secondary-bg border border-border-color rounded-3xl overflow-hidden pointer-events-auto shadow-2xl">
                            
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-border-color flex items-center justify-between bg-primary-bg">
                                <h2 className="text-lg font-bold text-primary-text">Neural Interface Themes</h2>
                                <button onClick={handleClose} className="p-2 hover:bg-secondary-bg rounded-full transition-colors">
                                    <X className="w-5 h-5 text-secondary-text" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    {availableThemes.map((t) => (
                                        <button
                                            key={t.name}
                                            onClick={() => handleThemeSelect(t.name)}
                                            className={cn(
                                                "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 group",
                                                t.name === theme ? "border-accent-1 shadow-[0_0_15px_var(--color-accent-1)]" : "border-border-color hover:border-accent-1"
                                            )}
                                        >
                                            <div 
                                                className="w-full h-24 rounded-lg mb-2" 
                                                style={{ 
                                                    background: `linear-gradient(to bottom right, ${t.colors['--color-accent-1']}, ${t.colors['--color-accent-2']})` 
                                                }} 
                                            />
                                            <span className="text-sm font-medium capitalize text-primary-text group-hover:text-accent-1 transition-colors">
                                                {t.name}
                                            </span>
                                            {t.name !== "oblivion" && ( // Example: Make 'oblivion' free, others potentially paid
                                                <span className="absolute top-2 right-2 text-xs bg-accent-2/20 text-accent-2 px-2 py-0.5 rounded-full">
                                                    Paid
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {/* TODO: Add section for paid themes unlock */}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
