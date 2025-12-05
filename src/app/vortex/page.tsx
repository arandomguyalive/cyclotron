"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, PanInfo } from "framer-motion";
import { VortexItem } from "@/components/feed/VortexItem";
import { ChevronUp } from "lucide-react";

const ITEMS_COUNT = 10;
const GAP = 1200; // Distance between items on Z axis

export default function VortexPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const zPosition = useMotionValue(0);
  const lastWheelTime = useRef(0);
  
  // Spring physics for smooth movement through the void
  const smoothZ = useSpring(zPosition, {
      stiffness: 120,
      damping: 20,
      mass: 1.2
  });

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.y;
    
    let newIndex = activeIndex;

    // Swipe Up (drag y negative) -> Go Forward (Next Item)
    if (info.offset.y < -threshold || velocity < -300) {
       newIndex = Math.min(activeIndex + 1, ITEMS_COUNT - 1);
    } 
    // Swipe Down (drag y positive) -> Go Backward (Prev Item)
    else if (info.offset.y > threshold || velocity > 300) {
       newIndex = Math.max(activeIndex - 1, 0);
    }

    setActiveIndex(newIndex);
  };

  const handleWheel = (e: React.WheelEvent) => {
      const now = Date.now();
      // Throttling wheel events to prevent skipping too many items at once
      if (now - lastWheelTime.current < 500) return;
      
      if (Math.abs(e.deltaY) > 30) {
          if (e.deltaY > 0) {
               // Scroll Down -> Next Item
               setActiveIndex(prev => Math.min(prev + 1, ITEMS_COUNT - 1));
          } else {
               // Scroll Up -> Prev Item
               setActiveIndex(prev => Math.max(prev - 1, 0));
          }
          lastWheelTime.current = now;
      }
  };

  // Sync zPosition when activeIndex changes
  useEffect(() => {
      zPosition.set(-activeIndex * GAP);
  }, [activeIndex, GAP, zPosition]);

  return (
    <div 
        className="h-[100dvh] w-full bg-black overflow-hidden flex items-center justify-center perspective-container"
        onWheel={handleWheel}
    >
      <style jsx global>{`
        .perspective-container {
            perspective: 1000px;
        }
        .preserve-3d {
            transform-style: preserve-3d;
        }
      `}</style>

      {/* Touch Interaction Layer */}
      <motion.div
        className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ touchAction: "none" }}
      />

      {/* Navigation Hint (Only visible on start) */}
      {activeIndex === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-24 z-40 text-white/50 flex flex-col items-center pointer-events-none animate-pulse"
          >
              <ChevronUp className="w-6 h-6 animate-bounce" />
              <span className="text-xs tracking-widest uppercase">Swipe / Scroll to Enter</span>
          </motion.div>
      )}

      {/* The 3D Tunnel World */}
      <div className="relative w-full h-full md:max-w-md md:aspect-[9/16] preserve-3d flex items-center justify-center">
        {Array.from({ length: ITEMS_COUNT }).map((_, i) => (
            <TunnelItem key={i} index={i} parentZ={smoothZ} activeIndex={activeIndex} />
        ))}
      </div>
      
      {/* Ambient Particles / Stars */}
      <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-screen" />
    </div>
  );
}

function TunnelItem({ index, parentZ, activeIndex }: { index: number, parentZ: any, activeIndex: number }) {
    // Base Z position for this item
    const baseZ = index * GAP;
    
    // Calculate real-time Z position relative to camera
    const z = useTransform(parentZ, (currentZ: number) => baseZ + currentZ);
    
    // Visual transformations based on Z depth
    // Items fade in from far back (Z=4000), are fully visible at Z=0, and fade out when passing camera (Z=-1000)
    const opacity = useTransform(z, [-GAP, -GAP/2, 0, GAP*3], [0, 0, 1, 0]);
    
    // Scale effect: items start small in distance, grow to 1 at camera, and become huge when passing
    const scale = useTransform(z, [-GAP, 0, GAP*4], [2, 1, 0.2]);
    
    // Blur effect for depth of field
    const blur = useTransform(z, [-GAP, 0, GAP*4], ["blur(10px)", "blur(0px)", "blur(8px)"]);
    
    // Rotation tilt for dynamic feel
    const rotateX = useTransform(z, [-GAP, 0, GAP], [10, 0, -10]); 

    // Optimization: Hide items far off-screen
    const display = useTransform(z, (currentZ) => (currentZ < -GAP*2 || currentZ > GAP*5) ? "none" : "flex");

    const isCurrent = index === activeIndex;

    return (
        <motion.div
            style={{
                z,
                opacity,
                scale,
                filter: blur,
                rotateX,
                display,
                position: 'absolute',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            className="origin-center p-4"
        >
             {/* The Card Content */}
             <VortexItem index={index} />
        </motion.div>
    )
}
