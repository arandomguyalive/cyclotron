"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Shield, Database, LogOut, ChevronRight, ChevronLeft, User, EyeOff, Clock, Fingerprint, CameraOff, Lock, Crown, Cpu } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSonic } from "@/lib/SonicContext";
import { EditProfileModal } from "./EditProfileModal";
import { ThemeSelectorModal } from "./ThemeSelectorModal";
import { useUser, UserProfile } from "@/lib/UserContext";
import { useRouter } from "next/navigation";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsView = 'main' | 'privacy' | 'appearance';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { playClick, playHaptic } = useSonic();
  const { user, updateUser, logout } = useUser();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const router = useRouter();

  // Handlers to update state in Firestore
  const handleToggle = async (field: keyof NonNullable<UserProfile['privacy']>, currentState: boolean) => {
    if (!user) return;
    const newState = !currentState;
    
    playClick(newState ? 660 : 440, 0.05, 'sine');
    playHaptic();

    await updateUser({
        privacy: {
            ...(user.privacy || {
                ghostMode: false,
                bioLock: false,
                screenshotAlert: true,
                dataSaver: false,
                selfDestructTimer: "24h"
            }),
            [field]: newState
        }
    });
  };

  const handleTimerChange = async (value: string) => {
      if (!user) return;
      await updateUser({
          privacy: {
              ...(user.privacy || {
                  ghostMode: false,
                  bioLock: false,
                  screenshotAlert: true,
                  dataSaver: false,
                  selfDestructTimer: "24h"
              }),
              selfDestructTimer: value
          }
      });
  };

  const handleButtonClick = () => {
    playClick(350, 0.05, 'square');
    playHaptic();
  };

  const handleClose = () => {
    handleButtonClick();
    setCurrentView('main');
    onClose();
  }

  const navigateTo = (view: SettingsView) => {
      handleButtonClick();
      setCurrentView(view);
  }

  const isTester = ['abhi18', 'kinjal18'].includes(user?.handle?.toLowerCase() || '');

  // Tier Access Helpers
  const canAccessGhost = ['professional', 'ultra_elite', 'sovereign'].includes(user?.tier || '');
  const canAccessHardening = ['ultra_elite', 'sovereign'].includes(user?.tier || '');

  const privacy = user?.privacy || {
      ghostMode: false,
      bioLock: false,
      screenshotAlert: true,
      dataSaver: false,
      selfDestructTimer: "24h"
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-primary-bg/60 backdrop-blur-sm z-[190]"
          />
          
          {/* Modal Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[200] bg-secondary-bg border-t border-border-color rounded-t-3xl h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-4 pb-2" onClick={handleClose}>
                <div className="w-16 h-1.5 bg-border-color/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-border-color flex items-center justify-between bg-primary-bg">
                <div className="flex items-center gap-2">
                    {currentView !== 'main' && (
                        <button onClick={() => navigateTo('main')} className="mr-2 -ml-2 p-1 hover:bg-secondary-bg rounded-full">
                            <ChevronLeft className="w-6 h-6 text-primary-text" />
                        </button>
                    )}
                    <h2 className="text-xl font-bold text-primary-text">
                        {currentView === 'main' ? 'Settings' : (currentView === 'privacy' ? 'Privacy & Security' : 'Appearance')}
                    </h2>
                </div>
                <button onClick={handleClose} className="p-2 bg-secondary-bg/5 rounded-full hover:bg-secondary-bg/10 transition-colors">
                    <X className="w-5 h-5 text-secondary-text" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {currentView === 'main' && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                        {/* Section: Account */}
                        <Section title="Account">
                            <SettingItem 
                                icon={User} 
                                label="Edit Profile" 
                                value={user?.handle || 'Guest'} 
                                onClick={() => {
                                    handleButtonClick();
                                    setIsEditProfileOpen(true);
                                }} 
                            />
                            <SettingItem 
                                icon={Crown} 
                                label="Upgrade Account" 
                                onClick={() => {
                                    handleButtonClick();
                                    router.push("/upgrade");
                                }} 
                                isPaid={user?.tier !== 'lobby'} // Indicate if already paid
                            />
                            {user?.tier === 'sovereign' && (
                                <SettingItem 
                                    icon={Crown} 
                                    label="Sovereign Console" 
                                    onClick={() => {
                                        handleButtonClick();
                                        router.push("/sovereign");
                                    }} 
                                />
                            )}
                        </Section>

                        {/* Categories */}
                        <div className="grid grid-cols-1 gap-4">
                            <button onClick={() => navigateTo('privacy')} className="flex items-center justify-between p-6 bg-primary-bg border border-border-color rounded-2xl hover:border-accent-1/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-accent-1/10 text-accent-1 rounded-full group-hover:bg-accent-1/20 transition-colors">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-lg font-bold text-primary-text">Privacy & Security</span>
                                        <span className="text-xs text-secondary-text">Ghost Mode, Bio-Lock, TTL</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-secondary-text group-hover:text-accent-1" />
                            </button>

                            <button onClick={() => navigateTo('appearance')} className="flex items-center justify-between p-6 bg-primary-bg border border-border-color rounded-2xl hover:border-accent-2/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-accent-2/10 text-accent-2 rounded-full group-hover:bg-accent-2/20 transition-colors">
                                        <Moon className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-lg font-bold text-primary-text">Appearance</span>
                                        <span className="text-xs text-secondary-text">Themes, UI Density</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-secondary-text group-hover:text-accent-2" />
                            </button>
                        </div>

                        {/* Section: ARCHITECT CORE (Owners Only) */}
                        {isTester && (
                            <div className="pt-4 space-y-6">
                                <div className="p-6 rounded-3xl bg-brand-cyan/5 border border-brand-cyan/30 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                                        <Cpu className="w-20 h-20 text-brand-cyan" />
                                    </div>
                                    <h3 className="text-sm font-black text-brand-cyan uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Cpu className="w-4 h-4" />
                                        Architect Core
                                    </h3>
                                    
                                    <div className="space-y-4 relative z-10">
                                        {/* Tier Simulator */}
                                        <div>
                                            <label className="text-[10px] font-bold text-secondary-text uppercase tracking-widest block mb-2 ml-1">Simulate Identity Tier</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(["lobby", "shield", "professional", "ultra_elite", "sovereign"] as const).map((t) => (
                                                    <button
                                                        key={t}
                                                        onClick={() => {
                                                            if (user) {
                                                                updateUser({ tier: t });
                                                                handleButtonClick();
                                                            }
                                                        }}
                                                        className={`px-2 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                                                            user?.tier === t 
                                                                ? "bg-brand-cyan text-black border-brand-cyan shadow-[0_0_10px_#00D4E5]" 
                                                                : "bg-black/40 text-secondary-text border-white/5 hover:border-brand-cyan/50"
                                                        }`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Power Controls */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => {
                                                    if (user) {
                                                        updateUser({ 
                                                            "stats.credits": 999999,
                                                            "stats.reputation": 9999 
                                                        });
                                                        handleButtonClick();
                                                        alert("ARCHITECT STATS FORGED: ∞ Credits / MAX Rep");
                                                    }
                                                }}
                                                className="py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase hover:bg-white/10 transition-colors"
                                            >
                                                Forge Stats
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (user) {
                                                        updateUser({ tier: "sovereign", isBlacklist: true });
                                                        handleButtonClick();
                                                    }
                                                }}
                                                className="py-3 rounded-xl bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan text-[10px] font-bold uppercase hover:bg-brand-cyan/30 transition-colors"
                                            >
                                                Restore Sovereign
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (user) {
                                                    updateUser({ isBlacklist: !user.isBlacklist });
                                                    handleButtonClick();
                                                }
                                            }}
                                            className={`w-full py-3 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                                                user?.isBlacklist 
                                                    ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                                                    : "bg-black/40 text-secondary-text border-white/5 hover:border-amber-500/50"
                                            }`}
                                        >
                                            {user?.isBlacklist ? "Blacklist Active" : "Inject Blacklist Clearance"}
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    onClick={async () => {
                                        handleButtonClick();
                                        try {
                                            const { doc, setDoc } = await import("firebase/firestore");
                                            const { db } = await import("@/lib/firebase");
                                            
                                            // Seed Abhi Tester
                                            await setDoc(doc(db, "users", "tester-abhi"), {
                                                displayName: "Abhi Tester",
                                                handle: "ABHI18",
                                                email: "abhi18@abhed.network",
                                                phoneNumber: "+911818181818",
                                                bio: "KM18 System Validator",
                                                avatarSeed: "Abhi",
                                                faction: "Ghost",
                                                tier: "sovereign",
                                                isBlacklist: true,
                                                isOwner: true,
                                                stats: { following: 0, followers: 0, likes: 0, credits: 1000, reputation: 100 }
                                            });

                                            // Seed Kinjal Tester
                                            await setDoc(doc(db, "users", "tester-kinjal"), {
                                                displayName: "Kinjal Tester",
                                                handle: "KINJAL18",
                                                email: "kinjal18@abhed.network",
                                                phoneNumber: "+911818181819",
                                                bio: "KM18 System Validator",
                                                avatarSeed: "Kinjal",
                                                faction: "Netrunner",
                                                tier: "sovereign",
                                                isBlacklist: true,
                                                isOwner: true,
                                                stats: { following: 0, followers: 0, likes: 0, credits: 1000, reputation: 100 }
                                            });

                                            alert("Owner identities synced with Registry. Relogin may be required for full effect.");
                                        } catch (e: unknown) {
                                            console.error(e);
                                            alert("Failed to seed users.");
                                        }
                                    }}
                                    className="w-full py-4 flex items-center justify-center gap-2 text-accent-2 bg-accent-2/10 rounded-xl border border-accent-2/20 hover:bg-accent-2/20 transition-colors"
                                >
                                    <Database className="w-5 h-5" />
                                    <span className="font-bold">Sync Owner Identities</span>
                                </button>
                            </div>
                        )}

                        <div className="pt-4">
                            <button 
                                onClick={() => {
                                    handleButtonClick();
                                    logout();
                                    onClose();
                                    router.push("/login");
                                }}
                                className="w-full py-4 flex items-center justify-center gap-2 text-brand-orange bg-brand-orange/10 rounded-xl border border-brand-orange/20 hover:bg-brand-orange/20 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-bold">Log Out</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                {currentView === 'privacy' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                        <Section title="Anonymity">
                            {canAccessGhost ? (
                                <SettingItem 
                                    icon={EyeOff} 
                                    label="Ghost Mode" 
                                    toggle 
                                    isEnabled={privacy.ghostMode} 
                                    onClick={() => handleToggle('ghostMode', privacy.ghostMode)} 
                                />
                            ) : (
                                <div className="p-4 rounded-2xl border border-dashed border-border-color flex items-center justify-between opacity-50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-secondary-bg rounded-full text-secondary-text"><EyeOff className="w-5 h-5"/></div>
                                        <span className="text-sm font-bold text-secondary-text">Ghost Mode (Locked)</span>
                                    </div>
                                    <Lock className="w-4 h-4 text-secondary-text" />
                                </div>
                            )}
                            
                            <SettingItem 
                                icon={Clock} 
                                label="Default Message TTL" 
                                value={privacy.selfDestructTimer}
                                onClick={() => {
                                    handleButtonClick();
                                    const next = privacy.selfDestructTimer === "24h" ? "1h" : (privacy.selfDestructTimer === "1h" ? "5m" : "24h");
                                    handleTimerChange(next);
                                }} 
                            />
                        </Section>
                        
                        <Section title="Hardening">
                            {canAccessHardening ? (
                                <>
                                    <SettingItem 
                                        icon={Fingerprint} 
                                        label="Bio-Lock" 
                                        toggle 
                                        isEnabled={privacy.bioLock} 
                                        onClick={() => handleToggle('bioLock', privacy.bioLock)} 
                                        isPaid 
                                    />
                                    <SettingItem 
                                        icon={CameraOff} 
                                        label="Screenshot Alert" 
                                        toggle 
                                        isEnabled={privacy.screenshotAlert} 
                                        onClick={() => handleToggle('screenshotAlert', privacy.screenshotAlert)} 
                                    />
                                    <SettingItem 
                                        icon={CameraOff} 
                                        label="Test Alert (Simulate)" 
                                        onClick={() => {
                                            handleButtonClick();
                                            // Dispatch synthetic event to test the notification logic
                                            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'PrintScreen' }));
                                        }} 
                                    />
                                    <SettingItem 
                                        icon={Lock} 
                                        label="Burner Key" 
                                        value="Active"
                                        onClick={() => handleButtonClick()} 
                                        isPaid
                                    />
                                </>
                            ) : (
                                <div className="p-4 rounded-2xl bg-secondary-bg/10 border border-border-color text-center">
                                    <p className="text-xs text-secondary-text mb-2">Advanced Security Protocols require Ultra Elite clearance.</p>
                                    <button onClick={() => router.push("/upgrade")} className="text-xs font-bold text-accent-1 hover:underline">UPGRADE NOW</button>
                                </div>
                            )}
                        </Section>
                    </motion.div>
                )}

                {currentView === 'appearance' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                        <Section title="Interface">
                            <SettingItem 
                                icon={Moon} 
                                label="Theme Engine" 
                                onClick={() => {
                                    handleButtonClick();
                                    setIsThemeSelectorOpen(true);
                                }} 
                            />
                            <SettingItem 
                                icon={Database} 
                                label="Data Saver" 
                                toggle 
                                isEnabled={privacy.dataSaver}
                                onClick={() => handleToggle('dataSaver', privacy.dataSaver)} 
                            />
                        </Section>
                    </motion.div>
                )}
                
                <div className="text-center text-xs text-secondary-text pt-8">
                    ABHED v1.0.0 {/* Powered by KM18 */}
                </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    
    <EditProfileModal 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
    />
    <ThemeSelectorModal
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
    />
    </>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-secondary-text uppercase tracking-wider ml-2">{title}</h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

function SettingItem({ 
  icon: Icon, 
  label, 
  value, 
  toggle, 
  isEnabled, 
  isPaid, 
  onClick 
}: { 
  icon: React.ElementType, 
  label: string, 
  value?: string, 
  toggle?: boolean, 
  isEnabled?: boolean, 
  isPaid?: boolean, 
  onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-primary-bg rounded-2xl border border-border-color hover:border-accent-1/30 transition-colors active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-secondary-bg rounded-full text-secondary-text">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col items-start">
            <span className="font-medium text-primary-text flex items-center gap-2">
                {label}
                {isPaid && <span className="px-1.5 py-0.5 bg-accent-1/20 text-accent-1 text-[10px] rounded font-bold uppercase">Pro</span>}
            </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-secondary-text">{value}</span>}
        {toggle && (
           <div className={`w-12 h-6 rounded-full relative transition-colors ${isEnabled ? "bg-accent-1" : "bg-secondary-bg"}`}>
               <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${isEnabled ? "left-7" : "left-1"}`} />
           </div>
        )}
        {!toggle && !value && <ChevronRight className="w-5 h-5 text-secondary-text/50" />}
      </div>
    </button>
  );
}
