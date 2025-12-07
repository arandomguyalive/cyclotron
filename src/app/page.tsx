"use client";

import { useUser } from "@/lib/UserContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const { firebaseUser, loading } = useUser();
  const router = useRouter();

  const handleAction = () => {
    if (firebaseUser) {
      router.push("/vortex");
    } else {
      router.push("/login");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-primary-bg relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-accent-1)_0%,transparent_70%)] opacity-10 blur-3xl" />
      
      <div className="z-10 text-center flex flex-col items-center gap-6">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <h1 className="text-6xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-accent-1 to-transparent tracking-tighter">
                ABHED
            </h1>
        </motion.div>
        
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-primary-text/80 text-xl font-light tracking-wide max-w-lg"
        >
            The Impenetrable Digital Sanctum.
            <br />
            <span className="text-sm opacity-50">KM18&apos;s Fortress of Solitude.</span>
        </motion.p>

        <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
            onClick={handleAction}
            className="mt-8 px-12 py-4 bg-accent-1 text-primary-bg font-bold text-lg rounded-full hover:bg-accent-1/90 hover:scale-105 transition-all shadow-[0_0_20px_var(--color-accent-1)]"
        >
            {loading ? "SCANNING..." : (firebaseUser ? "RESUME SESSION" : "INITIALIZE")}
        </motion.button>
      </div>
      
      <div className="absolute bottom-8 text-secondary-text text-xs font-mono">
        SYSTEM STATUS: ONLINE
      </div>
    </main>
  );
}