"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, MapPin, Loader2, Navigation, AlertCircle } from 'lucide-react';
import { useToast } from '@/lib/ToastContext';

// Haversine Formula for distance calculation
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

interface GeoGateProps {
  targetLat: number;
  targetLng: number;
  radius: number;
  children: React.ReactNode;
}

export function GeoGate({ targetLat, targetLng, radius, children }: GeoGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAuthenticate = () => {
    setChecking(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("GPS Hardware Not Detected");
      setChecking(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = getDistanceInMeters(targetLat, targetLng, pos.coords.latitude, pos.coords.longitude);
        
        if (dist <= radius) {
          // Success
          setTimeout(() => {
             setUnlocked(true);
             setChecking(false);
             toast("COORDINATES MATCHED. DECRYPTING...", "success");
          }, 1500); // Dramatic pause
        } else {
          // Failure
          setTimeout(() => {
             setError(`TARGET MISMATCH: ${Math.round(dist/1000)}km AWAY`);
             setChecking(false);
             toast("ACCESS DENIED: OUTSIDE PERIMETER", "error");
          }, 1500);
        }
      },
      (err) => {
        console.error(err);
        setError("GPS SIGNAL LOST");
        setChecking(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (unlocked) {
     return (
        <motion.div 
           initial={{ filter: "blur(10px)", opacity: 0 }} 
           animate={{ filter: "blur(0px)", opacity: 1 }}
           className="relative"
        >
           <div className="absolute -top-3 -right-3 p-1 bg-green-500/20 border border-green-500 rounded-full z-10">
              <Unlock className="w-3 h-3 text-green-500" />
           </div>
           {children}
        </motion.div>
     );
  }

  return (
    <div className="bg-black/40 border border-brand-cyan/30 rounded-lg p-4 w-full min-w-[250px] max-w-sm flex flex-col items-center gap-4 relative overflow-hidden group">
      {/* Scanning effect */}
      {checking && (
         <div className="absolute inset-0 bg-brand-cyan/10 animate-pulse z-0" />
      )}
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

      <div className="z-10 flex flex-col items-center text-center">
         <div className="p-3 bg-brand-cyan/10 rounded-full border border-brand-cyan/50 mb-2 relative">
            {checking ? (
               <Loader2 className="w-6 h-6 text-brand-cyan animate-spin" />
            ) : error ? (
               <AlertCircle className="w-6 h-6 text-brand-orange" />
            ) : (
               <Lock className="w-6 h-6 text-brand-cyan" />
            )}
         </div>

         <h3 className="font-mono font-bold text-brand-cyan tracking-widest uppercase text-sm">
            {checking ? "TRIANGULATING..." : error ? "ACCESS DENIED" : "GEO-FENCED DATA"}
         </h3>
         
         <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase">
            {error ? error : `Restricted to ${radius}m Radius`}
         </p>

         {!checking && (
            <button 
               onClick={handleAuthenticate}
               className="mt-4 flex items-center gap-2 px-4 py-2 bg-brand-cyan text-black text-xs font-bold uppercase tracking-wider rounded hover:bg-brand-cyan/80 transition-colors"
            >
               <Navigation className="w-3 h-3" />
               Authenticate Position
            </button>
         )}
      </div>
    </div>
  );
}
