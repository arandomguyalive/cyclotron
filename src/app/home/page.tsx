"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { motion } from "framer-motion";
import { StoriesTray } from "@/components/feed/StoriesTray";
import { SignalGrid } from "@/components/home/SignalGrid";
import { FrequencyTuner } from "@/components/home/widgets/FrequencyTuner";
import { DailyDirective } from "@/components/home/widgets/DailyDirective";
import { SystemTerminal } from "@/components/home/widgets/SystemTerminal";
import { TrendingTags } from "@/components/home/widgets/TrendingTags";
import { Activity, Zap, Shield, Globe, Lock, AlertTriangle, Eye, Server, Radio, Signal, Wifi, Ghost } from "lucide-react";

export default function HomePage() {
  const { user, firebaseUser, loading } = useUser();
  const router = useRouter();
  const [ghostMode, setGhostMode] = useState(false);

  // Protect the route and sync Ghost Mode
  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push("/login");
    }

    // Initial check
    setGhostMode(localStorage.getItem('oblivion_ghostMode') === 'true');

    // Listener for changes from SettingsModal
    const handleStorageChange = () => {
        setGhostMode(localStorage.getItem('oblivion_ghostMode') === 'true');
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);

  }, [loading, firebaseUser, router]);

  if (loading || !firebaseUser || !user) return null;

  const tier = user.tier || "free";

    // Tier-Specific Config

    const config = {

        free: {

            color: "text-rose-500",

            bgColor: "bg-rose-500/5",

            borderColor: "border-rose-500/20",

            signalText: "BASIC",

            signalValue: 40,

            label: "STANDARD",

        },

        premium: {

            color: "text-sky-400",

            bgColor: "bg-sky-400/10",

            borderColor: "border-sky-400/20",

            signalText: "STRONG",

            signalValue: 85,

            label: "SECURED",

        },

        gold: {

            color: "text-amber-400",

            bgColor: "bg-amber-400/10",

            borderColor: "border-amber-400/20",

            signalText: "OPTIMAL",

            signalValue: 98,

            label: "FORTIFIED",

        },

              platinum: {

                  color: "text-white",

                  bgColor: "bg-white/10",

                  borderColor: "border-white/20",

                  signalText: "MAXIMUM",

                  signalValue: 100,

                  label: "IMPERVIOUS",

              },

              sovereign: {

                  color: "text-amber-200", // Soft Gold

                  bgColor: "bg-black",

                  borderColor: "border-amber-500/50",

                  signalText: "OMNIPOTENT",

                  signalValue: 100,

                  label: "SOVEREIGN",

              }

          }[tier];

        

          return (

            <div className="min-h-screen bg-primary-bg text-primary-text pb-20 relative overflow-hidden font-sans">

              {/* Dynamic Background */}

              <div className={`absolute inset-0 pointer-events-none opacity-20 blur-3xl transition-colors duration-1000 ${

                  tier === 'free' ? 'bg-[radial-gradient(circle_at_top_right,var(--color-secondary-text)_0%,transparent_40%)]' :

                  tier === 'premium' ? 'bg-[radial-gradient(circle_at_top_right,sky_0%,transparent_40%)]' :

                  tier === 'gold' ? 'bg-[radial-gradient(circle_at_top_right,amber_0%,transparent_40%)]' :

                  tier === 'platinum' ? 'bg-[radial-gradient(circle_at_top_right,white_0%,transparent_40%)]' :

                  'bg-[radial-gradient(circle_at_top_right,#000000_0%,transparent_40%)]' // Sovereign: Deep Black/Void

              }`} />

        

        {/* Noise Overlay (Subtle) */}

        <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-screen opacity-[0.03]" />

  

        {/* Header */}

        <header className="px-6 py-4 pt-safe-area-top flex items-center justify-between sticky top-0 z-50 bg-primary-bg/80 backdrop-blur-md border-b border-border-color/50">

          <div>

             <h1 className="text-xl font-bold tracking-tight text-primary-text">HOME</h1>

             <div className="flex items-center gap-2">

                 {ghostMode ? (

                     <div className="flex items-center gap-1 text-accent-1 animate-pulse">

                         <Ghost className="w-3 h-3" />

                         <span className="text-xs font-medium uppercase tracking-widest">UNTRACEABLE</span>

                     </div>

                 ) : (

                     <span className="text-xs text-secondary-text font-medium uppercase tracking-widest">

                        {user?.handle}

                     </span>

                 )}

                                {/* Compact Privacy Badge */}

                                <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${config.bgColor} ${config.color} border ${config.borderColor}`}>

                                    <Shield className="w-3 h-3" />

                                    <span>{config.label}</span>

                                </div>

                            </div>

                         </div>

                       </header>

                 

                       {/* Main Content Area */}

                       <main className="p-6 space-y-8">

                         

                         {/* Stories Tray (Expanded) */}

                         <StoriesTray />

                 

                         {/* Privacy Score Widget (Replaces Security Status) */}

                         <motion.div 

                             initial={{ opacity: 0, y: 20 }}

                             animate={{ opacity: 1, y: 0 }}

                             className={`p-6 rounded-3xl ${config.bgColor} border ${config.borderColor} relative overflow-hidden`}

                         >

                              <div className="absolute top-0 right-0 p-4 opacity-10">

                                  <Shield className={`w-24 h-24 ${config.color}`} />

                              </div>

                              

                              <div className="relative z-10">

                                  <div className="flex items-center gap-2 mb-4">

                                      <Activity className={`w-5 h-5 ${config.color}`} />

                                      <h2 className={`text-xl font-bold ${config.color} tracking-tight`}>Privacy Score</h2>

                                  </div>

                                  

                                  {/* Visual Bar Graph */}

                                  <div className="flex items-end gap-1 h-12 mb-4">

                                      {[...Array(10)].map((_, i) => (

                                          <div 

                                             key={i} 

                                             className={`flex-1 rounded-sm transition-all duration-500 ${

                                                 i < config.signalValue / 10 

                                                     ? config.color.replace('text-', 'bg-') 

                                                     : 'bg-secondary-bg/20'

                                             }`}

                                             style={{ height: `${(i + 1) * 10}%` }}

                                          />

                                      ))}

                                  </div>

                                  

                                  <div className="flex items-center justify-between">

                                      <span className={`text-2xl font-bold ${config.color}`}>{config.signalValue}%</span>

                                      <span className={`text-xs font-medium uppercase tracking-widest ${config.color} opacity-80`}>

                                          {config.signalText}

                                      </span>

                                  </div>

                                  

                                  {tier === 'free' && (

                                      <p className="mt-4 text-xs text-secondary-text border-t border-border-color pt-2 flex items-center gap-2">

                                          <span className="font-bold text-accent-1">TIP:</span> Your digital footprint is visible. Upgrade to mask it.

                                      </p>

                                  )}

                              </div>

                         </motion.div>

                 

                         {/* Feed Filter (Frequency Tuner) */}

                         <div className="space-y-4">

                             <div className="relative">

                                 <span className="absolute -top-3 left-2 text-[10px] bg-primary-bg px-2 text-secondary-text uppercase tracking-widest z-10">

                                     Frequency

                                 </span>

                                 <FrequencyTuner />

                             </div>

                             

                             {/* Trending Tags */}

                             <TrendingTags />

                         </div>

      

              {/* The Signal Grid (Social Feed) */}

              <SignalGrid />

      

              {/* Quick Actions Grid */}

              <div className="grid grid-cols-2 gap-4">

                  

                  {/* Daily Directive (Gamified Task) - Spans 2 cols */}

                  <div className="col-span-2">

                      <DailyDirective />

                  </div>

                  

                  {/* 1. Vortex Access (All Tiers) */}
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/vortex")}
                className={`p-6 rounded-3xl border transition-all group text-left ${
                    tier === 'free' 
                    ? 'bg-secondary-bg/30 border-border-color' 
                    : `bg-gradient-to-br from-${config.color.split('-')[1]}-500/10 to-transparent ${config.borderColor}`
                }`}
            >
                <Zap className={`w-8 h-8 mb-3 group-hover:scale-110 transition-transform ${config.color}`} />
                <h3 className="font-bold text-lg">Vortex</h3>
                <p className="text-xs text-secondary-text mt-1">Global Feed.</p>
            </motion.button>

            {/* 2. Tier Specific Widget */}
            {tier === 'free' && (
                <div className="p-6 rounded-3xl bg-secondary-bg/30 border border-border-color flex flex-col justify-center items-center text-center">
                    <Lock className="w-8 h-8 text-secondary-text mb-3" />
                    <h3 className="font-bold text-lg text-secondary-text">Locked</h3>
                    <p className="text-[10px] text-secondary-text mt-1 uppercase">Upgrade to Access</p>
                </div>
            )}

            {(tier === 'premium' || tier === 'gold') && (
                <div className={`p-6 rounded-3xl ${config.bgColor} border ${config.borderColor} text-left relative overflow-hidden`}>
                     <Radio className={`w-8 h-8 mb-3 ${config.color}`} />
                     <h3 className="font-bold text-lg">Scanner</h3>
                     <p className="text-xs text-secondary-text mt-1">Local signals.</p>
                     {/* Fake Scanning Animation */}
                     <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${config.color.replace('text', 'bg')} animate-ping`} />
                </div>
            )}

                        {(tier === 'platinum' || tier === 'sovereign') && (
                            <div className={`p-6 rounded-3xl ${config.bgColor} border ${config.borderColor} text-left`}>
                                 <Server className={`w-8 h-8 mb-3 ${config.color}`} />
                                 <h3 className="font-bold text-lg">The Vault</h3>
                                 <p className="text-xs text-secondary-text mt-1">Secure Storage.</p>
                            </div>
                        )}
                        
                        {/* 3. Global Stats (Gold+) */}
                        {['gold', 'platinum', 'sovereign'].includes(tier) && (
                             <div className="col-span-2 p-4 rounded-2xl bg-secondary-bg/30 border border-border-color flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                     <Globe className="w-5 h-5 text-secondary-text" />                         <div>
                             <p className="text-xs text-secondary-text uppercase">Global Signals</p>
                             <p className="font-mono font-bold">8,492</p>
                         </div>
                     </div>
                     <div className="h-8 w-[1px] bg-border-color" />
                     <div className="flex items-center gap-3">
                         <Activity className="w-5 h-5 text-secondary-text" />
                         <div>
                             <p className="text-xs text-secondary-text uppercase">Net Stability</p>
                             <p className="font-mono font-bold text-green-400">98.4%</p>
                         </div>
                     </div>
                 </div>
            )}

             {/* 4. Upgrade Prompt (Free Only) */}
             {tier === 'free' && (
                 <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     transition={{ delay: 0.5 }}
                     onClick={() => router.push("/upgrade")}
                     className="col-span-2 p-4 rounded-2xl bg-gradient-to-r from-accent-1/20 to-purple-500/20 border border-accent-1/30 flex items-center justify-between group cursor-pointer hover:border-accent-1/60 transition-colors"
                 >
                     <div>
                         <h3 className="font-bold text-accent-1">Upgrade Protocol</h3>
                         <p className="text-xs text-secondary-text">Secure your connection now.</p>
                     </div>
                     <div className="px-4 py-2 bg-accent-1 text-primary-bg font-bold rounded-lg text-xs group-hover:scale-105 transition-transform">
                         GET ACCESS
                     </div>
                 </motion.div>
             )}

        </div>

      </main>

      {/* System Terminal Footer */}
      <SystemTerminal />
    </div>
  );
}