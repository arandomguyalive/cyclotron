"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Fingerprint, ShieldCheck, Zap, ArrowRight, Globe } from "lucide-react";
import { useUser } from "@/lib/UserContext";

export default function BlacklistLandingPage() {
  const router = useRouter();
  const { firebaseUser, loading } = useUser();
  const [joinedCount, setJoinedCount] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Generate a consistent random number for this session
    const stored = sessionStorage.getItem("blacklist_simulated_count");
    if (stored) {
      setJoinedCount(parseInt(stored, 10));
    } else {
      // Random between 412 and 489
      const random = Math.floor(Math.random() * (489 - 412 + 1)) + 412;
      sessionStorage.setItem("blacklist_simulated_count", random.toString());
      setJoinedCount(random);
    }
  }, []);

  const handleJoin = () => {
    const targetUrl = "/upgrade?mode=blacklist";
    if (!loading) {
      if (firebaseUser) {
        router.push(targetUrl);
      } else {
        router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30 overflow-hidden font-sans relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-900/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center backdrop-blur-sm">
        <div className="flex items-center gap-2">
            <span className="font-blackjack text-2xl text-amber-500">KM18</span>
            <span className="text-[10px] font-black tracking-[0.3em] text-amber-500/50 uppercase border-l border-amber-500/30 pl-2 ml-2">Restricted Access</span>
        </div>
        <div className="text-[10px] font-mono text-amber-700">
            SECURE_CHANNEL_ESTABLISHED
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 pt-32 pb-20 max-w-4xl flex flex-col items-center text-center">
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 relative inline-block"
        >
            <div className="absolute -inset-4 bg-amber-500/10 blur-xl rounded-full opacity-50 animate-pulse" />
            <div className="border border-amber-500/30 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Live Registry</span>
                <div className="h-4 w-px bg-amber-500/20" />
                <span className="text-xs font-mono text-amber-200">{joinedCount} / 500 JOINED</span>
            </div>
        </motion.div>

        <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-500 to-amber-900 tracking-tighter mb-8 uppercase"
        >
            The Blacklist
        </motion.h1>

        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed"
        >
            Secure your sovereignty. Join the elite network of 500 founding creators. 
            <span className="text-amber-500 font-bold mx-1">Lifetime Access.</span> 
            <span className="text-white">Zero recurring fees.</span> 
            Total digital immunity.
        </motion.p>

        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={handleJoin}
            className="group relative px-12 py-6 bg-amber-500 hover:bg-amber-400 text-black font-black text-xl uppercase tracking-widest rounded-none skew-x-[-10deg] transition-all shadow-[0_0_40px_rgba(245,158,11,0.4)]"
        >
            <div className="absolute inset-0 border-2 border-white/20 skew-x-[10deg] pointer-events-none" />
            <span className="relative z-10 flex items-center gap-3 skew-x-[10deg]">
                Secure Your Spot <ArrowRight className={`w-6 h-6 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
            </span>
        </motion.button>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full">
            <FeatureCard icon={ShieldCheck} title="Forensic Immunity" desc="Advanced stealth algorithms protect your digital footprint from surveillance." delay={0.6} />
            <FeatureCard icon={Globe} title="Sovereign Network" desc="Bypass algorithmic suppression. Direct, unfiltered connection to your audience." delay={0.7} />
            <FeatureCard icon={Zap} title="Priority Uplink" desc="Maximum bandwidth allocation. Zero latency. First access to Neural Features." delay={0.8} />
        </div>

      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 border-t border-white/5 bg-black/80 backdrop-blur-md flex justify-between items-end z-40">
        <div className="text-[10px] text-zinc-600 font-mono">
            KM18_PROTOCOL_V2.1<br/>
            ENCRYPTION: AES-256-GCM
        </div>
        <Fingerprint className="w-12 h-12 text-zinc-800 opacity-50" />
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, delay }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="p-6 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm"
        >
            <Icon className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">{title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
        </motion.div>
    );
}
