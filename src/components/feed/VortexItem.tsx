"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Disc, Music, Plus, Play, AlertTriangle, ShieldCheck, Cpu, Ban, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { SecurePlayer } from "./SecurePlayer";
import { Timestamp, collection, addDoc, serverTimestamp, doc, updateDoc, increment, setDoc, deleteDoc, getCountFromServer, writeBatch, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useScreenshot } from "@/lib/useScreenshot";
import { useUser } from "@/lib/UserContext";
import { useToast } from "@/lib/ToastContext";
import { useLocation } from "@/lib/LocationContext";
import { CommentModal } from "./CommentModal";
import { UserAvatar } from "../ui/UserAvatar";
import { IdentityBadges } from "../ui/IdentityBadges";
import { IconShareNeural } from "../ui/IconShareNeural";

export interface Post {
  id: string;
  type?: "post" | "reel" | "story" | "text" | "drop";
  caption: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  userId: string;
  userHandle: string;
  userAvatar: string;
  userAvatarUrl?: string;
  userTier?: string;
  userFaction?: string;
  userIsBlacklist?: boolean;
  userIsOwner?: boolean;
  
  // Geo-Targeting
  geoMode?: 'global' | 'allow' | 'deny';
  geoRules?: { type: 'country' | 'region' | 'city' | 'postal'; value: string }[];
  
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
  isActive?: boolean;
}

