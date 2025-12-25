"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Radar, MapPin, User, ArrowRight, Package, PackageOpen, CheckCircle, Camera } from "lucide-react";
import { collection, query, where, getDocs, limit, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSonic } from "@/lib/SonicContext";
import { useUser } from "@/lib/UserContext";
import { useToast } from "@/lib/ToastContext";
import { Post } from "@/components/feed/VortexItem";

interface SignalPost extends Post {
    arX: number;
    arY: number;
}

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRegion: string;
}

export function ScannerModal({ isOpen, onClose, userRegion = "global" }: ScannerModalProps) {
  const [signals, setSignals] = useState<SignalPost[]>([]);
  const [scanning, setScanning] = useState(true);
  const [arMode, setArMode] = useState(false);
  const { playClick } = useSonic();
  const { user, updateUser } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setScanning(true);
      setSignals([]);
      playClick(800, 0.5, 'sine'); // Long scan sound

      const scan = async () => {
        // Simulate scanning delay for immersion
        setTimeout(async () => {
            try {
                // Query posts matching the region OR global
                // Note: Firestore doesn't support OR across fields easily without multiple queries
                const qRegion = query(
                    collection(db, "posts"), 
                    where("region", "==", userRegion.toLowerCase()),
                    limit(15)
                );
                const qGlobal = query(
                    collection(db, "posts"), 
                    where("region", "==", "global"),
                    limit(15)
                );

                const [snapRegion, snapGlobal] = await Promise.all([getDocs(qRegion), getDocs(qGlobal)]);
                
                // Combine and deduplicate
                const allDocs = [...snapRegion.docs, ...snapGlobal.docs];
                const uniqueIds = new Set();
                const found: SignalPost[] = [];

                allDocs.forEach(doc => {
                    if (!uniqueIds.has(doc.id)) {
                        uniqueIds.add(doc.id);
                        found.push({
                            id: doc.id,
                            ...doc.data(),
                            arX: Math.random() * 80 + 10,
                            arY: Math.random() * 60 + 20,
                        } as SignalPost);
                    }
                });

                setSignals(found);
            } catch (e) {
                console.error("Scanner failed to query signals", e);
            } finally {
                setScanning(false);
                playClick(440, 0.1, 'square'); 
            }
        }, 2000);
      };
      scan();
    }
  }, [isOpen, userRegion, playClick]);

  const handleClaim = async (signal: SignalPost) => {
      if (!user) return;
      playClick(600, 0.1, 'square');
      
      try {
          // 1. Delete the drop (simulate consuming it)
          await deleteDoc(doc(db, "posts", signal.id));
          
          // 2. Award Rewards
          const currentRep = user.stats.reputation || 0;
          const currentCreds = user.stats.credits || 0;
          
          updateUser({
              stats: {
                  ...user.stats,
                  reputation: currentRep + 20,
                  credits: currentCreds + 100
              }
          });

          // 3. Update local state
          setSignals(prev => prev.filter(s => s.id !== signal.id));
          
          toast("Dead Drop Claimed: +100 Credits", "success");
          playClick(880, 0.3, 'triangle');

      } catch (e) {
          console.error("Failed to claim drop", e);
          toast("Signal Lost. Claim failed.", "error");
      }
  };

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
            <div className="w-full max-w-md bg-secondary-bg/90 border border-brand-cyan/30 rounded-3xl overflow-hidden pointer-events-auto shadow-[0_0_50px_rgba(0,212,229,0.1)] relative h-[600px] flex flex-col">
              
              {/* Radar/AR Background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {arMode ? (
                      // Simulated AR Feed
                      <div className="absolute inset-0 bg-black">
                          <img 
                            src="https://images.unsplash.com/photo-1518544806352-06b3e1b78346?q=80&w=500&auto=format&fit=crop" 
                            className="w-full h-full object-cover opacity-30 mix-blend-screen filter grayscale blur-sm" 
                            alt="AR Feed"
                          />
                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                          {/* Grid Overlay */}
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00D4E522_1px,transparent_1px),linear-gradient(to_bottom,#00D4E522_1px,transparent_1px)] bg-[size:40px_40px]" />
                      </div>
                  ) : (
                      // Radar Background
                      <div className="opacity-10 h-full w-full relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-brand-cyan rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-brand-cyan rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] border border-brand-cyan rounded-full" />
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute top-1/2 left-1/2 w-[250px] h-[250px] bg-gradient-to-r from-brand-cyan/20 to-transparent origin-top-left -translate-y-1/2"
                            style={{ borderBottom: '1px solid var(--color-brand-cyan)' }}
                        />
                      </div>
                  )}
              </div>

              {/* Header */}
              <div className="relative px-6 py-4 border-b border-brand-cyan/20 flex items-center justify-between bg-black/50 z-20">
                <div className="flex items-center gap-2 text-brand-cyan">
                    <Radar className="w-5 h-5 animate-spin-slow" />
                    <h2 className="text-lg font-bold tracking-widest uppercase">{arMode ? 'AR VISUALIZER' : 'LOCAL SCANNER'}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setArMode(!arMode)}
                        className={`p-2 rounded-full transition-colors ${arMode ? 'bg-brand-cyan text-black' : 'hover:bg-white/10 text-white'}`}
                    >
                        <Camera className="w-5 h-5" />
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 relative z-10 overflow-hidden">
                {scanning ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-brand-cyan">
                        <div className="text-4xl font-mono font-bold animate-pulse">SCANNING...</div>
                        <p className="text-xs font-mono tracking-widest opacity-70">TRIANGULATING SIGNALS IN SECTOR {userRegion.toUpperCase()}</p>
                    </div>
                ) : arMode ? (
                    // AR View
                    <div className="relative w-full h-full">
                        {signals.filter((s): s is SignalPost => (s as SignalPost).type === 'drop').map((signal) => (
                            <motion.div
                                key={signal.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, y: [0, -10, 0] }}
                                transition={{ y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
                                style={{ top: `${signal.arY}%`, left: `${signal.arX}%` }}
                                className="absolute flex flex-col items-center cursor-pointer group"
                                onClick={() => handleClaim(signal)}
                            >
                                <div className="w-12 h-12 bg-brand-orange/80 backdrop-blur rounded-xl border-2 border-brand-orange flex items-center justify-center shadow-[0_0_20px_var(--color-brand-orange)] group-hover:scale-110 transition-transform">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <div className="mt-2 px-2 py-1 bg-black/50 backdrop-blur rounded text-[10px] text-brand-orange font-bold uppercase tracking-wider">
                                    {Math.floor(Math.random() * 50)}m
                                </div>
                            </motion.div>
                        ))}
                        
                        {signals.filter((s): s is SignalPost => (s as SignalPost).type === 'drop').length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-white/50 font-mono text-sm">
                                NO ARTIFACTS DETECTED
                            </div>
                        )}
                    </div>
                ) : (
                    // List View
                    <div className="p-6 space-y-4 overflow-y-auto h-full">
                        <div className="flex justify-between items-center text-xs text-secondary-text font-mono mb-2">
                            <span>DETECTED: {signals.length} SIGNALS</span>
                            <span>RANGE: 5KM</span>
                        </div>
                        
                        {signals.map((signal, i) => (
                            <motion.div 
                                key={signal.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-colors group cursor-pointer ${
                                    signal.type === 'drop' 
                                    ? 'bg-brand-orange/10 border-brand-orange/30 hover:bg-brand-orange/20' 
                                    : 'bg-white/5 border-white/10 hover:border-brand-cyan/50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden ${signal.type === 'drop' ? 'bg-brand-orange/20' : 'bg-black border border-white/20'}`}>
                                        {signal.type === 'drop' ? (
                                            <Package className="w-5 h-5 text-brand-orange animate-bounce" />
                                        ) : (
                                            <>
                                                <img src={signal.mediaUrl} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    {signal.mediaType === 'video' ? <div className="w-2 h-2 bg-brand-cyan rounded-full animate-ping" /> : null}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold text-sm ${signal.type === 'drop' ? 'text-brand-orange' : 'text-white group-hover:text-brand-cyan'}`}>
                                                {signal.type === 'drop' ? 'DEAD DROP' : `@${signal.userHandle}`}
                                            </span>
                                            <span className={`text-[10px] border px-1 rounded ${signal.type === 'drop' ? 'text-brand-orange border-brand-orange/30' : 'text-brand-cyan/70 border-brand-cyan/20'}`}>
                                                {Math.floor(Math.random() * 1000)}m
                                            </span>
                                        </div>
                                        <p className="text-xs text-secondary-text line-clamp-1">
                                            {signal.type === 'drop' ? 'Encrypted Supply Crate' : signal.caption}
                                        </p>
                                    </div>
                                </div>
                                
                                {signal.type === 'drop' ? (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClaim(signal);
                                        }}
                                        className="px-3 py-1.5 bg-brand-orange text-white text-[10px] font-bold rounded-lg hover:bg-brand-orange/80 transition-colors"
                                    >
                                        CLAIM
                                    </button>
                                ) : (
                                    <ArrowRight className="w-4 h-4 text-secondary-text group-hover:text-brand-cyan opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                )}
                            </motion.div>
                        ))}

                        {signals.length === 0 && (
                            <div className="text-center text-secondary-text py-8">
                                No signals detected in this sector.
                            </div>
                        )}
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
