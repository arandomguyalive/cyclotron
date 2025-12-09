"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { motion } from "framer-motion";
import { StoriesTray } from "@/components/feed/StoriesTray";
import { SignalGrid } from "@/components/home/SignalGrid";
import { FrequencyTuner } from "@/components/home/widgets/FrequencyTuner";
import { DailyDirective } from "@/components/home/widgets/DailyDirective";
import { SystemTerminal } from "@/components/home/widgets/SystemTerminal";
import { Activity, Zap, Shield, Globe, Lock, AlertTriangle, Eye, Server, Radio, Signal, Wifi } from "lucide-react";

export default function HomePage() {
  const { user, firebaseUser, loading } = useUser();
  const router = useRouter();

  // Protect the route
  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push("/login");
    }
  }, [loading, firebaseUser, router]);

  if (loading || !firebaseUser || !user) return null;

  const tier = user.tier || "free";

  // Tier-Specific Config
  const config = {
      free: {
          color: "text-secondary-text",
          bgColor: "bg-secondary-bg/10",
          borderColor: "border-border-color",
          signalText: "BASIC",
          signalValue: 40,
          label: "STANDARD",
          glitch: false
      },
      premium: {
          color: "text-cyan-400",
          bgColor: "bg-cyan-400/10",
          borderColor: "border-cyan-400/20",
          signalText: "STRONG",
          signalValue: 85,
          label: "SECURED",
          glitch: false
      },
      gold: {
          color: "text-amber-400",
          bgColor: "bg-amber-400/10",
          borderColor: "border-amber-400/20",
          signalText: "OPTIMAL",
          signalValue: 98,
          label: "FORTIFIED",
          glitch: false
      },
      platinum: {
          color: "text-white",
          bgColor: "bg-white/10",
          borderColor: "border-white/20",
          signalText: "MAXIMUM",
          signalValue: 100,
          label: "IMPERVIOUS",
          glitch: false
      },
      ultimate: {
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
          borderColor: "border-purple-500/20",
          signalText: "GODLIKE",
          signalValue: 100,
          label: "GOD MODE",
          glitch: false
      }
  }[tier];

  return (
    <div className="min-h-screen bg-primary-bg text-primary-text pb-20 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className={`absolute inset-0 pointer-events-none opacity-10 blur-3xl transition-colors duration-1000 ${
          tier === 'free' ? 'bg-[radial-gradient(circle_at_top_right,var(--color-secondary-text)_0%,transparent_40%)]' :
          tier === 'premium' ? 'bg-[radial-gradient(circle_at_top_right,cyan_0%,transparent_40%)]' :
          tier === 'gold' ? 'bg-[radial-gradient(circle_at_top_right,amber_0%,transparent_40%)]' :
          tier === 'platinum' ? 'bg-[radial-gradient(circle_at_top_right,white_0%,transparent_40%)]' :
          'bg-[radial-gradient(circle_at_top_right,purple_0%,transparent_40%)]'
      }`} />
      
      {/* Noise Overlay (Intense for Free tier) */}
      <div className={`absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-screen ${tier === 'free' ? 'opacity-5' : 'opacity-5'}`} />

            {/* Header */}

            <header className="px-6 py-4 pt-safe-area-top flex items-center justify-between sticky top-0 z-50 bg-primary-bg/80 backdrop-blur-md border-b border-border-color/50">

              <div>

                 <h1 className="text-xl font-bold tracking-tight text-primary-text">TERMINAL</h1>

                 <div className="flex items-center gap-2">

                     <span className="text-xs text-secondary-text font-mono uppercase tracking-widest">

                        {user?.handle}

                     </span>

                     {/* Compact Privacy Badge */}

                     <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${config.bgColor} ${config.color} border ${config.borderColor}`}>

                         <Shield className="w-3 h-3" />

                         <span>{config.label}</span>

                     </div>

                 </div>

              </div>

              

              <div className="pointer-events-auto">

                   <StoriesTray />

              </div>

            </header>

      

            {/* Main Content Area */}

            <main className="p-6 space-y-6">

              

              {/* Feed Filter (Frequency Tuner) */}

              <div className="relative">

                  <span className="absolute -top-3 left-2 text-[10px] bg-primary-bg px-2 text-secondary-text uppercase tracking-widest z-10">

                      Feed Filter

                  </span>

                  <FrequencyTuner />

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
            <button 
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
            </button>

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
                     <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${config.color.replace('text', 'bg')} animate-ping`} />
                </div>
            )}

            {(tier === 'platinum' || tier === 'ultimate') && (
                <div className={`p-6 rounded-3xl ${config.bgColor} border ${config.borderColor} text-left`}>
                     <Server className={`w-8 h-8 mb-3 ${config.color}`} />
                     <h3 className="font-bold text-lg">The Vault</h3>
                     <p className="text-xs text-secondary-text mt-1">Secure Storage.</p>
                </div>
            )}

             {/* 3. Upgrade Prompt (Free Only) */}
             {tier === 'free' && (
                 <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
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