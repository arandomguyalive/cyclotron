"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, PanInfo, AnimatePresence, MotionValue } from "framer-motion";
import { VortexItem, Post } from "@/components/feed/VortexItem";
import { ChevronUp, Box, Loader2, WifiOff, Ghost } from "lucide-react";
import { useSonic, ImpactStyle } from "@/lib/SonicContext";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/lib/UserContext";

const GAP = 1200; // Distance between items on Z axis

export default function VortexPage() {
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser(); 
  
  const isFree = user?.tier === 'free';

  const [activeIndex, setActiveIndex] = useState(0);
  const [cycles, setCycles] = useState(0); 
  const zPosition = useMotionValue(0);
  const lastWheelTime = useRef(0);
  const { playClick, playHaptic } = useSonic();
  
  const watermarkText = (user && !isFree) ? user.handle.toUpperCase() : undefined;

  const smoothZ = useSpring(zPosition, {
      stiffness: 120,
      damping: 20,
      mass: 1.2
  });

  // Subscribe to real Posts
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const newItems: Post[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Post[];
        
        setItems(newItems);
        setLoading(false);
    }, (error) => {
        console.error("Vortex downlink failed", error);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleNavigation = (newIndex: number) => {
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      playClick(newIndex > activeIndex ? 220 : 180, 0.08, 'sine'); 
      playHaptic(ImpactStyle.Medium);
    }
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.y;
    
    let newIndex = activeIndex;

    if (info.offset.y < -threshold || velocity < -300) {
       newIndex = Math.min(activeIndex + 1, items.length - 1);
    } 
    else if (info.offset.y > threshold || velocity > 300) {
       newIndex = Math.max(activeIndex - 1, 0);
    }

    handleNavigation(newIndex);
  };

  const handleWheel = (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime.current < 500) return;
      
      let newIndex = activeIndex;
      if (Math.abs(e.deltaY) > 30) {
          if (e.deltaY > 0) {
               newIndex = Math.min(activeIndex + 1, items.length - 1);
          } else {
               newIndex = Math.max(activeIndex - 1, 0);
          }
          lastWheelTime.current = now;
      }
      handleNavigation(newIndex);
  };

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

  if (items.length === 0) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-primary-bg text-secondary-text text-center p-8">
              <Ghost className="w-16 h-16 opacity-20 mb-4" />
              <h2 className="text-xl font-bold text-primary-text uppercase tracking-tighter">Void Detected</h2>
              <p className="text-sm mt-2 max-w-xs">No signals found in this sector. Deploy a drop to initialize frequency.</p>
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
      </div>

      {/* Navigation Hint */}
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

      <div className="relative w-full h-full md:max-w-md md:aspect-[9/16] preserve-3d flex items-center justify-center pointer-events-none">
        {items.slice(Math.max(0, activeIndex - 1), Math.min(items.length, activeIndex + 2)).map((item) => (
            <TunnelItem 
                key={item.id} 
                index={items.indexOf(item)}
                post={item}
                parentZ={smoothZ} 
                activeIndex={activeIndex}
                onCollect={() => setCycles(prev => prev + 100)} 
                watermarkText={watermarkText}
                isFree={isFree}
                tier={user?.tier || 'free'}
            />
        ))}
      </div>
    </motion.div>
  );
}

function TunnelItem({ index, post, parentZ, activeIndex, onCollect, watermarkText, isFree, tier }: { index: number, post: Post, parentZ: MotionValue<number>, activeIndex: number, onCollect: () => void, watermarkText?: string, isFree?: boolean, tier: string }) {
    const baseZ = index * GAP;
    const z = useTransform(parentZ, (currentZ: number) => baseZ + currentZ);
    const opacity = useTransform(z, [-GAP, -GAP/2, 0, GAP*3], [0, 0, 1, 0]);
    const scale = useTransform(z, [-GAP, 0, GAP*4], [1.1, 1, 0.9]);
    const display = useTransform(z, (currentZ) => (currentZ < -GAP*2 || currentZ > GAP*5) ? "none" : "flex");

    const hasArtifact = index % 3 === 0; 
    const artifactX = (index % 2 === 0 ? 1 : -1) * 150; 
    const artifactY = -200; 

    return (
        <motion.div
            style={{
                z,
                scale,
                opacity,
                display,
                position: 'absolute',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                alignItems: 'center',
                justifyContent: 'center',
                willChange: 'transform, opacity'
            }}
            className="origin-center p-4 pointer-events-auto"
        >
             <VortexItem post={post} index={index} watermarkText={watermarkText} isFree={isFree} tier={tier} />

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
    const { playClick, playHaptic } = useSonic();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent drag logic interference if possible
        if (!collected) {
            setCollected(true);
            playClick(880, 0.1, 'sawtooth'); // High pitched 'ching'
            playHaptic(ImpactStyle.Heavy);
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
