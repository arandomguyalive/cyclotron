import { ShieldAlert, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function RestrictedPage() {
  const [ipHash, setIpHash] = useState("LOADING...");

  useEffect(() => {
      setIpHash(Math.random().toString(36).substring(7).toUpperCase());
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-red-500 font-mono p-4 overflow-hidden relative">
      {/* Background Noise/Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, #2a0000 25%, #2a0000 26%, transparent 27%, transparent 74%, #2a0000 75%, #2a0000 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #2a0000 25%, #2a0000 26%, transparent 27%, transparent 74%, #2a0000 75%, #2a0000 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}>
      </div>

      <div className="z-10 flex flex-col items-center max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-500">
        
        <div className="relative">
            <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 animate-pulse"></div>
            <ShieldAlert className="w-32 h-32 text-red-600 mb-4 animate-pulse" />
        </div>

        <h1 className="text-5xl font-black tracking-tighter uppercase glitch-text" data-text="ACCESS DENIED">
          ACCESS DENIED
        </h1>

        <div className="border border-red-900/50 bg-red-950/20 p-6 rounded-sm backdrop-blur-sm">
            <div className="flex items-center justify-center space-x-2 text-red-400 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold tracking-widest uppercase text-sm">Sovereign Protocol 99</span>
            </div>
            <p className="text-lg text-red-200 uppercase tracking-widest font-bold">
              Geo-Restricted Zone
            </p>
            <p className="text-xs text-red-500/70 mt-4 leading-relaxed">
              Your connection trace originates from a restricted jurisdiction. 
              Content delivery has been intercepted by the Sovereign Firewall.
            </p>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-red-900 to-transparent my-8"></div>

        <div className="text-xs text-red-700 font-mono">
            IP_HASH: {ipHash} <br/>
            NODE: BLK-MARKET-ALPHA
        </div>

        <Link href="/" className="mt-8 px-8 py-3 border border-red-600 text-red-600 hover:bg-red-600 hover:text-black transition-colors uppercase tracking-widest text-sm font-bold">
            Return to Safety
        </Link>
      </div>
    </div>
  );
}
