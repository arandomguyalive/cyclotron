"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Settings, Grid, Heart, MessageCircle, ShoppingBag, Wallet, ShieldCheck, Star, Lock, UserPlus, UserCheck, ShieldAlert, Loader2 } from "lucide-react";
import { SettingsModal } from "@/components/profile/SettingsModal";
import { BlacklistCertificate } from "@/components/profile/BlacklistCertificate";
import { useSonic } from "@/lib/SonicContext";
import { useUser } from "@/lib/UserContext";
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc, orderBy, limit, increment, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/lib/ToastContext";

interface MinimalPost {
    id: string;
    mediaUrl: string;
    mediaType: "image" | "video";
}

interface UserProfileData {
    uid: string;
    displayName: string;
    handle: string;
    bio: string;
    avatarSeed: string;
    coverImage?: string;
    tier: string;
    stats?: {
        following: number;
        followers: number;
        likes: number;
        credits: number;
        reputation: number;
    };
}

function ProfileContent() {
  const { user: currentUser, loading: userLoading, firebaseUser } = useUser();
  const { playClick, playHaptic } = useSonic();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewId = searchParams.get('view');

  const isOwnProfile = !viewId || viewId === firebaseUser?.uid;

  const [targetUser, setTargetUser] = useState<UserProfileData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [activeTab, setActiveTab] = useState<'grid' | 'likes' | 'wallet'>('grid');
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPosts, setUserPosts] = useState<MinimalPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<MinimalPost[]>([]);
  const [fetching, setFetching] = useState(false);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  useEffect(() => {
    if (!userLoading && !firebaseUser) {
        router.push("/login");
        return;
    }
    
    const fetchData = async () => {
        const uidToFetch = viewId || firebaseUser?.uid;
        if (!uidToFetch) return;

        setFetching(true);
        const safetyTimer = setTimeout(() => {
            setFetching(false);
            setTargetUser(prev => prev || {
                 uid: uidToFetch,
                 displayName: "Network Error",
                 handle: "timeout_signal",
                 bio: "Connection timed out.",
                 avatarSeed: uidToFetch,
                 tier: "free",
                 stats: { following: 0, followers: 0, likes: 0, credits: 0, reputation: 0 }
             } as UserProfileData);
        }, 5000);

        try {
            if (uidToFetch.startsWith("mock-")) {
                setTargetUser({
                    uid: uidToFetch,
                    displayName: "Operative " + uidToFetch.split('-')[1],
                    handle: "mock_agent_" + uidToFetch.split('-')[1],
                    bio: "Simulated operative data.",
                    avatarSeed: uidToFetch,
                    tier: "premium", 
                    stats: { following: 10, followers: 50, likes: 100, credits: 5000, reputation: 20 }
                } as UserProfileData);
                return;
            }

            let profileData: UserProfileData | null = null;
            try {
                if (isOwnProfile && currentUser) {
                    profileData = { uid: firebaseUser!.uid, ...currentUser } as UserProfileData;
                } else {
                    const userDoc = await getDoc(doc(db, "users", uidToFetch));
                    if (userDoc.exists()) {
                        profileData = { uid: userDoc.id, ...userDoc.data() } as UserProfileData;
                    }
                }
            } catch (err) {}

            if (!profileData) {
                if (isOwnProfile && currentUser) {
                     profileData = { uid: firebaseUser!.uid, ...currentUser } as UserProfileData;
                } else {
                     profileData = {
                         uid: uidToFetch,
                         displayName: "Unknown Operative",
                         handle: "encrypted",
                         bio: "Data restricted.",
                         avatarSeed: uidToFetch,
                         tier: "free",
                         stats: { following: 0, followers: 0, likes: 0, credits: 0, reputation: 0 }
                     };
                }
            }
            
            setTargetUser(profileData);

            // Fetch Posts
            try {
                const postsQ = query(collection(db, "posts"), where("userId", "==", uidToFetch), limit(18));
                const postsSnap = await getDocs(postsQ);
                setUserPosts(postsSnap.docs.map(d => ({ id: d.id, ...d.data() } as MinimalPost)));
            } catch (err) {}

            // Fetch Likes
            if (isOwnProfile) {
                try {
                    const likesQ = query(collection(db, "users", firebaseUser!.uid, "likes"), orderBy("timestamp", "desc"), limit(18));
                    const likesSnap = await getDocs(likesQ);
                    setLikedPosts(likesSnap.docs.map(d => ({ id: d.id, ...d.data() } as MinimalPost)));
                } catch (err) {}
            }

            // Check Follow Status
            if (!isOwnProfile && firebaseUser) {
                try {
                    const followRef = doc(db, "users", firebaseUser.uid, "following", uidToFetch);
                    const followSnap = await getDoc(followRef);
                    if (followSnap.exists()) {
                        setIsFollowing(true);
                    } else {
                        // Check simulation storage
                        const simFollowing = localStorage.getItem(`sim_following_${uidToFetch}`);
                        setIsFollowing(simFollowing === "true");
                    }
                } catch (e) {
                    // Fallback on error
                    const simFollowing = localStorage.getItem(`sim_following_${uidToFetch}`);
                    setIsFollowing(simFollowing === "true");
                }
            }

        } catch (e) {
            console.error("Profile sync error", e);
        } finally {
            clearTimeout(safetyTimer);
            setFetching(false);
        }
    };

    if (firebaseUser) fetchData();
  }, [viewId, firebaseUser, userLoading, currentUser, isOwnProfile]);

  const handleFollow = async () => {
      if (!firebaseUser || !targetUser || !currentUser) return;
      playClick(600, 0.1, 'square');
      
      const followRef = doc(db, "users", firebaseUser.uid, "following", targetUser.uid);
      const followerRef = doc(db, "users", targetUser.uid, "followers", firebaseUser.uid);
      const targetUserDocRef = doc(db, "users", targetUser.uid);
      const currentUserDocRef = doc(db, "users", firebaseUser.uid);

      try {
          if (isFollowing) {
              const batch = writeBatch(db);
              batch.delete(followRef);
              batch.delete(followerRef);
              
              // Safely decrement (handles both old string and new numeric logic via fallback)
              batch.update(targetUserDocRef, { "stats.followers": increment(-1) });
              batch.update(currentUserDocRef, { "stats.following": increment(-1) });
              
              await batch.commit();
              setIsFollowing(false);
              toast(`Unfollowed @${targetUser.handle}`, "info");
          } else {
              const batch = writeBatch(db);
              batch.set(followRef, { timestamp: serverTimestamp() });
              batch.set(followerRef, { timestamp: serverTimestamp() });
              
              // Safely increment
              batch.update(targetUserDocRef, { "stats.followers": increment(1) });
              batch.update(currentUserDocRef, { "stats.following": increment(1) });
              
              // Add Notification for Target User
              const notifRef = doc(collection(db, "users", targetUser.uid, "notifications"));
              batch.set(notifRef, {
                  type: "FOLLOW",
                  actorId: firebaseUser.uid,
                  actorHandle: currentUser.handle || "Unknown",
                  timestamp: serverTimestamp(),
                  read: false
              });

              await batch.commit();
              setIsFollowing(true);
              toast(`Following @${targetUser.handle}`, "success");
          }
      } catch (e: any) { 
          console.error("Firestore follow failed", e);
          
          // CRITICAL FIX: If 'increment' fails because field was a string, 
          // we force convert it to a number via a direct set/merge
          if (e.code === 'permission-denied' || e.message?.includes('increment')) {
              try {
                  const targetFollowers = Number(targetUser.stats?.followers || 0);
                  const myFollowing = Number(currentUser.stats?.following || 0);
                  
                  const batch = writeBatch(db);
                  if (isFollowing) {
                      batch.delete(followRef);
                      batch.delete(followerRef);
                      batch.set(targetUserDocRef, { stats: { followers: Math.max(0, targetFollowers - 1) } }, { merge: true });
                      batch.set(currentUserDocRef, { stats: { following: Math.max(0, myFollowing - 1) } }, { merge: true });
                  } else {
                      batch.set(followRef, { timestamp: serverTimestamp() });
                      batch.set(followerRef, { timestamp: serverTimestamp() });
                      batch.set(targetUserDocRef, { stats: { followers: targetFollowers + 1 } }, { merge: true });
                      batch.set(currentUserDocRef, { stats: { following: myFollowing + 1 } }, { merge: true });
                  }
                  await batch.commit();
                  setIsFollowing(!isFollowing);
                  toast("Connection Stabilized. Stats Synced.", "success");
              } catch (retryErr) {
                  console.error("Follow recovery failed", retryErr);
                  toast("Protocol Error: Check subscription tier.", "error");
              }
          } else {
              toast("Transmission failed. Secure channel required.", "error");
          }
      }
  };

  const handleStatClick = (type: string) => {
      handleButtonClick();
      if (currentUser?.tier === 'free') {
          playClick(150, 0.2, 'sawtooth');
          toast(`UPGRADE REQUIRED: ${type} list is encrypted.`, "error");
      } else {
          toast(`${type} module online.`, "success");
      }
  };

  const handleButtonClick = () => {
    playClick(300, 0.05, 'square');
    playHaptic();
  };

  if (userLoading || fetching || !targetUser) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-primary-bg text-accent-1 font-mono animate-pulse">
              ESTABLISHING ENCRYPTED UPLINK...
          </div>
      );
  }

  const targetTier = (targetUser?.tier || 'free').toLowerCase();
  const currentTier = (currentUser?.tier || 'free').toLowerCase();

  const canViewDetail = isOwnProfile || 
                       currentTier === 'sovereign' || 
                       (currentTier === 'lifetime' && (targetTier === 'lifetime' || targetTier === 'gold' || targetTier === 'premium' || targetTier === 'free')) ||
                       currentTier === targetTier;

  return (
    <div className="min-h-screen bg-primary-bg text-primary-text pb-24">
      <div className="h-64 relative bg-gradient-to-r from-accent-2 via-primary-bg to-accent-1 opacity-50 overflow-hidden">
        {targetUser.coverImage ? (
            <motion.img style={{ y, opacity }} src={targetUser.coverImage} className="w-full h-full object-cover scale-110" />
        ) : (
            <motion.div style={{ y, opacity }} className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay scale-110" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-bg/20 to-primary-bg" />
      </div>

      <div className="px-4 -mt-20 relative z-10">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative rounded-3xl bg-secondary-bg/90 border border-border-color backdrop-blur-xl shadow-2xl p-6 overflow-hidden">
              {!canViewDetail && (
                  <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
                      <ShieldAlert className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
                      <h2 className="text-xl font-bold text-red-500 uppercase tracking-tighter">Encryption Mismatch</h2>
                      <p className="text-xs text-zinc-400 mt-2 font-mono">Target is on {targetUser.tier.toUpperCase()} band.<br/>Your signal is incompatible.</p>
                      <button onClick={() => router.back()} className="mt-6 px-6 py-2 border border-red-500 text-red-500 rounded text-xs font-bold uppercase hover:bg-red-500/10 transition-colors">Abort</button>
                  </div>
              )}

              <div className="flex justify-between items-end relative z-30">
                <div className="w-28 h-28 rounded-full border-4 border-primary-bg bg-primary-bg overflow-hidden shadow-lg -mb-4">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.avatarSeed}`} alt="Profile" className="w-full h-full" />
                </div>
                <div className="flex gap-2 mb-2">
                  {isOwnProfile ? (
                    <>
                      <Link href="/market" onClick={handleButtonClick} className="p-2 bg-secondary-bg/10 rounded-full border border-border-color text-brand-orange"><ShoppingBag className="w-6 h-6" /></Link>
                      <Link href="/chat" onClick={handleButtonClick} className="p-2 bg-secondary-bg/10 rounded-full border border-border-color"><MessageCircle className="w-6 h-6" /></Link>
                      <button onClick={() => { setIsSettingsOpen(true); handleButtonClick(); }} className="p-2 bg-secondary-bg/10 rounded-full border border-border-color"><Settings className="w-6 h-6" /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => router.push(`/chat?userId=${targetUser.uid}`)} className="p-2 bg-secondary-bg/10 rounded-full border border-border-color"><MessageCircle className="w-6 h-6 text-primary-text" /></button>
                      <button onClick={handleFollow} className={`p-2 rounded-full border transition-colors ${isFollowing ? 'bg-accent-1 text-black border-accent-1' : 'bg-secondary-bg/10 border-border-color text-accent-1'}`}>
                        {isFollowing ? <UserCheck className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 relative z-30">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{targetUser.displayName}</h1>
                    {targetUser.tier === 'lifetime' && <Star className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />}
                </div>
                <p className="text-accent-1 font-mono text-sm">@{targetUser.handle}</p>
                <p className="mt-2 text-sm text-secondary-text leading-relaxed whitespace-pre-wrap">{targetUser.bio}</p>
              </div>

              <div className="flex gap-6 mt-6 py-4 border-y border-border-color relative z-30 overflow-x-auto">
                <button onClick={() => handleStatClick('Following')}><Stat label="Following" value={targetUser.stats?.following || 0} /></button>
                <button onClick={() => handleStatClick('Followers')}><Stat label="Followers" value={targetUser.stats?.followers || 0} /></button>
                <button onClick={() => handleStatClick('Likes')}><Stat label="Likes" value={targetUser.stats?.likes || 0} /></button>
                <Stat label="Rep" value={targetUser.stats?.reputation || 0} />
                
                {targetUser.tier === 'lifetime' && isOwnProfile && (
                    <button onClick={() => setShowCertificate(true)} className="flex flex-col items-center justify-center text-amber-500 animate-pulse">
                        <ShieldCheck className="w-6 h-6 mb-1" />
                        <span className="text-[10px] uppercase font-bold">Certificate</span>
                    </button>
                )}
              </div>
          </motion.div>

        <div className="flex mt-6 gap-4 border-b border-white/10 pb-2">
          <button onClick={() => setActiveTab('grid')} className={`flex-1 py-2 flex justify-center transition-colors ${activeTab === 'grid' ? 'text-accent-1 border-b-2 border-accent-1' : 'text-zinc-500'}`}><Grid className="w-5 h-5" /></button>
          {isOwnProfile && (
            <>
              <button onClick={() => setActiveTab('likes')} className={`flex-1 py-2 flex justify-center transition-colors ${activeTab === 'likes' ? 'text-accent-1 border-b-2 border-accent-1' : 'text-zinc-500'}`}><Heart className="w-5 h-5" /></button>
              <button onClick={() => setActiveTab('wallet')} className={`flex-1 py-2 flex justify-center transition-colors ${activeTab === 'wallet' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-zinc-500'}`}><Wallet className="w-5 h-5" /></button>
            </>
          )}
        </div>

        <div className="mt-4 min-h-[300px]">
            {activeTab === 'grid' && (
                <div className="grid grid-cols-3 gap-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {userPosts.length > 0 ? userPosts.map((post) => (
                    <div key={post.id} className="aspect-square bg-secondary-bg/5 relative overflow-hidden group rounded-sm border border-transparent hover:border-accent-1/50 transition-colors">
                        {post.mediaType === 'video' ? <video src={post.mediaUrl} className="w-full h-full object-cover" muted /> : <img src={post.mediaUrl} className="w-full h-full object-cover" />}
                    </div>
                  )) : <div className="col-span-3 flex flex-col items-center justify-center h-48 text-zinc-500"><Lock className="w-12 h-12 mb-4 opacity-20" /><p className="text-sm font-mono uppercase tracking-widest">No transmissions</p></div>}
                </div>
            )}

            {isOwnProfile && activeTab === 'likes' && (
                <div className="grid grid-cols-3 gap-1">
                    {likedPosts.length > 0 ? likedPosts.map((post) => (
                        <div key={post.id} className="aspect-square bg-secondary-bg/5 relative overflow-hidden group rounded-sm">
                            <img src={post.mediaUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"><Heart className="w-6 h-6 text-brand-hot-pink fill-brand-hot-pink" /></div>
                        </div>
                    )) : <div className="col-span-3 flex flex-col items-center justify-center h-48 text-zinc-500"><Heart className="w-12 h-12 mb-4 opacity-20" /><p className="text-sm font-mono uppercase tracking-widest">No saved signals</p></div>}
                </div>
            )}

            {isOwnProfile && activeTab === 'wallet' && (
                <div className="p-4 bg-black/80 border border-brand-orange/30 rounded-xl">
                    <h3 className="text-xs text-brand-orange/70 uppercase mb-4">Total Asset Value</h3>
                    <div className="text-4xl font-mono text-white font-bold mb-6">₹0.00</div>
                    <button className="w-full py-3 bg-brand-orange text-black font-bold uppercase text-sm">Connect Payout</button>
                </div>
            )}
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {showCertificate && isOwnProfile && <BlacklistCertificate handle={currentUser?.handle || ''} dateJoined={new Date().toLocaleDateString()} id={firebaseUser?.uid.substring(0, 8).toUpperCase() || ''} onClose={() => setShowCertificate(false)} />}
    </div>
  );
}

function Stat({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex flex-col min-w-[60px]">
      <span className="font-bold text-lg whitespace-nowrap">{value}</span>
      <span className="text-xs text-secondary-text uppercase tracking-wider whitespace-nowrap">{label}</span>
    </div>
  );
}

export default function ProfilePage() {
    return <Suspense><ProfileContent /></Suspense>;
}
