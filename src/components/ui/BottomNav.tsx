"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Aperture, User, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSonic } from "@/lib/SonicContext";
import { useUser } from "@/lib/UserContext";
import { CreatePostModal } from "@/components/feed/CreatePostModal";

const navItems = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Vortex", href: "/vortex", icon: Aperture },
  { name: "Search", href: "/chat", icon: Search },
  { name: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { playClick } = useSonic();
  const { user } = useUser();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const tier = user?.tier || 'free';
  const activeColor = {
      free: "text-brand-orange bg-brand-orange border-brand-orange shadow-brand-orange",
      premium: "text-brand-cyan bg-brand-cyan border-brand-cyan shadow-brand-cyan",
      gold: "text-brand-pale-pink bg-brand-pale-pink border-brand-pale-pink shadow-brand-pale-pink",
      platinum: "text-white bg-white border-white shadow-white",
      sovereign: "text-brand-purple bg-brand-purple border-brand-purple shadow-brand-purple",
  }[tier];

  // Helper to get just the text color class
  const textColor = activeColor.split(' ')[0];
  const bgColor = activeColor.split(' ')[1];
  const shadowColor = activeColor.split(' ')[3]; // A bit hacky but works for this mapping

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
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 pb-safe-area-inset-bottom pointer-events-none">
        {/* Floating Action Button (Centered) */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <motion.button
                onClick={() => handleClick(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`flex items-center justify-center w-16 h-16 rounded-full ${bgColor} text-black shadow-[0_0_20px_currentColor] ${textColor.replace('text', 'shadow')} border-4 border-primary-bg`}
            >
                <Plus className="w-8 h-8" />
            </motion.button>
        </div>

        {/* Glassmorphism Container */}
        <div className="absolute inset-0 bg-primary-bg/95 backdrop-blur-xl border-t border-border-color shadow-[0_-4px_30px_rgba(0,0,0,0.5)] pointer-events-auto" />
        
        <div className="relative flex h-full items-center justify-between px-6 pointer-events-auto max-w-lg mx-auto w-full">
          {navItems.map((item, index) => (
              <div key={item.name} className="flex items-center">
                  {/* Spacer for FAB in the middle (after 2nd item) */}
                  {index === 2 && <div className="w-12 md:w-16" />} 
                  
                  <Link
                    href={item.href}
                    onClick={() => handleClick()}
                    className="relative flex flex-col items-center justify-center w-12 h-full group"
                  >
                    {pathname === item.href && (
                      <motion.div
                        layoutId="nav-indicator"
                        className={`absolute top-0 w-8 h-0.5 ${bgColor}`}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <item.icon
                        className={cn(
                            "w-6 h-6 transition-colors duration-300 z-10",
                            pathname === item.href ? `${textColor} drop-shadow-[0_0_5px_currentColor]` : "text-secondary-text group-hover:text-primary-text"
                        )}
                        />
                    </motion.div>
                  </Link>
              </div>
          ))}
        </div>
      </nav>

      <CreatePostModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
}