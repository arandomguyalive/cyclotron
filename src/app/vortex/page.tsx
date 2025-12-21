"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, PanInfo, AnimatePresence, MotionValue } from "framer-motion";
import { VortexItem, Post, Ad } from "@/components/feed/VortexItem";
import { ChevronUp, Box, Loader2, WifiOff } from "lucide-react";
import { useSonic } from "@/lib/SonicContext";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/lib/UserContext";

const GAP = 1200; // Distance between items on Z axis

// Mock Data for Showcase
const mockPosts: Post[] = [
    {
        id: "mock-1",
        caption: "Neon city lights reflecting on wet pavement. The vibe is unmatched. #cyberpunk #nightcity",
        mediaUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1000&auto=format&fit=crop",
        mediaType: "image",
        userId: "mock-user-1",
        userHandle: "neon_drifter",
        userAvatar: "Felix",
        likes: 1240,
        createdAt: new Date()
    },
    {
        id: "mock-2",
        caption: "Neural interface upgrade complete. Systems green. Ready for the dive.",
        mediaUrl: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=1000&auto=format&fit=crop",
        mediaType: "image",
        userId: "mock-user-2",
        userHandle: "system_shock",
        userAvatar: "Cipher",
        likes: 892,
        createdAt: new Date()
    },
    {
        id: "mock-3",
        caption: "Lost in the digital void. Send coordinates.",
        mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
        mediaType: "image",
        userId: "mock-user-3",
        userHandle: "void_walker",
        userAvatar: "Echo",
        likes: 3400,
        createdAt: new Date()
    },
    {
        id: "mock-4",
        caption: "Hardware accelerated rendering test. FPS stable.",
        mediaUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop",
        mediaType: "image",
        userId: "mock-user-4",
        userHandle: "hardware_fiend",
        userAvatar: "Chip",
        likes: 560,
        createdAt: new Date(Date.now() - 1000 * 60 * 60)
    },
    {
        id: "mock-5",
        caption: "The architecture of the future is purely code.",
        mediaUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop",
        mediaType: "image",
        userId: "mock-user-5",
        userHandle: "architect_zero",
        userAvatar: "Architect",
        likes: 2100,
        createdAt: new Date()
    }
];

const mockAd: Ad = {
    id: "ad-vortex-upgrade",
    type: "ad",
    title: "SIGNAL INTERFERENCE",
    description: "Your connection is throttled. Upgrade to Shield Tier for unlimited bandwidth.",
    cta: "BOOST SIGNAL",
    color: "red-500"
};

export default function VortexPage() {
  const [items, setItems] = useState<(Post | Ad)[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser(); // Get user from context
  
  const isFree = user?.tier === 'free';
  const isSimulation = items.length === 0 && !loading;

  const [activeIndex, setActiveIndex] = useState(0);
  const [cycles, setCycles] = useState(0); // Score for collecting artifacts
  const zPosition = useMotionValue(0);
  const lastWheelTime = useRef(0);
  const activeIndexRef = useRef(0); // Use ref for non-visual updates if needed
  const { playClick } = useSonic();
  
  // Determine watermark text
  const watermarkText = (user && !isFree) ? user.handle.toUpperCase() : undefined;

  // Spring physics for smooth movement through the void
  const smoothZ = useSpring(zPosition, {
      stiffness: 120,
      damping: 20,
      mass: 1.2
  });

  // Subscribe to Posts and Inject Ads
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        let newItems: (Post | Ad)[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as (Post | Ad)[];
        
        // Filter for Reels (Videos) only
        newItems = newItems.filter(item => 
            (item as Post).type === 'reel' || (item as Post).mediaType === 'video'
        );
        
        if (newItems.length === 0) {
            newItems = mockPosts;
        }

        // Inject Ads for Free Users
        if (isFree) {
            const itemsWithAds: (Post | Ad)[] = [];
            newItems.forEach((item, index) => {
                itemsWithAds.push(item);
                if ((index + 1) % 3 === 0) { // Every 3rd post
                    itemsWithAds.push({ ...mockAd, id: `ad-${index}` });
                }
            });
            newItems = itemsWithAds;
        }

        setItems(newItems);
        setLoading(false);
    }, (error) => {
        console.error("Firestore error, falling back to mock", error);
        setLoading(false);
    });
    return () => unsubscribe();
  }, [isFree]); // Re-run when tier changes




  const handleNavigation = (newIndex: number) => {
    // if (displayPosts.length === 0) return; // Always have posts now
    
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      playClick(newIndex > activeIndex ? 220 : 180, 0.08, 'sine'); // Higher freq for forward, lower for backward
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50); 
      }
    }
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.y;
    
    let newIndex = activeIndex;

    // Swipe Up (drag y negative) -> Go Forward (Next Item)
    if (info.offset.y < -threshold || velocity < -300) {
       newIndex = Math.min(activeIndex + 1, items.length - 1);
    } 
    // Swipe Down (drag y positive) -> Go Backward (Prev Item)
    else if (info.offset.y > threshold || velocity > 300) {
       newIndex = Math.max(activeIndex - 1, 0);
    }

    handleNavigation(newIndex);
  };

  const handleWheel = (e: React.WheelEvent) => {
      const now = Date.now();
      // Throttling wheel events to prevent skipping too many items at once
      if (now - lastWheelTime.current < 500) return;
      
      let newIndex = activeIndex;
      if (Math.abs(e.deltaY) > 30) {
          if (e.deltaY > 0) {
               // Scroll Down -> Next Item
               newIndex = Math.min(activeIndex + 1, items.length - 1);
          } else {
               // Scroll Up -> Prev Item
               newIndex = Math.max(activeIndex - 1, 0);
          }
          lastWheelTime.current = now;
      }
      handleNavigation(newIndex);
  };

  // Sync zPosition when activeIndex changes
  useEffect(() => {
      zPosition.set(-activeIndex * GAP);
  }, [activeIndex, GAP, zPosition]);

  if (loading) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-primary-bg text-accent-1">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-mono text-xs tracking-widest animate-pulse">ESTABLISHING UPLINK...</p>
          </div>
      )
  }

  return (
    <motion.div 
        className="h-[100dvh] w-full bg-primary-bg overflow-hidden flex items-center justify-center perspective-container cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ touchAction: "none" }}
    >
      <style jsx global>{`
        .perspective-container {
            perspective: 1000px;
        }
        .preserve-3d {
            transform-style: preserve-3d;
        }
      `}</style>

      {/* Score / Cycles Display */}
      <div className="absolute top-4 right-4 z-[60] flex flex-col items-end gap-2 pointer-events-none">
          <div className="flex items-center gap-2 bg-secondary-bg/50 backdrop-blur-md border border-accent-1/30 px-3 py-1 rounded-full">
            <Box className="w-4 h-4 text-accent-1 animate-pulse" />
            <span className="font-mono text-accent-1 font-bold">{cycles} Cycles</span>
          </div>
          {isSimulation && (
              <span className="text-[10px] text-secondary-text bg-black/50 px-2 py-0.5 rounded uppercase tracking-widest">
                  Simulation Mode
              </span>
          )}
      </div>

      {/* Navigation Hint (Only visible on start) */}
      {activeIndex === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-24 z-40 text-secondary-text/50 flex flex-col items-center pointer-events-none animate-pulse"
          >
              <ChevronUp className="w-6 h-6 animate-bounce" />
              <span className="text-xs tracking-widest uppercase">Swipe / Scroll to Enter</span>
          </motion.div>
      )}

      {/* The 3D Tunnel World */}
      <div className="relative w-full h-full md:max-w-md md:aspect-[9/16] preserve-3d flex items-center justify-center pointer-events-none">
        {items.slice(Math.max(0, activeIndex - 1), Math.min(items.length, activeIndex + 2)).map((item) => (
            <TunnelItem 
                key={item.id} 
                index={items.indexOf(item)}
                post={item}
                parentZ={smoothZ} 
                activeIndex={activeIndex}
                onCollect={() => setCycles(prev => prev + 100)} 
                watermarkText={watermarkText} // Pass watermarkText
                isFree={isFree} // Pass isFree
                tier={user?.tier || 'free'} // Pass tier
            />
        ))}
      </div>
    </motion.div>
  );
}

