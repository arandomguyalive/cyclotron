"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, AlertTriangle, Fingerprint, Eye, EyeOff, Terminal, Briefcase, Truck, Ghost, Check, Loader2 } from "lucide-react";
import { useUser, UserProfile } from "@/lib/UserContext";
import { useSonic, ImpactStyle } from "@/lib/SonicContext";

const factions = [
    { id: "Netrunner", name: "Netrunner", icon: Terminal, color: "text-cyan-400", bg: "bg-cyan-400/10", desc: "Hackers & data brokers." },
    { id: "Corp", name: "Corp", icon: Briefcase, color: "text-blue-400", bg: "bg-blue-400/10", desc: "The elite establishment." },
    { id: "Drifter", name: "Drifter", icon: Truck, color: "text-amber-400", bg: "bg-amber-400/10", desc: "Nomads of the waste." },
    { id: "Ghost", name: "Ghost", icon: Ghost, color: "text-zinc-400", bg: "bg-zinc-400/10", desc: "Unknown entities." },
];

export default function LoginPage() {
  const { loginAnonymously, login, signup, firebaseUser, loading } = useUser();
  const { playClick, playHaptic } = useSonic();
  const router = useRouter();
  
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'guest' | 'login' | 'register'>('login');
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [selectedFaction, setSelectedFaction] = useState<UserProfile['faction']>("Drifter");
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (firebaseUser && !loading) {
      router.push("/home");
    }
  }, [firebaseUser, loading, router]);

  const handleAction = async () => {
    setIsAuthenticating(true);
    setError(null);
    playClick(600, 0.1, 'sine');
    playHaptic(ImpactStyle.Medium);

    try {
      if (mode === 'guest') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await loginAnonymously();
      } else if (mode === 'login') {
          if (!email || !password) throw new Error("IDENT_REQD: Missing Credentials.");
          await new Promise(resolve => setTimeout(resolve, 1500));
          await login(email, password);
      } else {
          if (!email || !password || !handle) throw new Error("RECRUIT_ERROR: All fields required.");
          if (password.length < 6) throw new Error("SECURITY_ERR: Access Key too short (min 6).");
          if (handle.length < 3) throw new Error("IDENT_ERR: Codename too short.");
          
          // Neural Scan Sequence
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Unique Handle Check
          const { collection, query, where, getDocs } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");
          const q = query(collection(db, "users"), where("handle", "==", handle.toUpperCase()));
          const snap = await getDocs(q);
          if (!snap.empty) throw new Error("IDENT_ERR: Codename already registered.");

          await signup(email, password, handle, selectedFaction);
      }
    } catch (err: any) {
      console.error(err);
      let msg = "UPLINK_FAIL: Authentication timed out.";
      if (err.code === 'auth/invalid-credential') msg = "IDENT_ERR: Invalid Access Key.";
      if (err.code === 'auth/email-already-in-use') msg = "REGISTRY_ERR: Email already linked.";
      if (err.message) msg = err.message;
      
      setError(msg);
      setIsAuthenticating(false);
      playClick(150, 0.3, 'sawtooth');
      playHaptic(ImpactStyle.Heavy);
    }
  };

  const handleModeToggle = (newMode: typeof mode) => {
      setMode(newMode);
      setError(null);
      playClick(440, 0.05, 'triangle');
  };

  return (
    <div className="min-h-screen w-full bg-primary-bg flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Branding */}
        <div className="flex flex-col items-center mb-10 text-center">
          <motion.div 
            animate={isAuthenticating ? { scale: [1, 1.2, 1], rotate: 360 } : {}}
            transition={{ duration: 2, repeat: isAuthenticating ? Infinity : 0 }}
            className="w-20 h-20 bg-accent-1/10 rounded-2xl flex items-center justify-center mb-6 border border-accent-1/30 shadow-[0_0_30px_rgba(0,212,229,0.2)]"
          >
            {isAuthenticating ? <Loader2 className="w-10 h-10 text-accent-1 animate-spin" /> : <Fingerprint className="w-10 h-10 text-accent-1" />}
          </motion.div>
          
          <div className="space-y-1">
              <span className="block text-[10px] font-mono tracking-[0.5em] text-secondary-text uppercase opacity-50">Identity Verification Required</span>
              <h1 className="text-5xl font-black text-primary-text tracking-tighter italic">ABHED</h1>
              <div className="flex items-center justify-center gap-2">
                  <div className="h-px w-8 bg-accent-1/30" />
                  <span className="text-[10px] font-bold tracking-[0.3em] text-accent-1 uppercase">KM18 Protocol v2.0</span>
                  <div className="h-px w-8 bg-accent-1/30" />
              </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-secondary-bg/40 backdrop-blur-2xl border border-border-color rounded-[2.5rem] p-8 shadow-2xl shadow-black/50">
            
            {/* Tab Switcher */}
            <div className="flex p-1 bg-black/40 rounded-2xl mb-8 border border-white/5">
                {(['login', 'register', 'guest'] as const).map((m) => (
                    <button 
                        key={m}
                        onClick={() => handleModeToggle(m)} 
                        className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === m ? 'bg-accent-1 text-black shadow-lg shadow-accent-1/20' : 'text-secondary-text hover:text-primary-text'}`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            <div className="space-y-5">
                <AnimatePresence mode="wait">
                    {mode === 'register' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-text ml-4">Codename</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. NEON_SHADOW" 
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value.toUpperCase())}
                                    className="w-full bg-black/40 border border-border-color rounded-2xl px-5 py-4 text-primary-text placeholder:text-secondary-text/30 focus:border-accent-1 focus:ring-1 focus:ring-accent-1/50 outline-none transition-all font-mono text-sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-text ml-4">Select Faction</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {factions.map((f) => (
                                        <button
                                            key={f.id}
                                            onClick={() => { setSelectedFaction(f.id as any); playClick(500, 0.05, 'square'); }}
                                            className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${selectedFaction === f.id ? `bg-accent-1/10 border-accent-1 ${f.color}` : 'bg-black/20 border-white/5 text-secondary-text hover:border-white/20'}`}
                                        >
                                            <f.icon className="w-5 h-5" />
                                            <span className="text-[10px] font-bold uppercase">{f.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {mode !== 'guest' && (
                    <>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-text ml-4">Registry Email</label>
                        <input 
                            type="email" 
                            placeholder="OPERATIVE@NETWORK.COM" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border border-border-color rounded-2xl px-5 py-4 text-primary-text placeholder:text-secondary-text/30 focus:border-accent-1 focus:ring-1 focus:ring-accent-1/50 outline-none transition-all font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-text ml-4">Access Key</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-border-color rounded-2xl px-5 py-4 text-primary-text placeholder:text-secondary-text/30 focus:border-accent-1 focus:ring-1 focus:ring-accent-1/50 outline-none transition-all font-mono text-sm"
                            />
                            <button 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-accent-1 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <button 
                            onClick={() => setRememberMe(!rememberMe)}
                            className="flex items-center gap-2 group"
                        >
                            <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${rememberMe ? 'bg-accent-1 border-accent-1' : 'border-border-color group-hover:border-accent-1'}`}>
                                {rememberMe && <Check className="w-3 h-3 text-black font-bold" />}
                            </div>
                            <span className="text-[10px] font-bold text-secondary-text uppercase tracking-widest">Stay Linked</span>
                        </button>
                        {mode === 'login' && (
                            <button className="text-[10px] font-bold text-accent-1 uppercase tracking-widest hover:underline">Key Recovery</button>
                        )}
                    </div>
                    </>
                )}

                {mode === 'guest' && (
                    <div className="py-10 text-center space-y-4">
                        <div className="p-4 bg-accent-1/5 border border-accent-1/20 rounded-2xl inline-block">
                            <Ghost className="w-10 h-10 text-accent-1 opacity-50" />
                        </div>
                        <p className="text-xs text-secondary-text leading-relaxed max-w-[200px] mx-auto">
                            Ghost access allows restricted read-only browsing without neural persistence.
                        </p>
                    </div>
                )}

                <button
                    onClick={handleAction}
                    disabled={isAuthenticating}
                    className="w-full relative group flex items-center justify-center gap-3 bg-accent-1 hover:bg-accent-1/90 text-black font-black py-5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden mt-4 shadow-xl shadow-accent-1/10"
                >
                    {isAuthenticating ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="tracking-widest uppercase text-xs">Synchronizing...</span>
                        </div>
                    ) : (
                        <>
                            <Shield className="w-5 h-5" />
                            <span className="tracking-widest uppercase text-xs">
                                {mode === 'guest' ? 'Initialize Ghost Link' : mode === 'login' ? 'Establish Secure Uplink' : 'Begin Recruitment'}
                            </span>
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* Footer Status */}
        <div className="mt-8 text-center space-y-4">
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2 text-red-400 text-[10px] font-mono bg-red-400/10 py-2 px-4 rounded-full border border-red-400/20 inline-flex mx-auto animate-pulse"
                    >
                        <AlertTriangle className="w-3 h-3" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="flex items-center justify-center gap-4 text-[10px] text-secondary-text/40 font-mono uppercase tracking-[0.2em]">
                <span>Status: Optimal</span>
                <div className="w-1 h-1 rounded-full bg-green-500/50" />
                <span>Nodes: 482</span>
                <div className="w-1 h-1 rounded-full bg-green-500/50" />
                <span>v1.0.4-KM18</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
}