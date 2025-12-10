"use client";

import { motion } from "framer-motion";
import { useUser } from "@/lib/UserContext";

export function BackgroundMesh() {
  const { user } = useUser();
  const tier = user?.tier || 'free';

  // Define gradients based on tier
  const gradients = {
    free: "from-rose-900/20 via-black to-black",
    premium: "from-sky-900/20 via-black to-black",
    gold: "from-amber-900/20 via-black to-black",
    platinum: "from-gray-100/10 via-black to-black",
    ultimate: "from-purple-900/20 via-black to-black",
  };

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-primary-bg">
      {/* Base Noise */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-screen z-10" />

      {/* Breathing Mesh 1 */}
      <motion.div
        className={`absolute -top-[20%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br ${gradients[tier]} blur-[100px] opacity-40`}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Breathing Mesh 2 */}
      <motion.div
        className={`absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tl ${gradients[tier]} blur-[100px] opacity-30`}
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [0, -90, 0],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
