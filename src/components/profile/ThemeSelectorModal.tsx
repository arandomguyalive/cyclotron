"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Save, RefreshCw, Palette, Lock, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/lib/UserContext";
import { useSonic } from "@/lib/SonicContext";
import { useTheme, ThemeName } from "@/lib/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeSelectorModal({ isOpen, onClose }: ThemeSelectorModalProps) {
    const { theme, setTheme, availableThemes, colorMode, toggleColorMode } = useTheme();
    const { playClick, playHaptic } = useSonic();

    const premiumThemes = ['akira', 'vaporwave', 'solar', 'km18_gold'];

    const handleThemeSelect = (selectedTheme: string) => {
        // if (premiumThemes.includes(selectedTheme)) {
        //     playClick(150, 0.1, 'sawtooth'); // Access Denied sound
        //     alert("Access Restricted. Upgrade Clearance.");
        //     return;
        // }
        setTheme(selectedTheme as ThemeName);
        playClick(selectedTheme === theme ? 200 : 500, 0.05, 'triangle'); 
        playHaptic();
    };

    const handleToggleMode = () => {
        toggleColorMode();
        playClick(600, 0.1, 'sine');
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
                        className="fixed inset-0 bg-primary-bg/60 backdrop-blur-sm z-[190]"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="w-full max-w-md bg-secondary-bg border border-border-color rounded-3xl overflow-hidden pointer-events-auto shadow-2xl max-h-[80vh] flex flex-col">
                            
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-border-color flex items-center justify-between bg-primary-bg">
                                <h2 className="text-lg font-bold text-primary-text">Neural Interface Themes</h2>
                                <button onClick={handleClose} className="p-2 hover:bg-secondary-bg rounded-full transition-colors">
                                    <X className="w-5 h-5 text-secondary-text" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-8 overflow-y-auto flex-1 relative">
                                
                                {/* Color Mode Switcher */}
                                <div>
                                    <h3 className="text-xs font-bold text-secondary-text uppercase tracking-wider mb-4 ml-1">System Mode</h3>
                                    <button 
                                        onClick={handleToggleMode}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-primary-bg border border-border-color hover:border-accent-1/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${colorMode === 'light' ? 'bg-amber-100 text-amber-500' : 'bg-indigo-900/30 text-indigo-400'}`}>
                                                {colorMode === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="font-bold text-primary-text">
                                                    {colorMode === 'light' ? "Light Interface" : "Dark Ops"}
                                                </span>
                                                <span className="text-xs text-secondary-text">
                                                    {colorMode === 'light' ? "Clean, high visibility." : "Stealth, low light."}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className={`w-12 h-6 rounded-full relative transition-colors ${colorMode === 'light' ? "bg-amber-400" : "bg-secondary-text/30"}`}>
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${colorMode === 'light' ? "left-7" : "left-1"}`} />
                                        </div>
                                    </button>
                                </div>

                                {/* Themes Grid */}
                                <div className={cn("transition-opacity", colorMode === 'light' ? "opacity-50 pointer-events-none filter blur-sm" : "")}>
                                    
                                    {/* Standard Section */}
                                    <div className="mb-8">
                                        <h3 className="text-xs font-bold text-secondary-text uppercase tracking-wider mb-4 ml-1">Standard Skins</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {availableThemes.filter(t => !premiumThemes.includes(t.name)).map((t) => (
                                                <ThemeCard 
                                                    key={t.name} 
                                                    theme={t} 
                                                    isActive={t.name === theme} 
                                                    onClick={() => handleThemeSelect(t.name)} 
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Premium Section */}
                                    <div>
                                        <h3 className="text-xs font-bold text-accent-1 uppercase tracking-wider mb-4 ml-1 flex items-center gap-2">
                                            High Clearance
                                            <span className="bg-accent-1/20 text-accent-1 px-1.5 rounded text-[10px]">PRO</span>
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {availableThemes.filter(t => premiumThemes.includes(t.name)).map((t) => (
                                                <ThemeCard 
                                                    key={t.name} 
                                                    theme={t} 
                                                    isActive={t.name === theme} 
                                                    onClick={() => handleThemeSelect(t.name)}
                                                    isPremium
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Light Mode Overlay Warning */}
                                {colorMode === 'light' && (
                                    <div className="absolute inset-x-0 bottom-0 top-32 flex items-center justify-center z-10">
                                        <div className="bg-secondary-bg/90 backdrop-blur-md border border-border-color p-4 rounded-xl text-center shadow-2xl max-w-[80%]">
                                            <Moon className="w-8 h-8 text-secondary-text mx-auto mb-2" />
                                            <h4 className="font-bold text-primary-text">Themes Disabled</h4>
                                            <p className="text-xs text-secondary-text mt-1">
                                                Custom skins are only available in Dark Ops mode. Switch back to enable.
                                            </p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function ThemeCard({ theme, isActive, onClick, isPremium }: { theme: { name: ThemeName; colors: { [key: string]: string } }, isActive: boolean, onClick: () => void, isPremium?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 group overflow-hidden bg-primary-bg",
                isActive ? "border-accent-1 shadow-[0_0_15px_var(--color-accent-1)] scale-[1.02]" : "border-border-color hover:border-accent-1/50"
            )}
        >
            <div 
                className="w-full h-20 rounded-lg mb-3 relative overflow-hidden" 
                style={{ 
                    background: `linear-gradient(to bottom right, ${theme.colors['--color-primary-bg']}, ${theme.colors['--color-secondary-bg']})` 
                }} 
            >
                {/* Preview Elements */}
                <div className="absolute top-2 left-2 w-8 h-2 rounded-full" style={{ background: theme.colors['--color-primary-text'] }} />
                <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full border-2" style={{ borderColor: theme.colors['--color-accent-1'] }} />
                
                {/* Gradient Overlay */}
                <div 
                    className="absolute inset-0 opacity-20" 
                    style={{ 
                        background: `linear-gradient(to top right, ${theme.colors['--color-accent-1']}, ${theme.colors['--color-accent-2']})` 
                    }} 
                />
            </div>

            <span className="text-sm font-medium capitalize text-primary-text group-hover:text-accent-1 transition-colors">
                {theme.name.replace('_', ' ')}
            </span>
            
            {isPremium && (
                <div className="absolute top-2 right-2">
                    <Lock className="w-3 h-3 text-accent-1 opacity-50" />
                </div>
            )}
        </button>
    )
}
