"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function IntroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessKey = searchParams.get("access");
    if (accessKey === "architect") {
      // If access key is present, go to Login
      router.push("/login");
    } else {
      // Otherwise, go to the Blacklist page
      router.push("/blacklist");
    }
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-black relative overflow-hidden">
      {/* Background Ambience - Minimal for quick redirect */}
      <div className="absolute inset-0 bg-black" />
      
      <div className="z-10 text-center flex flex-col items-center gap-6">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        >
            <h1 className="text-6xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-500 to-amber-900 tracking-tighter">
                ABHED
            </h1>
        </motion.div>
        
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-amber-500/80 text-sm font-mono tracking-widest uppercase animate-pulse"
        >
            Verifying Access Level...
        </motion.p>
      </div>
      
      <div className="absolute bottom-8 text-zinc-600 text-[10px] font-mono opacity-50">
        SECURE CONNECTION // ENCRYPTED
      </div>
    </main>
  );
}
