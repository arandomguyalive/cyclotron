"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Disc, Music, Plus, Play, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { SecurePlayer } from "./SecurePlayer";
import { Timestamp, collection, addDoc, serverTimestamp, doc, updateDoc, increment, setDoc, deleteDoc, getCountFromServer, writeBatch, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useScreenshot } from "@/lib/useScreenshot";
import { useUser } from "@/lib/UserContext";
import { useToast } from "@/lib/ToastContext";
import { CommentModal } from "./CommentModal";

export interface Post {
  id: string;
  type?: "post" | "reel" | "story" | "text" | "drop";
  caption: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  userId: string;
  userHandle: string;
  userAvatar: string;
  likes: number;
  shares?: number;
  createdAt: Timestamp | Date;
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
  post: Post; 
  index: number;
  watermarkText?: string;
  isFree?: boolean; 
  tier?: string;
}

export function VortexItem({ post, index, watermarkText, isFree, tier = 'free' }: VortexProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [shares, setShares] = useState(post.shares || 0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const { firebaseUser, user: currentUserProfile } = useUser();
  const { toast } = useToast();

  useEffect(() => {
      if (!firebaseUser || !post.id) return;

      // 1. Real-time Post Listener (Likes/Shares)
      const unsubscribePost = onSnapshot(doc(db, "posts", post.id), (snap) => {
          if (snap.exists()) {
              const data = snap.data();
              setLikes(data.likes || 0);
              setShares(data.shares || 0);
          }
      });

      // 2. Check if I liked this post
      const unsubscribeLike = onSnapshot(doc(db, "users", firebaseUser.uid, "likes", post.id), (snap) => {
          setLiked(snap.exists());
      });

      // 3. Fetch Comment Count
      const unsubscribeComments = onSnapshot(collection(db, "posts", post.id, "comments"), (snap) => {
          setCommentsCount(snap.size);
      });

      return () => {
          unsubscribePost();
          unsubscribeLike();
          unsubscribeComments();
      };
  }, [post.id, firebaseUser]);

  useScreenshot(async () => {
      if (!firebaseUser || post.userId === firebaseUser.uid) return;
      
      const key = `shot_post_${post.id}`;
      const last = sessionStorage.getItem(key);
      if (last && Date.now() - parseInt(last) < 5000) return;
      sessionStorage.setItem(key, Date.now().toString());

      toast("⚠️ Content Protected. Owner notified.", "error");

      try {
          await addDoc(collection(db, "users", post.userId, "notifications"), {
              type: "SCREENSHOT_POST",
              actorId: firebaseUser.uid,
              actorHandle: currentUserProfile?.handle || "Unknown",
              postId: post.id,
              caption: post.caption?.substring(0, 20) || "Media",
              timestamp: serverTimestamp(),
              read: false
          });
      } catch (e) {
          console.error("Failed to log screenshot", e);
      }
  });

  // --- STANDARD POST RENDERING ---
  const p = post; 

  const toggleLike = async () => {
    if (!firebaseUser) {
        toast("Access Denied. Login required.", "error");
        return;
    }

    console.log(`[LIKE] Action. postId: ${post.id}, liked: ${liked}`);
    const batch = writeBatch(db);
    const postRef = doc(db, "posts", post.id);
    const userLikeRef = doc(db, "users", firebaseUser.uid, "likes", post.id);
    const ownerRef = doc(db, "users", p.userId);

    try {
        if (!liked) {
            // Increment Post count AND Owner's total reputation/likes
            batch.update(postRef, { likes: increment(1) });
            batch.update(ownerRef, { "stats.likes": increment(1) });
            
            batch.set(userLikeRef, {
                postId: post.id,
                mediaUrl: p.mediaUrl,
                mediaType: p.mediaType,
                timestamp: serverTimestamp()
            });

            if (p.userId !== firebaseUser.uid) {
                const notifRef = doc(collection(db, "users", p.userId, "notifications"));
                batch.set(notifRef, {
                    type: "LIKE",
                    actorId: firebaseUser.uid,
                    actorHandle: currentUserProfile?.handle || "Unknown",
                    postId: post.id,
                    timestamp: serverTimestamp(),
                    read: false
                });
            }
        } else {
            batch.update(postRef, { likes: increment(-1) });
            batch.update(ownerRef, { "stats.likes": increment(-1) });
            batch.delete(userLikeRef);
        }
        await batch.commit();
        console.log("[LIKE] Sync Complete.");
    } catch (e) {
        console.error("[LIKE] Sync Failed:", e);
    }
  };

  const handleShare = async () => {
      if (isFree) {
          toast("UPGRADE REQUIRED: Secure sharing restricted.", "error");
          return;
      }
      
      try {
          await updateDoc(doc(db, "posts", post.id), { shares: increment(1) });
      } catch (e) {}

      if (navigator.share) {
          try {
              await navigator.share({
                  title: "ABHED Signal",
                  text: `Intercepted transmission from @${p.userHandle}`,
                  url: window.location.origin + `/profile?view=${p.userId}`
              });
          } catch (err) {}
      } else {
          navigator.clipboard.writeText(window.location.origin + `/profile?view=${p.userId}`);
          toast("Link copied to clipboard.", "success");
      }
  };

  const handleComment = () => {
      // Allow opening for all, but canComment check inside modal will restrict input
      setIsCommentOpen(true);
  };

  // ... (Gradients - omitted for brevity)
  const gradients = [
    "bg-gradient-to-br from-brand-purple via-cyber-black to-brand-blue",
    "bg-gradient-to-bl from-brand-orange via-cyber-black to-brand-purple",
    "bg-gradient-to-tr from-brand-cyan via-cyber-black to-brand-blue",
  ];
  const bgGradient = gradients[index % gradients.length];

  const isForensicTier = ['gold', 'platinum', 'sovereign'].includes(tier);
  const isShieldTier = tier === 'premium';

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-cyber-black rounded-xl border border-white/10 shadow-lg translate-z-0 backface-hidden")}>
      {/* Media Layer */}
      <div className={cn("absolute inset-0 bg-black")}>
          {p.mediaType === 'video' ? (
              <SecurePlayer src={p.mediaUrl} />
          ) : (
              <img 
                src={p.mediaUrl} 
                alt="Post Content" 
                className="w-full h-full object-cover opacity-70"
              />
          )}
          
          {/* Signal Weak / Free Tier Overlay (High Performance) */}
          {isFree && (
              <div className="absolute inset-0 bg-black/40 backdrop-grayscale-[0.5] flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-screen" />
                  <div className="z-10 flex flex-col items-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-brand-orange animate-pulse" />
                      <span className="text-xs font-bold text-brand-orange uppercase tracking-widest">Signal Throttled</span>
                  </div>
              </div>
          )}
      </div>

      {/* Forensic Watermark (Gold+) - Overlay */}
      {watermarkText && isForensicTier && (
        <div 
            className="absolute inset-0 flex flex-wrap content-around justify-around pointer-events-none opacity-5 font-mono text-white text-[10px] z-10"
            style={{
                transform: 'rotate(-30deg) scale(1.2)',
                overflow: 'hidden',
            }}
        >
            {Array(15).fill(0).map((_, i) => (
                <span key={i} className="mx-4 my-2 whitespace-nowrap">{watermarkText}</span>
            ))}
        </div>
      )}

      {/* Shield Watermark (Premium) - Bottom Right Corner */}
      {watermarkText && isShieldTier && (
        <div className="absolute bottom-20 right-4 pointer-events-none z-10 bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-brand-cyan/20">
          <span className="text-brand-cyan/50 text-[10px] font-mono tracking-widest uppercase">
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
          <Link href={`/profile?view=${p.userId}`} className="relative mb-4">
             <div className="w-12 h-12 rounded-full border-2 border-cyber-white bg-gray-800 overflow-hidden">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userAvatar}`} alt="User" className="w-full h-full" />
             </div>
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-brand-hot-pink rounded-full p-0.5">
                 <Plus className="w-3 h-3 text-white" />
             </div>
          </Link>

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
            <button onClick={handleComment} className="p-2">
              <MessageCircle className="w-8 h-8 text-white drop-shadow-md" />
            </button>
            <span className="text-xs font-bold text-white drop-shadow-md">{commentsCount}</span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center gap-1">
            <button onClick={handleShare} className="p-2">
              <Share2 className="w-8 h-8 text-white drop-shadow-md" />
            </button>
            <span className="text-xs font-bold text-white drop-shadow-md">{shares}</span>
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
          <Link href={`/profile?view=${p.userId}`}>
            <h3 className="font-bold text-lg text-white drop-shadow-md flex items-center gap-2">
                @{p.userHandle}
                <span className="text-xs bg-brand-cyan/20 text-brand-cyan px-1.5 py-0.5 rounded border border-brand-cyan/50">PRO</span>
            </h3>
          </Link>
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
      
      <CommentModal 
        postId={p.id} 
        isOpen={isCommentOpen} 
        onClose={() => setIsCommentOpen(false)} 
        postOwnerId={p.userId}
      />
    </div>
  );
}