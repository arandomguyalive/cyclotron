"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Shield, AlertTriangle, Fingerprint } from "lucide-react";
import { useUser } from "@/lib/UserContext";

export default function LoginPage() {
  const { loginAnonymously, firebaseUser, loading } = useUser();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    if (firebaseUser && !loading) {
      router.push("/home");
    }
  }, [firebaseUser, loading, router]);

  const handleAnonymousLogin = async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      await loginAnonymously();
      // Router redirection handled by useEffect
    } catch (err) {
      setError("Connection refused. System unstable.");
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-primary-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Noise/Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-secondary-bg/20 backdrop-blur-xl border border-border-color rounded-3xl p-8 relative z-10 shadow-[0_0_40px_-10px_rgba(var(--color-accent-1-rgb),0.3)]"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-accent-1/20 rounded-full flex items-center justify-center mb-4 border border-accent-1/50 shadow-[0_0_15px_var(--color-accent-1)]">
            <Fingerprint className="w-8 h-8 text-accent-1" />
          </div>
          <div className="mb-2">
              <span className="block text-[10px] font-mono tracking-[0.3em] text-secondary-text uppercase mb-1">A KM18 Production</span>
              <h1 className="text-4xl font-bold text-primary-text tracking-tighter">ABHED</h1>
              <span className="block text-[10px] font-light tracking-[0.5em] text-accent-1 uppercase mt-1">Your Digital Fortress</span>
          </div>
          <p className="text-secondary-text text-sm font-mono mt-2">
            Secure connection required.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleAnonymousLogin}
            disabled={isAuthenticating}
            className="w-full group relative flex items-center justify-center gap-3 bg-accent-1 hover:bg-accent-1/90 text-primary-bg font-bold py-4 px-6 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            
            {isAuthenticating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-bg border-t-transparent rounded-full animate-spin" />
                ESTABLISHING LINK...
              </span>
            ) : (
              <>
                <User className="w-5 h-5" />
                <span>ENTER AS GHOST (ANONYMOUS)</span>
              </>
            )}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border-color/50"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-primary-bg/50 backdrop-blur px-2 text-secondary-text/70">Restricted Access</span>
            </div>
          </div>

          <button disabled className="w-full flex items-center justify-center gap-3 bg-secondary-bg/50 border border-border-color text-secondary-text py-4 px-6 rounded-xl opacity-50 cursor-not-allowed">
            <Shield className="w-5 h-5" />
            <span>AUTHENTICATE VIA BIOMETRICS (WIP)</span>
          </button>
        </div>

        {/* Footer/Status */}
        <div className="mt-8 text-center">
            {error && (
                <div className="flex items-center justify-center gap-2 text-brand-orange text-xs font-mono mb-4 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    {error}
                </div>
            )}
            <p className="text-[10px] text-secondary-text/50 font-mono uppercase tracking-widest">
                System Version 0.9.1 // Beta
            </p>
        </div>
      </motion.div>
    </div>
  );
}
