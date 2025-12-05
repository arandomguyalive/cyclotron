"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Aperture, MessageCircle, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Vortex", href: "/vortex", icon: Aperture },
  { name: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 pb-safe-area-inset-bottom">
      {/* Glassmorphism Container */}
      <div className="absolute inset-0 bg-cyber-black/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]" />
      
      <div className="relative flex h-full items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-14 h-full group"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute -top-3 w-10 h-10 bg-cyber-blue/40 rounded-full blur-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              {isActive && (
                <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 w-8 h-0.5 bg-cyber-blue shadow-[0_0_10px_#00F0FF]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <Icon
                className={cn(
                  "w-6 h-6 transition-colors duration-300 z-10",
                  isActive ? "text-cyber-blue drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
