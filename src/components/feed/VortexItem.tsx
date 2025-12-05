"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Disc, Music, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface VortexProps {
  index: number;
}

export function VortexItem({ index }: VortexProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(1200 + index * 53);

  const toggleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  // Generate a unique cyberpunk gradient based on index
  const gradients = [
    "bg-gradient-to-br from-cyber-purple via-cyber-black to-cyber-blue",
    "bg-gradient-to-bl from-cyber-red via-cyber-black to-cyber-purple",
    "bg-gradient-to-tr from-cyber-green via-cyber-black to-cyber-blue",
  ];
  const bgGradient = gradients[index % gradients.length];

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-cyber-black rounded-xl border border-white/10 shadow-2xl")}>
      {/* Video Placeholder / Background */}
      <motion.div 
        className={cn("absolute inset-0 opacity-60", bgGradient)}
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
      
      {/* Noise Overlay for Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 pb-24 bg-gradient-to-t from-black/90 via-transparent to-transparent">
        
        {/* Right Sidebar (Actions) */}
        <div className="absolute right-2 bottom-24 flex flex-col items-center gap-6">
          
          {/* Profile Avatar with Follow + */}
          <div className="relative mb-4">
             <div className="w-12 h-12 rounded-full border-2 border-cyber-white bg-gray-800 overflow-hidden">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`} alt="User" className="w-full h-full" />
             </div>
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cyber-pink rounded-full p-0.5">
                 <Plus className="w-3 h-3 text-white" />
             </div>
          </div>

          {/* Like Button */}
          <div className="flex flex-col items-center gap-1">
            <button onClick={toggleLike} className="p-2">
              <motion.div
                animate={liked ? { scale: [1, 1.5, 1] } : {}}
                transition={{ duration: 0.2 }}
              >
                <Heart 
                    className={cn("w-8 h-8 transition-colors", liked ? "fill-cyber-red text-cyber-red drop-shadow-[0_0_10px_#FF4500]" : "text-white")} 
                />
              </motion.div>
            </button>
            <span className="text-xs font-bold text-white drop-shadow-md">{likes}</span>
          </div>

          {/* Comment Button */}
          <div className="flex flex-col items-center gap-1">
            <button className="p-2">
              <MessageCircle className="w-8 h-8 text-white drop-shadow-md" />
            </button>
            <span className="text-xs font-bold text-white drop-shadow-md">342</span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center gap-1">
            <button className="p-2">
              <Share2 className="w-8 h-8 text-white drop-shadow-md" />
            </button>
            <span className="text-xs font-bold text-white drop-shadow-md">Share</span>
          </div>

          {/* Spinning Disc (Music) */}
          <motion.div 
            className="mt-4 w-12 h-12 rounded-full bg-zinc-800 border-4 border-zinc-900 flex items-center justify-center overflow-hidden"
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
              <Disc className="w-8 h-8 text-gray-400" />
          </motion.div>
        </div>

        {/* Bottom Text Info */}
        <div className="max-w-[80%] space-y-2">
          <h3 className="font-bold text-lg text-white drop-shadow-md flex items-center gap-2">
            @cyber_user_{index}
            <span className="text-xs bg-cyber-blue/20 text-cyber-blue px-1.5 py-0.5 rounded border border-cyber-blue/50">PRO</span>
          </h3>
          <p className="text-sm text-gray-200 drop-shadow-sm line-clamp-2">
            Experiencing the future of UI design. #cyberpunk #nextjs #design #pwa {index}
          </p>
          
          <div className="flex items-center gap-2 text-white/80">
            <Music className="w-3 h-3" />
            <div className="text-xs overflow-hidden w-32">
              <div className="animate-marquee whitespace-nowrap">
                Original Audio - Cyberpunk 2077 Theme • Crystal Castles
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
