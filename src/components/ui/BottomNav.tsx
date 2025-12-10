"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Aperture, MessageCircle, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSonic } from "@/lib/SonicContext";
import { CreatePostModal } from "@/components/feed/CreatePostModal";

const navItems = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Vortex", href: "/vortex", icon: Aperture },
  { name: "Post", href: "#", icon: Plus, isAction: true }, // Special Action Item
  { name: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { playClick } = useSonic();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleClick = (isAction?: boolean) => {
    if (isAction) {
        playClick(600, 0.1, 'square');
        setIsCreateOpen(true);
    } else {
        playClick(440, 0.05, 'triangle');
    }
    
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 pb-safe-area-inset-bottom">
        {/* Glassmorphism Container */}
        <div className="absolute inset-0 bg-secondary-bg/80 backdrop-blur-xl border-t border-border-color shadow-[0_-4px_30px_rgba(0,0,0,0.5)]" />
        
        <div className="relative flex h-full items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href && !item.isAction;
            const Icon = item.icon;

            if (item.isAction) {
                return (
                    <button
                        key={item.name}
                        onClick={() => handleClick(true)}
                        className="relative -top-5 flex items-center justify-center w-14 h-14 rounded-full bg-accent-1 text-primary-bg shadow-[0_0_20px_var(--color-accent-1)] hover:scale-110 transition-transform active:scale-95"
                    >
                        <Icon className="w-8 h-8" />
                    </button>
                )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleClick()}
                className="relative flex flex-col items-center justify-center w-12 h-full group"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute -top-3 w-10 h-10 bg-accent-1/40 rounded-full blur-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                {isActive && (
                  <motion.div
                      layoutId="nav-indicator"
                      className="absolute top-0 w-8 h-0.5 bg-accent-1 shadow-[0_0_10px_#00F0FF]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon
                  className={cn(
                    "w-6 h-6 transition-colors duration-300 z-10",
                    isActive ? "text-accent-1 drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" : "text-secondary-text group-hover:text-primary-text"
                  )}
                />
              </Link>
            );
          })}
        </div>
      </nav>

      <CreatePostModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
}
