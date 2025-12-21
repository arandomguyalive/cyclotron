"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ChevronRight, ChevronLeft, Lock } from "lucide-react";
import { collection, query, where, getDocs, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";
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
  createdAt: Timestamp | Date;
  expiresAt: Timestamp | Date;
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
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
        caption: "System override initiated. #signals"
    },
    {
        id: "mock-s2",
        mediaUrl: "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000",
        mediaType: "image",
        userId: "mock-u2",
        userHandle: "cyber_punk",
        userAvatar: "Jocelyn",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
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

  const handleOpen = (index: number) => {
    if (isFree) {
        playClick(150, 0.2, 'sawtooth');
        if (navigator.vibrate) navigator.vibrate([50, 50, 100]);
        alert("OPTICAL SENSORS OFFLINE. UPGRADE REQUIRED.");
        return;
    }

    setCurrentIndex(index);
    setIsOpen(true);
    playClick(600, 0.1, 'sine');
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
      {/* Horizontal Story Tray */}
      <div className="w-full overflow-x-auto pb-4 pt-2 scrollbar-hide">
          <div className="flex gap-4 px-1">
              
              {/* Add Story Button */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-secondary-text/50 flex items-center justify-center cursor-pointer hover:border-accent-1 hover:text-accent-1 text-secondary-text transition-colors">
                      <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] text-secondary-text">Add</span>
              </div>

              {/* Story Items */}
              {hasStories && stories.map((story, i) => (
                  <motion.button
                    key={story.id}
                    onClick={() => handleOpen(i)}
                    whileTap={{ scale: 0.9 }}
                    className="flex flex-col items-center gap-1 shrink-0 relative"
                  >
                    <div className={`w-14 h-14 rounded-full p-[2px] ${isFree ? 'bg-red-500/50' : 'bg-gradient-to-tr from-accent-1 to-purple-500'}`}>
                        <div className="w-full h-full rounded-full bg-black p-[2px] relative overflow-hidden">
                            <img 
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${story.userAvatar}`} 
                                className={`w-full h-full rounded-full object-cover ${isFree ? 'grayscale opacity-50' : ''}`}
                                alt={story.userHandle}
                            />
                            {isFree && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Lock className="w-4 h-4 text-red-500" />
                                </div>
                            )}
                        </div>
                    </div>
                    <span className="text-[10px] text-secondary-text max-w-[60px] truncate">
                        {story.userHandle}
                    </span>
                  </motion.button>
              ))}
          </div>
      </div>

      {/* Fullscreen Viewer */}
      <AnimatePresence>
        {isOpen && hasStories && !isFree && (
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
                         <span className="text-white/50 text-xs">
                             {(() => {
                                 const ts = stories[currentIndex].createdAt;
                                 const date = ts instanceof Date ? ts : ts.toDate();
                                 return date.toLocaleTimeString();
                             })()}
                         </span>
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
