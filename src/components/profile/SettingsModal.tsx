"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Shield, Database, LogOut, ChevronRight, ChevronLeft, User, EyeOff, Clock, Fingerprint, CameraOff, Lock, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSonic } from "@/lib/SonicContext";
import { EditProfileModal } from "./EditProfileModal";
import { ThemeSelectorModal } from "./ThemeSelectorModal";
import { useUser } from "@/lib/UserContext";
import { useRouter } from "next/navigation";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsView = 'main' | 'privacy' | 'appearance';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { playClick } = useSonic();
  const { user, updateUser } = useUser();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const router = useRouter();

  // Privacy Settings States
  const [ghostMode, setGhostMode] = useState(false);
  const [bioLock, setBioLock] = useState(false);
  const [screenshotAlert, setScreenshotAlert] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [selfDestructTimer, setSelfDestructTimer] = useState("24h"); // Default

  // Load privacy settings from localStorage
  useEffect(() => {
    setGhostMode(localStorage.getItem('oblivion_ghostMode') === 'true');
    setBioLock(localStorage.getItem('oblivion_bioLock') === 'true');
    setScreenshotAlert(localStorage.getItem('oblivion_screenshotAlert') === 'true');
    setDataSaver(localStorage.getItem('oblivion_dataSaver') === 'true');
    const savedTimer = localStorage.getItem('oblivion_selfDestructTimer');
    if (savedTimer) setSelfDestructTimer(savedTimer);
  }, [isOpen]); // Reload when opened to sync

  // Handlers to update state and localStorage
  const handleToggle = (key: string, currentState: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    const newState = !currentState;
    setter(newState);
    localStorage.setItem(key, String(newState));
    playClick(newState ? 660 : 440, 0.05, 'sine');
    
    // Force a storage event for other components to pick up
    window.dispatchEvent(new Event("storage"));
  };

  const handleButtonClick = () => {
    playClick(350, 0.05, 'square');
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
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

  // Tier Access Helpers
  const canAccessGhost = ['gold', 'platinum', 'sovereign'].includes(user?.tier || '');
  const canAccessHardening = ['platinum', 'sovereign'].includes(user?.tier || '');

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
            className="fixed inset-0 bg-primary-bg/60 backdrop-blur-sm z-[60]"
          />
          
          {/* Modal Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-secondary-bg border-t border-border-color rounded-t-3xl h-[85vh] overflow-hidden flex flex-col"
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
                                isPaid={user?.tier !== 'free'} // Indicate if already paid
                            />
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

                        {/* Section: Danger Zone */}
                        <div className="pt-4 space-y-4">
                            <button 
                                onClick={async () => {
                                    handleButtonClick();
                                    try {
                                        const { doc, setDoc } = await import("firebase/firestore");
                                        const { db } = await import("@/lib/firebase");
                                        
                                        // Seed Admin One
                                        await setDoc(doc(db, "users", "admin-one"), {
                                            displayName: "Admin One",
                                            handle: "admin_one",
                                            bio: "Test User 1",
                                            avatarSeed: "Felix",
                                            faction: "Netrunner",
                                            tier: "premium",
                                            stats: { following: "0", followers: "0", likes: "0" }
                                        });

                                        // Seed Admin Two
                                        await setDoc(doc(db, "users", "admin-two"), {
                                            displayName: "Admin Two",
                                            handle: "admin_two",
                                            bio: "Test User 2",
                                            avatarSeed: "Jocelyn",
                                            faction: "Corp",
                                            tier: "gold",
                                            stats: { following: "0", followers: "0", likes: "0" }
                                        });

                                        alert("Test users seeded! 'admin-two' UID copied to clipboard.");
                                        navigator.clipboard.writeText("admin-two");
                                    } catch (e: any) {
                                        console.error(e);
                                        alert(`Failed to seed users: ${e.message}`);
                                    }
                                }}
                                className="w-full py-4 flex items-center justify-center gap-2 text-accent-2 bg-accent-2/10 rounded-xl border border-accent-2/20 hover:bg-accent-2/20 transition-colors"
                            >
                                <Database className="w-5 h-5" />
                                <span className="font-bold">Seed Test Users</span>
                            </button>

                            {/* Tier Simulator */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-secondary-text uppercase tracking-wider ml-2">Simulate Tier</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {(["free", "premium", "gold", "platinum", "sovereign"] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => {
                                                if (user) {
                                                    updateUser({ tier: t });
                                                    handleButtonClick();
                                                }
                                            }}
                                            className={`px-2 py-2 rounded-lg text-xs font-bold uppercase transition-colors border ${
                                                user?.tier === t 
                                                    ? "bg-primary-text text-primary-bg border-primary-text" 
                                                    : "bg-primary-bg text-secondary-text border-border-color hover:border-primary-text"
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleButtonClick}
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
                                    isEnabled={ghostMode} 
                                    onClick={() => handleToggle('oblivion_ghostMode', ghostMode, setGhostMode)} 
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
                                value={selfDestructTimer}
                                onClick={() => handleButtonClick()} 
                            />
                        </Section>
                        
                        <Section title="Hardening">
                            {canAccessHardening ? (
                                <>
                                    <SettingItem 
                                        icon={Fingerprint} 
                                        label="Bio-Lock" 
                                        toggle 
                                        isEnabled={bioLock} 
                                        onClick={() => handleToggle('oblivion_bioLock', bioLock, setBioLock)} 
                                        isPaid 
                                    />
                                    <SettingItem 
                                        icon={CameraOff} 
                                        label="Screenshot Alert" 
                                        toggle 
                                        isEnabled={screenshotAlert} 
                                        onClick={() => handleToggle('oblivion_screenshotAlert', screenshotAlert, setScreenshotAlert)} 
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
                                    <p className="text-xs text-secondary-text mb-2">Advanced Security Protocols require Platinum clearance.</p>
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
                                isEnabled={dataSaver}
                                onClick={() => handleToggle('oblivion_dataSaver', dataSaver, setDataSaver)} 
                            />
                        </Section>
                    </motion.div>
                )}
                
                <div className="text-center text-xs text-secondary-text pt-8">
                    ABHED v1.0.0 <span className="opacity-50">// Powered by KM18</span>
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
  icon: any, 
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
