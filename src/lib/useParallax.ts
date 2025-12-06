"use client";

import { useEffect } from "react";
import { useMotionValue } from "framer-motion";

export function useParallax() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalize values between -1 and 1
      const xVal = (e.clientX / innerWidth) * 2 - 1;
      const yVal = (e.clientY / innerHeight) * 2 - 1;
      
      x.set(xVal);
      y.set(yVal);
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      
      // Beta is front-to-back tilt in degrees [-180, 180]
      // Gamma is left-to-right tilt in degrees [-90, 90]
      
      // Normalize to -1 to 1 range roughly
      const xVal = Math.max(-1, Math.min(1, e.gamma / 30)); 
      const yVal = Math.max(-1, Math.min(1, e.beta / 30));

      x.set(xVal);
      y.set(yVal);
    };

    // Detect if device orientation is supported and permitted
    // Note: iOS 13+ requires permission request, simpler for now to support mouse primarily 
    // and auto-detect if orientation events fire.
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [x, y]);

  return { x, y };
}
