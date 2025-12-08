"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@/lib/UserContext";

export default function IntroPage() {
  const { firebaseUser, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait for the auth check to complete
    if (!loading) {
      if (firebaseUser) {
        // If logged in, go to the new Dashboard
        router.push("/home");
      } else {
        // If not logged in, go to Login
        router.push("/login");
      }
    }
  }, [loading, firebaseUser, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-primary-bg relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-accent-1)_0%,transparent_70%)] opacity-10 blur-3xl" />
      
      <div className="z-10 text-center flex flex-col items-center gap-6">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        >
            <h1 className="text-6xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-accent-1 to-transparent tracking-tighter">
                ABHED
            </h1>
        </motion.div>
        
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-primary-text/80 text-sm font-mono tracking-widest uppercase animate-pulse"
        >
            System Initializing...
        </motion.p>
      </div>
      
      <div className="absolute bottom-8 text-secondary-text text-[10px] font-mono opacity-50">
        SECURE CONNECTION // ENCRYPTED
      </div>
    </main>
  );
}
