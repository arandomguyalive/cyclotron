"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { motion } from "framer-motion";
import { StoriesTray } from "@/components/feed/StoriesTray";
import { Box, Activity, Zap } from "lucide-react";

export default function HomePage() {
  const { user, firebaseUser, loading } = useUser();
  const router = useRouter();

  // Protect the route
  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push("/login");
    }
  }, [loading, firebaseUser, router]);

  if (loading || !firebaseUser) return null;

  return (
    <div className="min-h-screen bg-primary-bg text-primary-text pb-20 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,var(--color-accent-1)_0%,transparent_40%)] opacity-10 blur-3xl" />
      <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-screen" />

      {/* Header */}
      <header className="px-6 py-4 pt-safe-area-top flex items-center justify-between sticky top-0 z-50 bg-primary-bg/80 backdrop-blur-md border-b border-border-color/50">
        <div>
           <h1 className="text-xl font-bold tracking-tight text-primary-text">DASHBOARD</h1>
           <p className="text-xs text-secondary-text font-mono uppercase tracking-widest">
              Welcome, {user?.handle || "Agent"}
           </p>
        </div>
        
        {/* FLUX / STORIES TRAY - Now lives here */}
        <div className="pointer-events-auto">
             <StoriesTray />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-6 space-y-6">
        
        {/* Quick Stats / Status Card */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-secondary-bg/50 border border-border-color relative overflow-hidden"
        >
             <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Activity className="w-24 h-24 text-accent-1" />
             </div>
             
             <div className="relative z-10">
                 <h2 className="text-3xl font-bold text-accent-1 mb-1">ONLINE</h2>
                 <p className="text-sm text-secondary-text mb-4">Neural Link Established</p>
                 
                 <div className="flex gap-4">
                     <div className="flex flex-col">
                         <span className="text-xs uppercase text-secondary-text/70">Faction</span>
                         <span className="font-bold">{user?.faction || "Drifter"}</span>
                     </div>
                     <div className="flex flex-col">
                         <span className="text-xs uppercase text-secondary-text/70">Signal</span>
                         <span className="font-bold text-green-400">Strong</span>
                     </div>
                 </div>
             </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => router.push("/vortex")}
                className="p-6 rounded-3xl bg-gradient-to-br from-accent-1/20 to-accent-1/5 border border-accent-1/20 hover:border-accent-1/50 transition-all group text-left"
            >
                <Zap className="w-8 h-8 text-accent-1 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg">Enter Vortex</h3>
                <p className="text-xs text-secondary-text mt-1">Dive into the global feed.</p>
            </button>

            <div className="p-6 rounded-3xl bg-secondary-bg/30 border border-border-color flex flex-col justify-center items-center text-center opacity-50">
                <Box className="w-8 h-8 text-secondary-text mb-3" />
                <h3 className="font-bold text-lg">Coming Soon</h3>
                <p className="text-xs text-secondary-text mt-1">Modules offline.</p>
            </div>
        </div>

      </main>
    </div>
  );
}
