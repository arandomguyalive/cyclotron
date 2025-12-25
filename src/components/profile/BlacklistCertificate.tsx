import { motion, useMotionValue, useTransform } from "framer-motion";
import { User, ShieldCheck, Fingerprint, Download } from "lucide-react";
import { useMemo } from "react";

interface BlacklistCertificateProps {
    handle: string;
    dateJoined: string;
    id: string;
    onClose: () => void;
}

export function BlacklistCertificate({ handle, dateJoined, id, onClose }: BlacklistCertificateProps) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [0, 400], [10, -10]);
    const rotateY = useTransform(x, [0, 300], [-10, 10]);

    function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(event.clientX - rect.left);
        y.set(event.clientY - rect.top);
    }
    
    const qrPattern = useMemo(() => {
        const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const newPattern: boolean[] = [];
        for (let i = 0; i < 16; i++) {
            newPattern.push(((seed + i) % 2) === 0); // Simple deterministic pattern
        }
        return newPattern;
    }, [id]); // Regenerate if ID changes

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 perspective-1000" onClick={onClose}>
            <motion.div 
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                onMouseMove={handleMouse}
                onMouseLeave={() => { x.set(150); y.set(200); }} // Reset to center-ish
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-md bg-black rounded-xl overflow-hidden border border-amber-500/50 shadow-[0_0_80px_rgba(245,158,11,0.3)] cursor-none"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Gold/Metal Texture Effect */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-900/40 via-black to-black opacity-80 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                
                {/* Card Header */}
                <div className="relative p-8 flex flex-col items-center text-center border-b border-amber-500/20">
                    <div className="w-20 h-20 rounded-full border-2 border-amber-500 flex items-center justify-center bg-amber-500/10 mb-4 shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse">
                        <Fingerprint className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 tracking-[0.2em] uppercase glitch-text" data-text="BLACKLIST">
                        Blacklist
                    </h2>
                    <p className="text-[10px] text-amber-500/70 tracking-widest mt-2 uppercase font-mono">Founding Member Authorization</p>
                </div>

                {/* Card Details */}
                <div className="relative p-8 space-y-6 font-mono">
                    <div className="flex justify-between items-end border-b border-amber-500/10 pb-2 group hover:bg-white/5 transition-colors px-2 rounded">
                        <span className="text-xs text-amber-700/70 uppercase tracking-widest">Codename</span>
                        <span className="text-xl font-bold text-white tracking-wider">@{handle}</span>
                    </div>
                    
                    <div className="flex justify-between items-end border-b border-amber-500/10 pb-2 group hover:bg-white/5 transition-colors px-2 rounded">
                        <span className="text-xs text-amber-700/70 uppercase tracking-widest">Issued</span>
                        <span className="text-sm font-bold text-white tracking-wider">{dateJoined}</span>
                    </div>

                    <div className="flex justify-between items-end border-b border-amber-500/10 pb-2 group hover:bg-white/5 transition-colors px-2 rounded">
                        <span className="text-xs text-amber-700/70 uppercase tracking-widest">ID Hash</span>
                        <span className="text-xs font-bold text-amber-500 tracking-wider truncate max-w-[150px]">{id}</span>
                    </div>
                </div>

                {/* Footer / QR Area */}
                <div className="relative p-6 bg-gradient-to-r from-amber-950/30 to-black flex items-center justify-between border-t border-amber-500/20">
                    <div className="text-[9px] text-amber-700/80 leading-tight font-mono">
                        AUTHORITY: KM18 SOVEREIGN<br/>
                        CLASS: LIFETIME_TIER_3<br/>
                        STATUS: <span className="text-amber-500 font-bold animate-pulse">IRREVOCABLE</span>
                    </div>
                    {/* High-Tech Matrix Code */}
                    <div className="w-14 h-14 bg-black border border-amber-500/50 p-0.5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>
                        <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-px">
                             {qrPattern.map((isFilled, i) => (
                                 <div key={i} className={`w-full h-full ${isFilled ? 'bg-amber-500' : 'bg-black'} opacity-80`}></div>
                             ))}
                        </div>
                    </div>
                </div>

                {/* Holographic Sheen Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none mix-blend-overlay z-50"></div>
                
                {/* Scanner Line */}
                <motion.div 
                    className="absolute top-0 left-0 right-0 h-1 bg-amber-500/50 blur-[2px] z-40"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Download Button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, type: "spring", stiffness: 300, damping: 25 }}
                    onClick={() => alert("Certificate image saved to your secured drive. Share with discretion.")}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest text-sm rounded-full shadow-lg flex items-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    DOWNLOAD CERTIFICATE
                </motion.button>
            </motion.div>
        </div>
    );
}
