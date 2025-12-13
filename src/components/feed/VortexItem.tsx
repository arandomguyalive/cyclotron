"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Disc, Music, Plus, Play, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { SecurePlayer } from "./SecurePlayer";

export interface Post {
  id: string;
  type?: "post" | "reel" | "story";
  caption: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  userId: string;
  userHandle: string;
  userAvatar: string;
  likes: number;
  createdAt: any;
}

export interface Ad {
  id: string;
  type: "ad";
  title: string;
  description: string;
  cta: string;
  color: string;
}

interface VortexProps {
  post: Post | Ad;
  index: number;
  watermarkText?: string;
  isFree?: boolean; // New prop
}

export function VortexItem({ post, index, watermarkText, isFree }: VortexProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState((post as Post).likes || 0);

  // --- AD RENDERING ---
  if (post.type === "ad") {
      const ad = post as Ad;
      return (
        <div className="relative h-full w-full overflow-hidden bg-black rounded-xl border border-white/10 shadow-2xl flex flex-col items-center justify-center p-8 text-center">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`p-6 rounded-full bg-${ad.color}/10 mb-6 border border-${ad.color}/20`}
            >
                <ShieldCheck className={`w-16 h-16 text-${ad.color}`} />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">{ad.title}</h2>
            <p className="text-gray-400 mb-8 max-w-xs">{ad.description}</p>
            <button className={`px-8 py-4 bg-${ad.color} text-black font-bold rounded-xl hover:scale-105 transition-transform`}>
                {ad.cta}
            </button>
            <div className="absolute bottom-8 text-[10px] text-gray-600 uppercase tracking-widest">
                System Message • Signal Interference
            </div>
        </div>
      );
  }

  // --- STANDARD POST RENDERING ---
  const p = post as Post; // Type assertion

  const toggleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  // Generate a unique cyberpunk gradient based on index (fallback)
  const gradients = [
    "bg-gradient-to-br from-brand-purple via-cyber-black to-brand-blue",
    "bg-gradient-to-bl from-brand-orange via-cyber-black to-brand-purple",
    "bg-gradient-to-tr from-brand-cyan via-cyber-black to-brand-blue",
  ];
  const bgGradient = gradients[index % gradients.length];

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-cyber-black rounded-xl border border-white/10 shadow-2xl")}>
      {/* Media Layer */}
      <div className={cn("absolute inset-0 bg-black", isFree ? "filter grayscale blur-[1px] brightness-75 contrast-125" : "")}>
          {p.mediaType === 'video' ? (
              <SecurePlayer src={p.mediaUrl} />
          ) : (
              <img 
                src={p.mediaUrl} 
                alt="Post Content" 
                className="w-full h-full object-cover opacity-80"
              />
          )}
      </div>

      {/* Free Tier Overlay: Signal Weak */}
      {isFree && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-brand-orange/20 backdrop-blur-md px-3 py-1 rounded border border-brand-orange/30">
              <AlertTriangle className="w-4 h-4 text-brand-orange animate-pulse" />
              <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider">Signal Weak</span>
          </div>
      )}

      {/* Watermark Overlay for Premium+ Users */}
      {watermarkText && !isFree && (
        <div className="absolute bottom-4 right-4 pointer-events-none z-10">
          <span 
            className="text-white text-xs font-mono tracking-widest uppercase opacity-30"
            style={{ textShadow: '0 0 2px rgba(255,255,255,0.1)' }}
          >
            {watermarkText}
          </span>
        </div>
      )}

      {/* Gradient Overlay for Text Readability */}
      <motion.div 
        className={cn("absolute inset-0 opacity-30 mix-blend-overlay", bgGradient)}
      />
      


      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 pb-24 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
        
        {/* Right Sidebar (Actions) */}
        <div className="absolute right-2 bottom-24 flex flex-col items-center gap-6">
          
          {/* Profile Avatar with Follow + */}
          <div className="relative mb-4">
             <div className="w-12 h-12 rounded-full border-2 border-cyber-white bg-gray-800 overflow-hidden">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userAvatar}`} alt="User" className="w-full h-full" />
             </div>
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-brand-hot-pink rounded-full p-0.5">
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
                    className={cn("w-8 h-8 transition-colors", liked ? "fill-brand-hot-pink text-brand-hot-pink drop-shadow-[0_0_10px_#FF53B2]" : "text-white")} 
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
            <span className="text-xs font-bold text-white drop-shadow-md">0</span>
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
            @{p.userHandle}
            <span className="text-xs bg-brand-cyan/20 text-brand-cyan px-1.5 py-0.5 rounded border border-brand-cyan/50">PRO</span>
          </h3>
          <p className="text-sm text-gray-200 drop-shadow-sm line-clamp-2 whitespace-pre-wrap">
            {p.caption}
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