function TunnelItem({ index, post, parentZ, activeIndex, onCollect, watermarkText, isFree, tier }: { index: number, post: Post | Ad, parentZ: MotionValue<number>, activeIndex: number, onCollect: () => void, watermarkText?: string, isFree?: boolean, tier: string }) {
    // Base Z position for this item
    const baseZ = index * GAP;
    
    // Calculate real-time Z position relative to camera
    const z = useTransform(parentZ, (currentZ: number) => baseZ + currentZ);
    
    // Visual transformations based on Z depth
    const opacity = useTransform(z, [-GAP, -GAP/2, 0, GAP*3], [0, 0, 1, 0]);
    
    // Re-introduce Scale & Rotation using cheap transforms
    // We use a static rotation and dynamic scale calculated from Z
    // Logic: As Z gets closer (moves from negative to 0), scale increases
    const scale = useTransform(z, [-GAP, 0, GAP*4], [1.1, 1, 0.9]);
    
    // Optimization: Hide items far off-screen
    const display = useTransform(z, (currentZ) => (currentZ < -GAP*2 || currentZ > GAP*5) ? "none" : "flex");

    // Random Artifact Spawning Logic (Deterministic based on index) - Only for posts
    const hasArtifact = post.type !== 'ad' && index % 3 === 0; 
    const artifactX = (index % 2 === 0 ? 1 : -1) * 150; // Alternate left/right
    const artifactY = -200; // Float above

    return (
        <motion.div
            style={{
                z,
                scale,
                opacity,
                display,
                // rotateX: 0, // Flattened for mobile elegance
                position: 'absolute',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                alignItems: 'center',
                justifyContent: 'center',
                willChange: 'transform, opacity' // Force hardware acceleration layer
            }}
            className="origin-center p-4"
        >
             {/* The Card Content */}
             <VortexItem post={post} index={index} watermarkText={watermarkText} isFree={isFree} tier={tier} />

             {/* Scavenger Hunt Artifact */}
             {hasArtifact && (
                 <div style={{ transform: `translate3d(${artifactX}px, ${artifactY}px, 100px)` }} className="absolute z-[70] pointer-events-auto">
                     <Artifact onCollect={onCollect} />
                 </div>
             )}
        </motion.div>
    )
}

function Artifact({ onCollect }: { onCollect: () => void }) {
    const [collected, setCollected] = useState(false);
    const { playClick } = useSonic();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent drag logic interference if possible
        if (!collected) {
            setCollected(true);
            playClick(880, 0.1, 'sawtooth'); // High pitched 'ching'
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
            onCollect();
        }
    };

    return (
        <AnimatePresence>
            {!collected && (
                <motion.div
                    initial={{ rotate: 0, scale: 1 }}
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ 
                        rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    onClick={handleClick}
                    className="w-16 h-16 cursor-pointer group"
                >
                    {/* Glowing Cube Artifact */}
                    <div className="w-full h-full bg-accent-1/20 border-2 border-accent-1 backdrop-blur-md shadow-[0_0_15px_var(--color-accent-1)] flex items-center justify-center transform hover:scale-110 transition-transform">
                        <div className="w-8 h-8 bg-accent-1/50 rotate-45" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
