"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/UserContext";
import { BottomNav } from "@/components/ui/BottomNav";
import { motion, AnimatePresence } from "framer-motion";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useUser();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Artificial delay for branding sequence
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500); // 3.5s total splash time

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      <main className={`min-h-screen pb-20 relative z-0 transition-opacity duration-1000 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </main>
      
      {/* Only show BottomNav if logged in AND splash is done */}
      {!showSplash && firebaseUser && <BottomNav />}
    </>
  );
}

function SplashScreen() {
    return (
        <motion.div 
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-center p-8"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6"
            >
                <span className="text-xs md:text-sm font-mono tracking-[0.5em] text-accent-1/80 uppercase">
                    KM18 Presents
                </span>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 1.2, delay: 1.2, type: "spring" }}
                className="text-6xl md:text-9xl font-bold text-white tracking-tighter"
            >
                ABHED
            </motion.h1>

            <motion.div
                initial={{ width: 0 }}
                animate={{ width: "200px" }}
                transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                className="h-[1px] bg-gradient-to-r from-transparent via-accent-1 to-transparent mt-8"
            />
        </motion.div>
    )
}