export function VortexItem({ post, index, watermarkText, isFree, tier = 'lobby', isActive = false }: VortexProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [shares, setShares] = useState(post.shares || 0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  
  const { firebaseUser, user: currentUserProfile } = useUser();
  const { location, loading: locationLoading } = useLocation();
  const { toast } = useToast();

  // Geo-Restriction Logic
  const isRestricted = useMemo(() => {
      if (!post.geoMode || post.geoMode === 'global') return false;
      if (currentUserProfile?.isOwner) return false; // Override for Owner

      // If loading location, treat as restricted until verified (or render loading state)
      if (!location) return true; 

      const rules = post.geoRules || [];
      const userGeo = {
          country: location.country.toUpperCase(),
          region: location.region.toUpperCase(),
          city: location.city.toUpperCase(),
          postal: location.postal.toUpperCase()
      };

      const hasMatch = rules.some(rule => {
          const ruleVal = rule.value.toUpperCase();
          switch (rule.type) {
              case 'country': return userGeo.country === ruleVal;
              case 'region': return userGeo.region === ruleVal;
              case 'city': return userGeo.city === ruleVal;
              case 'postal': return userGeo.postal === ruleVal;
              default: return false;
          }
      });

      if (post.geoMode === 'allow') return !hasMatch; // Block if NO match
      if (post.geoMode === 'deny') return hasMatch;   // Block if MATCH

      return false;
  }, [post.geoMode, post.geoRules, location, currentUserProfile?.isOwner]);

  useEffect(() => {
      // Optimization: Update local state from prop if it changes
      setLikes(post.likes || 0);
      setShares(post.shares || 0);

      // Listener Gating: Only subscribe to expensive sub-collections if Active
      if (!firebaseUser || !post.id || !isActive) return;

      const unsubscribeLike = onSnapshot(doc(db, "users", firebaseUser.uid, "likes", post.id), (snap) => {
          setLiked(snap.exists());
      });

      const unsubscribeComments = onSnapshot(collection(db, "posts", post.id, "comments"), (snap) => {
          setCommentsCount(snap.size);
      });

      return () => {
          unsubscribeLike();
          unsubscribeComments();
      };
  }, [post.id, post.likes, post.shares, firebaseUser, isActive]);

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
      } catch (e) {}
  });

  const p = post; 

  const toggleLike = async () => {
    if (!firebaseUser || !currentUserProfile) {
        toast("Access Denied. Login required.", "error");
        return;
    }

    const batch = writeBatch(db);
    const postRef = doc(db, "posts", post.id);
    const userLikeRef = doc(db, "users", firebaseUser.uid, "likes", post.id);
    const ownerRef = doc(db, "users", p.userId);

    try {
        if (!liked) {
            batch.update(postRef, { likes: increment(1) });
            batch.update(ownerRef, { "stats.likes": increment(1), "stats.reputation": increment(1) });
            batch.set(userLikeRef, { postId: post.id, mediaUrl: p.mediaUrl, mediaType: p.mediaType, timestamp: serverTimestamp() });
            if (p.userId !== firebaseUser.uid) {
                const notifRef = doc(collection(db, "users", p.userId, "notifications"));
                batch.set(notifRef, {
                    type: "LIKE",
                    actorId: firebaseUser.uid,
                    actorHandle: currentUserProfile?.handle || "Unknown",
                    postId: post.id,
                    caption: p.caption?.substring(0, 20) || "Transmission",
                    timestamp: serverTimestamp(),
                    read: false
                });
            }
        } else {
            batch.update(postRef, { likes: increment(-1) });
            batch.update(ownerRef, { "stats.likes": increment(-1), "stats.reputation": increment(-1) });
            batch.delete(userLikeRef);
        }
        await batch.commit();
    } catch (e: any) {
        try {
            const batch = writeBatch(db);
            if (!liked) {
                batch.update(postRef, { likes: (post.likes || 0) + 1 });
                batch.set(ownerRef, { stats: { likes: increment(1), reputation: increment(1) } }, { merge: true });
                batch.set(userLikeRef, { postId: post.id, mediaUrl: p.mediaUrl, mediaType: p.mediaType, timestamp: serverTimestamp() });
            } else {
                batch.update(postRef, { likes: Math.max(0, (post.likes || 0) - 1) });
                batch.set(ownerRef, { stats: { likes: increment(-1), reputation: increment(-1) } }, { merge: true });
                batch.delete(userLikeRef);
            }
            await batch.commit();
        } catch (retryErr) {}
    }
  };

  const handleShare = async () => {
      if (isFree && !currentUserProfile?.isOwner) {
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
      setIsCommentOpen(true);
  };

  const gradients = [
    "bg-gradient-to-br from-brand-purple via-cyber-black to-brand-blue",
    "bg-gradient-to-bl from-brand-orange via-cyber-black to-brand-purple",
    "bg-gradient-to-tr from-brand-cyan via-cyber-black to-brand-blue",
  ];
  const bgGradient = gradients[index % gradients.length];

  const isForensicTier = ['professional', 'ultra_elite', 'sovereign'].includes(tier);
  const isShieldTier = tier === 'shield';
  const showForensic = isForensicTier && !currentUserProfile?.visualOverride;
  const showShield = isShieldTier && !currentUserProfile?.visualOverride;
  const showGlitched = isFree && !currentUserProfile?.visualOverride;

  // Render Restricted Overlay
  if (isRestricted) {
      return (
        <div className={cn("relative h-full w-full overflow-hidden bg-cyber-black rounded-xl border border-white/10 shadow-lg flex items-center justify-center")}>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-screen" />
             <div className="absolute inset-0 bg-red-900/10 animate-pulse" />
             
             <div className="z-10 flex flex-col items-center gap-4 text-center px-6">
                 {locationLoading ? (
                     <>
                        <div className="w-12 h-12 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
                        <h3 className="text-xl font-bold text-brand-cyan font-mono tracking-widest">TRIANGULATING...</h3>
                        <p className="text-sm text-secondary-text">Acquiring signal coordinates.</p>
                     </>
                 ) : (
                     <>
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/50 mb-2">
                             <Ban className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-red-500 font-mono tracking-widest">SIGNAL JAMMED</h3>
                        <p className="text-sm text-secondary-text">Restricted Sector: Your location does not match the encryption keys for this transmission.</p>
                        
                        <div className="mt-4 p-3 bg-black/40 rounded border border-white/5 w-full">
                            <div className="flex items-center gap-2 justify-center text-xs text-white/50 font-mono">
                                <MapPin className="w-3 h-3" />
                                <span>{location?.city || 'UNKNOWN'}, {location?.country || 'UNK'}</span>
                            </div>
                        </div>
                     </>
                 )}
             </div>
        </div>
      );
  }

  import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Disc, Music, Plus, Play, AlertTriangle, ShieldCheck, Cpu, Ban, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { SecurePlayer } from "./SecurePlayer";
import { Timestamp, collection, addDoc, serverTimestamp, doc, updateDoc, increment, setDoc, deleteDoc, getCountFromServer, writeBatch, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useScreenshot } from "@/lib/useScreenshot";
import { useUser } from "@/lib/UserContext";
import { useToast } from "@/lib/ToastContext";
import { useLocation } from "@/lib/LocationContext";
import { CommentModal } from "./CommentModal";
import { UserAvatar } from "../ui/UserAvatar";
import { IdentityBadges } from "../ui/IdentityBadges";
import { IconShareNeural } from "../ui/IconShareNeural";
import { useZenMode } from "@/lib/ZenModeContext";

export interface Post {
  id: string;
  type?: "post" | "reel" | "story" | "text" | "drop";
  caption: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  userId: string;
  userHandle: string;
  userAvatar: string;
  userAvatarUrl?: string;
  userTier?: string;
  userFaction?: string;
  userIsBlacklist?: boolean;
  userIsOwner?: boolean;
  
  // Geo-Targeting
  geoMode?: 'global' | 'allow' | 'deny';
  geoRules?: { type: 'country' | 'region' | 'city' | 'postal'; value: string }[];
  
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
  isActive?: boolean;
}

export function VortexItem({ post, index, watermarkText, isFree, tier = 'lobby', isActive = false }: VortexProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [shares, setShares] = useState(post.shares || 0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  
  const { firebaseUser, user: currentUserProfile } = useUser();
  const { location, loading: locationLoading } = useLocation();
  const { toast } = useToast();
  const { isZenMode } = useZenMode();

  // Geo-Restriction Logic
  const isRestricted = useMemo(() => {
      if (!post.geoMode || post.geoMode === 'global') return false;
      if (currentUserProfile?.isOwner) return false; // Override for Owner

      // If loading location, treat as restricted until verified (or render loading state)
      if (!location) return true; 

      const rules = post.geoRules || [];
      const userGeo = {
          country: location.country.toUpperCase(),
          region: location.region.toUpperCase(),
          city: location.city.toUpperCase(),
          postal: location.postal.toUpperCase()
      };

      const hasMatch = rules.some(rule => {
          const ruleVal = rule.value.toUpperCase();
          switch (rule.type) {
              case 'country': return userGeo.country === ruleVal;
              case 'region': return userGeo.region === ruleVal;
              case 'city': return userGeo.city === ruleVal;
              case 'postal': return userGeo.postal === ruleVal;
              default: return false;
          }
      });

      if (post.geoMode === 'allow') return !hasMatch; // Block if NO match
      if (post.geoMode === 'deny') return hasMatch;   // Block if MATCH

      return false;
  }, [post.geoMode, post.geoRules, location, currentUserProfile?.isOwner]);

  useEffect(() => {
      // Optimization: Update local state from prop if it changes
      setLikes(post.likes || 0);
      setShares(post.shares || 0);

      // Listener Gating: Only subscribe to expensive sub-collections if Active
      if (!firebaseUser || !post.id || !isActive) return;

      const unsubscribeLike = onSnapshot(doc(db, "users", firebaseUser.uid, "likes", post.id), (snap) => {
          setLiked(snap.exists());
      });

      const unsubscribeComments = onSnapshot(collection(db, "posts", post.id, "comments"), (snap) => {
          setCommentsCount(snap.size);
      });

      return () => {
          unsubscribeLike();
          unsubscribeComments();
      };
  }, [post.id, post.likes, post.shares, firebaseUser, isActive]);

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
      } catch (e) {}
  });

  const p = post; 

  const toggleLike = async () => {
    if (!firebaseUser || !currentUserProfile) {
        toast("Access Denied. Login required.", "error");
        return;
    }

    const batch = writeBatch(db);
    const postRef = doc(db, "posts", post.id);
    const userLikeRef = doc(db, "users", firebaseUser.uid, "likes", post.id);
    const ownerRef = doc(db, "users", p.userId);

    try {
        if (!liked) {
            batch.update(postRef, { likes: increment(1) });
            batch.update(ownerRef, { "stats.likes": increment(1), "stats.reputation": increment(1) });
            batch.set(userLikeRef, { postId: post.id, mediaUrl: p.mediaUrl, mediaType: p.mediaType, timestamp: serverTimestamp() });
            if (p.userId !== firebaseUser.uid) {
                const notifRef = doc(collection(db, "users", p.userId, "notifications"));
                batch.set(notifRef, {
                    type: "LIKE",
                    actorId: firebaseUser.uid,
                    actorHandle: currentUserProfile?.handle || "Unknown",
                    postId: post.id,
                    caption: p.caption?.substring(0, 20) || "Transmission",
                    timestamp: serverTimestamp(),
                    read: false
                });
            }
        } else {
            batch.update(postRef, { likes: increment(-1) });
            batch.update(ownerRef, { "stats.likes": increment(-1), "stats.reputation": increment(-1) });
            batch.delete(userLikeRef);
        }
        await batch.commit();
    } catch (e: any) {
        try {
            const batch = writeBatch(db);
            if (!liked) {
                batch.update(postRef, { likes: (post.likes || 0) + 1 });
                batch.set(ownerRef, { stats: { likes: increment(1), reputation: increment(1) } }, { merge: true });
                batch.set(userLikeRef, { postId: post.id, mediaUrl: p.mediaUrl, mediaType: p.mediaType, timestamp: serverTimestamp() });
            } else {
                batch.update(postRef, { likes: Math.max(0, (post.likes || 0) - 1) });
                batch.set(ownerRef, { stats: { likes: increment(-1), reputation: increment(-1) } }, { merge: true });
                batch.delete(userLikeRef);
            }
            await batch.commit();
        } catch (retryErr) {}
    }
  };

  const handleShare = async () => {
      if (isFree && !currentUserProfile?.isOwner) {
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
      setIsCommentOpen(true);
  };

  const gradients = [
    "bg-gradient-to-br from-brand-purple via-cyber-black to-brand-blue",
    "bg-gradient-to-bl from-brand-orange via-cyber-black to-brand-purple",
    "bg-gradient-to-tr from-brand-cyan via-cyber-black to-brand-blue",
  ];
  const bgGradient = gradients[index % gradients.length];

  const isForensicTier = ['professional', 'ultra_elite', 'sovereign'].includes(tier);
  const isShieldTier = tier === 'shield';
  const showForensic = isForensicTier && !currentUserProfile?.visualOverride;
  const showShield = isShieldTier && !currentUserProfile?.visualOverride;
  const showGlitched = isFree && !currentUserProfile?.visualOverride;

  // Render Restricted Overlay
  if (isRestricted) {
      return (
        <div className={cn("relative h-full w-full overflow-hidden bg-cyber-black rounded-xl border border-white/10 shadow-lg flex items-center justify-center")}>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-screen" />
             <div className="absolute inset-0 bg-red-900/10 animate-pulse" />
             
             <div className="z-10 flex flex-col items-center gap-4 text-center px-6">
                 {locationLoading ? (
                     <>
                        <div className="w-12 h-12 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
                        <h3 className="text-xl font-bold text-brand-cyan font-mono tracking-widest">TRIANGULATING...</h3>
                        <p className="text-sm text-secondary-text">Acquiring signal coordinates.</p>
                     </>
                 ) : (
                     <>
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/50 mb-2">
                             <Ban className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-red-500 font-mono tracking-widest">SIGNAL JAMMED</h3>
                        <p className="text-sm text-secondary-text">Restricted Sector: Your location does not match the encryption keys for this transmission.</p>
                        
                        <div className="mt-4 p-3 bg-black/40 rounded border border-white/5 w-full">
                            <div className="flex items-center gap-2 justify-center text-xs text-white/50 font-mono">
                                <MapPin className="w-3 h-3" />
                                <span>{location?.city || 'UNKNOWN'}, {location?.country || 'UNK'}</span>
                            </div>
                        </div>
                     </>
                 )}
             </div>
        </div>
      );
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-cyber-black rounded-xl border border-white/10 shadow-lg translate-z-0 backface-hidden group", { 'group-hover:opacity-100 group-hover:pointer-events-auto': isZenMode })}>
      <div className={cn("absolute inset-0 bg-black")}>
          {p.mediaType === 'video' ? <SecurePlayer src={p.mediaUrl} isActive={isActive} /> : <img src={p.mediaUrl} alt="Post Content" className="w-full h-full object-cover opacity-70" />}
          {showGlitched && (
              <div className="absolute inset-0 bg-black/40 backdrop-grayscale-[0.5] flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-screen" />
                  <div className="z-10 flex flex-col items-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-brand-orange animate-pulse" />
                      <span className="text-xs font-bold text-brand-orange uppercase tracking-widest">Signal Throttled</span>
                  </div>
              </div>
          )}
          {isFree && currentUserProfile?.isOwner && (
              <div className="absolute top-4 left-4 p-1.5 bg-brand-cyan/20 rounded-lg border border-brand-cyan/50 z-20" title="Architect Bypass Active">
                  <Cpu className="w-4 h-4 text-brand-cyan" />
              </div>
          )}
      </div>

      {watermarkText && showForensic && (
        <div className="absolute inset-0 flex flex-wrap content-around justify-around pointer-events-none opacity-5 font-mono text-white text-[10px] z-10" style={{ transform: 'rotate(-30deg) scale(1.2)', overflow: 'hidden' }}>
            {Array(15).fill(0).map((_, i) => <span key={i} className="mx-4 my-2 whitespace-nowrap">{watermarkText}</span>)}
        </div>
      )}

      {watermarkText && showShield && (
        <div className="absolute bottom-20 right-4 pointer-events-none z-10 bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-brand-cyan/20">
          <span className="text-brand-cyan/50 text-[10px] font-mono tracking-widest uppercase">{watermarkText}</span>
        </div>
      )}

      {!isZenMode && <motion.div className={cn("absolute inset-0 opacity-30 mix-blend-overlay", bgGradient)} />}
      
      <div className={cn("absolute inset-0 flex flex-col justify-end p-4 pb-24 transition-opacity duration-300", {
          "bg-gradient-to-t from-black/90 via-black/20 to-transparent": !isZenMode,
          "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto": isZenMode
      })}>
        <div className="absolute right-2 bottom-24 flex flex-col items-center gap-6">
          <Link href={`/profile?view=${p.userId}`} className="relative mb-4">
             <UserAvatar seed={p.userAvatar} url={p.userAvatarUrl} size="lg" isBlacklist={p.userIsBlacklist} className="border-cyber-white" />
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-brand-hot-pink rounded-full p-0.5"><Plus className="w-3 h-3 text-white" /></div>
          </Link>

          <div className="flex flex-col items-center gap-1">
            <button onClick={toggleLike} className="p-2">
              <motion.div animate={liked ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.2 }}>
                <Heart className={cn("w-8 h-8 transition-colors", liked ? "fill-brand-hot-pink text-brand-hot-pink drop-shadow-[0_0_10px_#FF53B2]" : "text-white")} />
              </motion.div>
            </button>
            <span className="text-xs font-bold text-white drop-shadow-md">{likes}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button onClick={handleComment} className="p-2"><MessageCircle className="w-8 h-8 text-white drop-shadow-md" /></button>
            <span className="text-xs font-bold text-white drop-shadow-md">{commentsCount}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button onClick={handleShare} className="p-2"><IconShareNeural className="w-8 h-8 text-white drop-shadow-md" /></button>
            <span className="text-xs font-bold text-white drop-shadow-md">{shares}</span>
          </div>

          {!isZenMode && (
            <motion.div className="mt-4 w-12 h-12 rounded-full bg-zinc-800 border-4 border-zinc-900 flex items-center justify-center overflow-hidden" animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}>
                <Disc className="w-8 h-8 text-gray-400" />
            </motion.div>
          )}
        </div>

        <div className="max-w-[80%] space-y-2">
          <Link href={`/profile?view=${p.userId}`} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <UserAvatar seed={p.userAvatar} url={p.userAvatarUrl} size="sm" isBlacklist={p.userIsBlacklist} showRing={false} />
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-white drop-shadow-md">@{p.userHandle}</h3>
                    <IdentityBadges tier={p.userTier} faction={p.userFaction} isBlacklist={p.userIsBlacklist} isOwner={p.userIsOwner} size="sm" />
                </div>
            </div>
          </Link>
          <p className="text-sm text-gray-200 drop-shadow-sm line-clamp-2 whitespace-pre-wrap font-light">{p.caption}</p>
          <div className="flex items-center gap-2 text-white/80">
            <Music className="w-3 h-3" />
            <div className="text-xs overflow-hidden w-32"><div className="animate-marquee whitespace-nowrap">Original Audio - Cyberpunk 2077 Theme • Crystal Castles</div></div>
          </div>
        </div>
      </div>
      
      <CommentModal postId={p.id} isOpen={isCommentOpen} onClose={() => setIsCommentOpen(false)} postOwnerId={p.userId} />
    </div>
  );
}
