"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Settings, Grid, Film, Heart, MessageCircle, ShoppingBag, Wallet, ShieldCheck } from "lucide-react";
import { SettingsModal } from "@/components/profile/SettingsModal";
import { BlacklistCertificate } from "@/components/profile/BlacklistCertificate";
import { useSonic } from "@/lib/SonicContext";
import { useUser } from "@/lib/UserContext";

export default function ProfilePage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [activeTab, setActiveTab] = useState<'grid' | 'likes' | 'wallet'>('grid');
  const { playClick } = useSonic();
  const { user, loading, firebaseUser } = useUser();
  const router = useRouter();
  
  // Parallax Scroll Logic
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  useEffect(() => {
    if (!loading && !firebaseUser) {
        router.push("/login");
    }
  }, [loading, firebaseUser, router]);

  const handleButtonClick = () => {
    playClick(300, 0.05, 'square'); // A softer click for general buttons
    if (navigator.vibrate) {
      navigator.vibrate(20); // Even shorter vibration
    }
  };

  if (loading || !user) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-primary-bg text-accent-1 font-mono animate-pulse">
              LOADING PROFILE DATA...
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-primary-bg text-primary-text pb-24">
      {/* Header / Cover */}
      <div className="h-64 relative bg-gradient-to-r from-accent-2 via-primary-bg to-accent-1 opacity-50 overflow-hidden">
        {user.coverImage ? (
            <motion.img 
                style={{ y, opacity }}
                src={user.coverImage} 
                alt="Cover" 
                className="w-full h-full object-cover scale-110"
            />
        ) : (
            <motion.div 
                style={{ y, opacity }}
                className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay scale-110" 
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-bg/20 to-primary-bg" />
      </div>

      {/* Holo-Profile Card Container */}
      <div className="px-4 -mt-20 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative rounded-3xl bg-secondary-bg/90 border border-border-color backdrop-blur-xl shadow-2xl p-6 overflow-hidden"
          >
              {/* Neon Pulse Glow Border */}
              <motion.div 
                 className="absolute inset-0 rounded-3xl border-2 border-accent-1/60 pointer-events-none"
                 animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.02, 1] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Subtle Background Gradient Animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-accent-1/5 via-transparent to-accent-2/5 pointer-events-none"
                animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />

            <div className="flex justify-between items-end relative z-30">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-28 h-28 rounded-full border-4 border-primary-bg bg-primary-bg overflow-hidden shadow-lg -mb-4"
              >
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed}`} alt="Profile" className="w-full h-full" />
              </motion.div>
              <div className="flex gap-2 mb-2">
                <Link 
                  href="/market" 
                  onClick={handleButtonClick}
                  className="p-2 bg-secondary-bg/10 rounded-full backdrop-blur-md border border-border-color hover:bg-secondary-bg/20 transition-colors shadow-lg cursor-pointer z-50 text-brand-orange"
                >
                  <ShoppingBag className="w-6 h-6" />
                </Link>
                <Link 
                  href="/chat" 
                  onClick={handleButtonClick}
                  className="p-2 bg-secondary-bg/10 rounded-full backdrop-blur-md border border-border-color hover:bg-secondary-bg/20 transition-colors shadow-lg cursor-pointer z-50"
                >
                  <MessageCircle className="w-6 h-6 text-primary-text" />
                </Link>
                <button 
                  onClick={() => {
                    setIsSettingsOpen(true);
                    handleButtonClick();
                  }}
                  className="p-2 bg-secondary-bg/10 rounded-full backdrop-blur-md border border-border-color hover:bg-secondary-bg/20 transition-colors shadow-lg cursor-pointer z-50"
                >
                  <Settings className="w-6 h-6 text-primary-text" />
                </button>
              </div>
            </div>

            <div className="mt-8 relative z-30">
              <h1 className="text-2xl font-bold drop-shadow-md">{user.displayName}</h1>
              <p className="text-accent-1 drop-shadow-sm font-mono text-sm">@{user.handle}</p>
              <p className="mt-2 text-sm text-secondary-text leading-relaxed whitespace-pre-wrap">
                {user.bio}
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-6 py-4 border-y border-border-color relative z-30 overflow-x-auto">
              <Stat label="Following" value={user.stats.following} />
              <Stat label="Followers" value={user.stats.followers} />
              <Stat label="Likes" value={user.stats.likes} />
              <Stat label="Reputation" value={user.stats.reputation || '0'} />
              <Stat label="Credits" value={`${user.stats.credits || '0'} ₵`} />
              
              {user.tier === 'lifetime' && (
                  <button 
                    onClick={() => setShowCertificate(true)}
                    className="flex flex-col items-center justify-center text-amber-500 animate-pulse"
                  >
                      <ShieldCheck className="w-6 h-6 mb-1" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Certificate</span>
                  </button>
              )}
            </div>
          </motion.div>

        {/* Tabs */}
        <div className="flex mt-6 gap-4 border-b border-white/10 pb-2">
          <button 
            onClick={() => { setActiveTab('grid'); handleButtonClick(); }}
            className={`flex-1 py-2 flex justify-center transition-colors ${activeTab === 'grid' ? 'text-accent-1 border-b-2 border-accent-1' : 'text-zinc-500'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => { setActiveTab('likes'); handleButtonClick(); }}
            className={`flex-1 py-2 flex justify-center transition-colors ${activeTab === 'likes' ? 'text-accent-1 border-b-2 border-accent-1' : 'text-zinc-500'}`}
          >
            <Heart className="w-5 h-5" />
          </button>
          <button 
            onClick={() => { setActiveTab('wallet'); handleButtonClick(); }}
            className={`flex-1 py-2 flex justify-center transition-colors ${activeTab === 'wallet' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-zinc-500'}`}
          >
            <Wallet className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4 min-h-[300px]">
            {activeTab === 'grid' && (
                <div className="grid grid-cols-3 gap-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-secondary-bg/5 relative overflow-hidden group rounded-sm">
                        <div className={`absolute inset-0 bg-gradient-to-br ${
                            ['from-pink-500 to-purple-500', 'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500'][i % 3]
                        } opacity-50 group-hover:opacity-80 transition-opacity`}/>
                    </div>
                  ))}
                </div>
            )}

            {activeTab === 'likes' && (
                <div className="flex flex-col items-center justify-center h-48 text-zinc-500 animate-in fade-in zoom-in duration-300">
                    <Heart className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm font-mono uppercase tracking-widest">No signals saved</p>
                </div>
            )}

            {activeTab === 'wallet' && (
                <div className="p-4 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Wallet className="w-24 h-24 text-white" />
                        </div>
                        
                        <h3 className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Total Asset Value</h3>
                        <div className="text-4xl font-mono text-white font-bold mb-6">₹0.00</div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-sm text-zinc-500">Pending Payouts</span>
                                <span className="text-sm font-mono text-zinc-300">₹0.00</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-sm text-zinc-500">Creator Fund</span>
                                <span className="text-sm font-mono text-zinc-300">Active</span>
                            </div>
                        </div>

                        <button className="w-full mt-8 py-3 bg-brand-orange text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors">
                            Withdraw Funds
                        </button>
                        
                        <p className="text-[10px] text-zinc-600 mt-4 text-center">
                            * Withdrawals require Tier 3 Verification. <br/> 
                            Next payout cycle: Dec 31, 2025.
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {showCertificate && user && (
          <BlacklistCertificate 
            handle={user.handle} 
            dateJoined={new Date().toLocaleDateString()} 
            id={firebaseUser?.uid.substring(0, 8).toUpperCase() || 'UNKNOWN'} 
            onClose={() => setShowCertificate(false)} 
          />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col min-w-[60px]">
      <span className="font-bold text-lg whitespace-nowrap">{value}</span>
      <span className="text-xs text-secondary-text uppercase tracking-wider whitespace-nowrap">{label}</span>
    </div>
  );
}