"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/UserContext";
import { BottomNav } from "@/components/ui/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundMesh } from "@/components/ui/BackgroundMesh";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useUser();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Artificial delay for branding sequence
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4500); // Increased duration for cinematic sequence

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      <BackgroundMesh />

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
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-center p-8 overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
        >
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,50,50,0.2)_0%,black_70%)] opacity-50" />

            <div className="relative z-10 flex flex-col items-center">
                {/* 1. "A KM18 Production" */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mb-8"
                >
                    <span className="text-xs md:text-sm font-mono tracking-[0.4em] text-secondary-text uppercase">
                        A <span className="text-white font-bold">KM18</span> Production
                    </span>
                </motion.div>

                {/* 2. "ABHED" - The Main Title */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1.5, delay: 1.5, ease: "circOut" }}
                    className="text-7xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 tracking-tighter drop-shadow-2xl"
                >
                    ABHED
                </motion.h1>

                {/* 3. "Privacy Unleashed" - The Slogan */}
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    transition={{ duration: 1, delay: 2.5, ease: "easeOut" }}
                    className="mt-6 overflow-hidden whitespace-nowrap"
                >
                    <span className="text-sm md:text-lg font-light tracking-[0.6em] text-accent-1 uppercase border-t border-accent-1/30 pt-4 px-4 block">
                        Your Digital Fortress
                    </span>
                </motion.div>
            </div>
        </motion.div>
    )
}
