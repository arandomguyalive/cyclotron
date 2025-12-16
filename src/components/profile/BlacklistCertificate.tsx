import { motion } from "framer-motion";
import { User } from "lucide-react";

interface BlacklistCertificateProps {
    handle: string;
    dateJoined: string;
    id: string;
    onClose: () => void;
}

export function BlacklistCertificate({ handle, dateJoined, id, onClose }: BlacklistCertificateProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4" onClick={onClose}>
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, rotateX: 20 }}
                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                className="relative w-full max-w-md bg-black rounded-xl overflow-hidden border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.2)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Gold/Metal Texture Effect */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black"></div>
                
                {/* Card Header */}
                <div className="relative p-8 flex flex-col items-center text-center border-b border-white/10">
                    <div className="w-16 h-16 rounded-full border-2 border-amber-500 flex items-center justify-center bg-amber-500/10 mb-4 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                        <User className="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 tracking-[0.2em] uppercase">
                        Blacklist
                    </h2>
                    <p className="text-[10px] text-amber-500/70 tracking-widest mt-1 uppercase">Founding Member Authorization</p>
                </div>

                {/* Card Details */}
                <div className="relative p-8 space-y-6">
                    <div className="flex justify-between items-end border-b border-white/10 pb-2">
                        <span className="text-xs text-zinc-500 uppercase tracking-widest">Codename</span>
                        <span className="text-xl font-bold text-white tracking-wider font-mono">@{handle}</span>
                    </div>
                    
                    <div className="flex justify-between items-end border-b border-white/10 pb-2">
                        <span className="text-xs text-zinc-500 uppercase tracking-widest">Issued</span>
                        <span className="text-sm font-bold text-white tracking-wider font-mono">{dateJoined}</span>
                    </div>

                    <div className="flex justify-between items-end border-b border-white/10 pb-2">
                        <span className="text-xs text-zinc-500 uppercase tracking-widest">ID Hash</span>
                        <span className="text-xs font-bold text-zinc-400 tracking-wider font-mono truncate max-w-[150px]">{id}</span>
                    </div>
                </div>

                {/* Footer / QR Area */}
                <div className="relative p-6 bg-white/5 flex items-center justify-between">
                    <div className="text-[10px] text-zinc-500 leading-tight">
                        AUTHORITY: KM18 SOVEREIGN<br/>
                        CLASS: LIFETIME<br/>
                        STATUS: IRREVOCABLE
                    </div>
                    {/* Fake QR Code */}
                    <div className="w-12 h-12 bg-white p-1">
                        <div className="w-full h-full bg-black flex flex-wrap content-start">
                             {/* Just a pixel pattern */}
                             {Array(16).fill(0).map((_, i) => (
                                 <div key={i} className={`w-1/4 h-1/4 ${Math.random() > 0.5 ? 'bg-white' : 'bg-black'}`}></div>
                             ))}
                        </div>
                    </div>
                </div>

                {/* Holographic Sheen Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none mix-blend-overlay"></div>
            </motion.div>
        </div>
    );
}
