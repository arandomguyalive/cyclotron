"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Aperture, User, Plus, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSonic } from "@/lib/SonicContext";
import { useUser } from "@/lib/UserContext";
import { useTheme } from "@/lib/ThemeContext";
import { CreatePostModal } from "@/components/feed/CreatePostModal";
import { UserAvatar } from "./UserAvatar";

const navItemsLeft = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Vortex", href: "/vortex", icon: Aperture },
];

const navItemsRight = [
  { name: "Activity", href: "/notifications", icon: Bell },
];

export function BottomNav() {
  const pathname = usePathname();
  const { playClick, playHaptic } = useSonic();
  const { user } = useUser();
  const { colorMode } = useTheme();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const tier = user?.tier || 'free';
  const isLight = colorMode === 'light';

  const tierColors = {
      free: "text-brand-orange bg-brand-orange border-brand-orange shadow-brand-orange",
      premium: isLight 
          ? "text-brand-blue bg-brand-cyan border-brand-cyan shadow-brand-cyan" 
          : "text-brand-cyan bg-brand-cyan border-brand-cyan shadow-brand-cyan",
      gold: "text-brand-pale-pink bg-brand-pale-pink border-brand-pale-pink shadow-brand-pale-pink",
      platinum: isLight 
          ? "text-black bg-white border-white shadow-gray-400" 
          : "text-white bg-white border-white shadow-white",
      sovereign: "text-brand-blue bg-brand-blue border-brand-blue shadow-brand-blue",
      lifetime: "text-amber-500 bg-amber-500 border-amber-500 shadow-amber-500",
  };

  const activeColor = tierColors[tier as keyof typeof tierColors] || tierColors.free;

  const textColor = activeColor.split(' ')[0];
  const bgColor = activeColor.split(' ')[1];

  const handleClick = (isAction?: boolean) => {
    if (isAction) {
        playClick(600, 0.1, 'square');
        playHaptic('selection');
        setIsCreateOpen(true);
    } else {
        playClick(440, 0.05, 'triangle');
        playHaptic('selection');
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 pb-safe-area-inset-bottom pointer-events-none">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <motion.button
                onClick={() => handleClick(true)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className={`flex items-center justify-center w-14 h-14 rounded-2xl ${bgColor} text-black shadow-[0_0_25px_currentColor] border-2 border-white/20 rotate-45 group transition-all duration-500`}
            >
                <div className="-rotate-45">
                    <Plus className="w-7 h-7 group-hover:scale-110 transition-transform" />
                </div>
            </motion.button>
        </div>

        <div className="absolute inset-0 bg-primary-bg/80 backdrop-blur-2xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.4)] pointer-events-auto rounded-t-[2.5rem]" />
        
        <div className="relative flex h-full items-center justify-between px-8 pointer-events-auto max-w-lg mx-auto w-full">
          <div className="flex gap-8">
            {navItemsLeft.map((item) => (
                <Link key={item.name} href={item.href} onClick={() => handleClick()} className="relative flex flex-col items-center justify-center w-10 h-full group">
                    {pathname === item.href && <motion.div layoutId="nav-aura" className={`absolute inset-0 rounded-full blur-xl opacity-20 ${bgColor}`} transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                    <motion.div whileTap={{ scale: 0.8 }} className="relative z-10"><item.icon className={cn("w-5 h-5 transition-all duration-300", pathname === item.href ? `${textColor} scale-110 drop-shadow-[0_0_8px_currentColor]` : "text-secondary-text group-hover:text-primary-text")} /></motion.div>
                </Link>
            ))}
          </div>
          <div className="w-14" />
          <div className="flex gap-8">
            {navItemsRight.map((item) => (
                <Link key={item.name} href={item.href} onClick={() => handleClick()} className="relative flex flex-col items-center justify-center w-10 h-full group">
                    {pathname === item.href && <motion.div layoutId="nav-aura" className={`absolute inset-0 rounded-full blur-xl opacity-20 ${bgColor}`} transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                    <motion.div whileTap={{ scale: 0.8 }} className="relative z-10"><item.icon className={cn("w-5 h-5 transition-all duration-300", pathname === item.href ? `${textColor} scale-110 drop-shadow-[0_0_8px_currentColor]` : "text-secondary-text group-hover:text-primary-text")} /></motion.div>
                </Link>
            ))}
            <Link href="/profile" onClick={() => handleClick()} className="relative flex flex-col items-center justify-center w-10 h-full group">
                {pathname === "/profile" && <motion.div layoutId="nav-aura" className={`absolute inset-0 rounded-full blur-xl opacity-20 ${bgColor}`} transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                <motion.div whileTap={{ scale: 0.8 }} className="relative z-10">
                    <UserAvatar size="sm" showRing={pathname === "/profile"} className={cn("transition-all duration-300", pathname === "/profile" ? "scale-110" : "opacity-70 group-hover:opacity-100")} />
                </motion.div>
            </Link>
          </div>
        </div>
      </nav>
      <CreatePostModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
}
