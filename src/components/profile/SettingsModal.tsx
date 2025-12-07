"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Shield, Database, LogOut, ChevronRight, User, EyeOff, Clock, Fingerprint, CameraOff } from "lucide-react";
import { useState, useEffect } from "react"; // Added useEffect
import { cn } from "@/lib/utils";
import { useSonic } from "@/lib/SonicContext";
import { EditProfileModal } from "./EditProfileModal";
import { ThemeSelectorModal } from "./ThemeSelectorModal";
import { useUser } from "@/lib/UserContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { playClick } = useSonic();
  const { user } = useUser();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);

  // Privacy Settings States
  const [ghostMode, setGhostMode] = useState(false);
  const [bioLock, setBioLock] = useState(false);
  const [screenshotAlert, setScreenshotAlert] = useState(false);
  const [selfDestructTimer, setSelfDestructTimer] = useState("24h"); // Default

  // Load privacy settings from localStorage
  useEffect(() => {
    setGhostMode(localStorage.getItem('oblivion_ghostMode') === 'true');
    setBioLock(localStorage.getItem('oblivion_bioLock') === 'true');
    setScreenshotAlert(localStorage.getItem('oblivion_screenshotAlert') === 'true');
    const savedTimer = localStorage.getItem('oblivion_selfDestructTimer');
    if (savedTimer) setSelfDestructTimer(savedTimer);
  }, []);

  // Handlers to update state and localStorage
  const handleToggle = (key: string, currentState: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    const newState = !currentState;
    setter(newState);
    localStorage.setItem(key, String(newState));
  };

  const handleSelfDestructChange = (value: string) => {
    setSelfDestructTimer(value);
    localStorage.setItem('oblivion_selfDestructTimer', value);
  };


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
                <h2 className="text-xl font-bold text-primary-text">Settings</h2>
                <button onClick={handleClose} className="p-2 bg-secondary-bg/5 rounded-full hover:bg-secondary-bg/10 transition-colors">
                    <X className="w-5 h-5 text-secondary-text" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
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
                </Section>

                {/* Section: Privacy & Security */}
                <Section title="Privacy & Security">
                    <SettingItem 
                        icon={EyeOff} 
                        label="Ghost Mode" 
                        toggle 
                        isEnabled={ghostMode} 
                        onClick={() => handleToggle('oblivion_ghostMode', ghostMode, setGhostMode)} 
                    />
                    <SettingItem 
                        icon={Clock} 
                        label="Default Message TTL" 
                        value={selfDestructTimer}
                        onClick={() => handleButtonClick()} // Could open a picker modal later
                    />
                    <SettingItem 
                        icon={Fingerprint} 
                        label="Bio-Lock" 
                        toggle 
                        isEnabled={bioLock} 
                        onClick={() => handleToggle('oblivion_bioLock', bioLock, setBioLock)} 
                        isPaid // Mark as paid
                    />
                    <SettingItem 
                        icon={CameraOff} 
                        label="Screenshot Alert" 
                        toggle 
                        isEnabled={screenshotAlert} 
                        onClick={() => handleToggle('oblivion_screenshotAlert', screenshotAlert, setScreenshotAlert)} 
                    />
                </Section>

                {/* Section: Appearance */}
                <Section title="Appearance">
                    <SettingItem 
                        icon={Moon} 
                        label="Theme" 
                        onClick={() => {
                            handleButtonClick();
                            setIsThemeSelectorOpen(true);
                        }} 
                    />
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
