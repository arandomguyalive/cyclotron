"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ChevronRight, ChevronLeft, Lock } from "lucide-react";
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/lib/UserContext";
import { useSonic } from "@/lib/SonicContext";

interface Story {
  id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  userId: string;
  userHandle: string;
  userAvatar: string;
  createdAt: any;
  expiresAt: any;
  caption?: string;
}

// Mock Stories for Testing
const mockStories: Story[] = [
    {
        id: "mock-s1",
        mediaUrl: "https://images.unsplash.com/photo-1531297461136-82lw8u22k1j5?q=80&w=1000",
        mediaType: "image",
        userId: "mock-u1",
        userHandle: "neon_shadow",
        userAvatar: "Felix",
        createdAt: { toDate: () => new Date() },
        expiresAt: { toDate: () => new Date(Date.now() + 86400000) },
        caption: "System override initiated. #flux"
    },
    {
        id: "mock-s2",
        mediaUrl: "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000",
        mediaType: "image",
        userId: "mock-u2",
        userHandle: "cyber_punk",
        userAvatar: "Jocelyn",
        createdAt: { toDate: () => new Date() },
        expiresAt: { toDate: () => new Date(Date.now() + 86400000) },
        caption: "Midnight run."
    }
];

export function StoriesTray() {
  const { user, firebaseUser } = useUser();
  const [realStories, setRealStories] = useState<Story[]>([]);
  const [isOpen, setIsOpen] = useState(false); // Viewer Open
  const [currentIndex, setCurrentIndex] = useState(0);
  const { playClick } = useSonic();

  useEffect(() => {
    // Query active stories
    const now = new Date();
    const q = query(
      collection(db, "stories"),
      where("expiresAt", ">", now),
      orderBy("expiresAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newStories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Story[];
      setRealStories(newStories);
    });

    return () => unsubscribe();
  }, []);

  const stories = realStories.length > 0 ? realStories : mockStories;
  const hasStories = stories.length > 0;
  
  const isFree = user?.tier === 'free';

  const handleOpen = () => {
    if (isFree) {
        // Just play a sound, deny access
        playClick(150, 0.2, 'sawtooth');
        if (navigator.vibrate) navigator.vibrate([50, 50, 100]);
        alert("OPTICAL SENSORS OFFLINE. UPGRADE REQUIRED.");
        return;
    }

    if (stories.length > 0) {
        setIsOpen(true);
        playClick(600, 0.1, 'sine');
    } else {
        playClick(100, 0.2, 'sawtooth');
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
        setCurrentIndex(prev => prev + 1);
    } else {
        setIsOpen(false); // Close on finish
        setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
     if (currentIndex > 0) {
         setCurrentIndex(prev => prev - 1);
     }
  };

  return (
    <>
      {/* The Glowing Ball Trigger */}
      <motion.button
        onClick={handleOpen}
        whileTap={{ scale: 0.9 }}
        className="relative w-10 h-10 rounded-full flex items-center justify-center z-50"
      >
        {hasStories ? (
            <div className={`w-full h-full rounded-full p-[2px] animate-spin-slow ${isFree ? 'bg-gradient-to-tr from-red-500/50 to-transparent' : 'bg-gradient-to-tr from-accent-1 to-purple-500'}`}>
                {isFree ? (
                    // Ghost/Shadow Orb for Free Users
                    <div className="w-full h-full rounded-full bg-black border-2 border-red-500/30 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
                        <span className="font-mono font-bold text-[10px] text-red-500 relative z-10">
                            {stories.length}
                        </span>
                        <Lock className="w-3 h-3 text-red-500/50 absolute bottom-1 right-1" />
                    </div>
                ) : (
                    // Full Avatar for Premium+
                    <div className="w-full h-full rounded-full relative">
                        <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${stories[0].userAvatar}`} 
                            className="w-full h-full rounded-full bg-black object-cover border-2 border-black"
                            alt="Story"
                        />
                        <div className="absolute inset-0 rounded-full shadow-[0_0_15px_var(--color-accent-1)] animate-pulse" />
                    </div>
                )}
            </div>
        ) : (
             // Empty State: Just a ghostly orb
             <div className="w-full h-full rounded-full border border-secondary-text/30 bg-secondary-bg/20 backdrop-blur flex items-center justify-center group">
                 <div className="w-2 h-2 rounded-full bg-secondary-text/50 group-hover:bg-accent-1 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
             </div>
        )}
      </motion.button>

      {/* Fullscreen Viewer */}
      <AnimatePresence>
        {isOpen && hasStories && (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-[100] bg-black flex flex-col"
            >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-safe-area-top">
                    {stories.map((_, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: idx < currentIndex ? "100%" : (idx === currentIndex ? "100%" : "0%") }}
                                transition={{ duration: idx === currentIndex ? 5 : 0, ease: "linear" }}
                                onAnimationComplete={() => idx === currentIndex && handleNext()}
                                className="h-full bg-white"
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-4 left-0 right-0 z-20 p-4 pt-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${stories[currentIndex].userAvatar}`} />
                         </div>
                         <span className="font-bold text-white shadow-black drop-shadow-md">{stories[currentIndex].userHandle}</span>
                         <span className="text-white/50 text-xs">{new Date(stories[currentIndex].createdAt.toDate()).toLocaleTimeString()}</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                        <X className="w-8 h-8" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 relative flex items-center justify-center bg-zinc-900" onClick={(e) => {
                    const width = e.currentTarget.clientWidth;
                    if (e.clientX < width / 3) handlePrev();
                    else handleNext();
                }}>
                    {stories[currentIndex].mediaType === "video" ? (
                        <video 
                            src={stories[currentIndex].mediaUrl} 
                            autoPlay 
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <img 
                            src={stories[currentIndex].mediaUrl} 
                            className="w-full h-full object-contain"
                        />
                    )}
                    
                    {/* Caption Overlay */}
                    {stories[currentIndex].caption && (
                         <div className="absolute bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-center">
                             <p className="text-lg font-light">{stories[currentIndex].caption}</p>
                         </div>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
