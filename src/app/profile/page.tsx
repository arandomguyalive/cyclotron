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
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
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
        following: string;
        followers: string;
        likes: string;
        credits: string;
        reputation: string;
    };
}

function ProfileContent() {
  const { user: currentUser, loading: userLoading, firebaseUser } = useUser();
  const { playClick } = useSonic();
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

  // Parallax Scroll Logic
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  useEffect(() => {
    if (!userLoading && !firebaseUser) {
        router.push("/login");
        return;
    }
    
    const fetchData = async () => {
        setFetching(true);
        try {
            const uidToFetch = viewId || firebaseUser?.uid;
            if (!uidToFetch) return;

            // Handle Mock Users
            if (uidToFetch.startsWith("mock-")) {
                setTargetUser({
                    uid: uidToFetch,
                    displayName: "Operative " + uidToFetch.split('-')[1],
                    handle: "mock_agent_" + uidToFetch.split('-')[1],
                    bio: "This is a simulated profile. Real data encrypted.",
                    avatarSeed: uidToFetch,
                    tier: "premium", // Mock users are premium
                    stats: { following: "10", followers: "50", likes: "100", credits: "5000", reputation: "20" }
                } as UserProfileData);
                setFetching(false);
                return;
            }

            // Fetch User Data
            let profileData: UserProfileData;
            if (isOwnProfile && currentUser) {
                profileData = { uid: firebaseUser!.uid, ...currentUser } as UserProfileData;
            } else {
                const userDoc = await getDoc(doc(db, "users", uidToFetch));
                if (userDoc.exists()) {
                    profileData = { uid: userDoc.id, ...userDoc.data() } as UserProfileData;
                } else {
                    toast("User not found", "error");
                    router.push("/profile");
                    return;
                }
            }
            
            // Apply simulated stats (Persistence for Permission Denied scenario)
            if (!uidToFetch.startsWith("mock-")) {
                const simStats = JSON.parse(localStorage.getItem(`sim_stats_${uidToFetch}`) || '{}');
                if (simStats.followers) {
                    // Initialize stats if missing from DB
                    if (!profileData.stats) {
                        profileData.stats = { following: '0', followers: '0', likes: '0', credits: '0', reputation: '0' };
                    }
                    console.log(`[Profile] Applying simulated followers: ${simStats.followers}`);
                    profileData.stats = { ...profileData.stats, followers: simStats.followers };
                }
                if (simStats.following) {
                    if (!profileData.stats) {
                        profileData.stats = { following: '0', followers: '0', likes: '0', credits: '0', reputation: '0' };
                    }
                    console.log(`[Profile] Applying simulated following: ${simStats.following}`);
                    profileData.stats = { ...profileData.stats, following: simStats.following };
                }
            }
            
            setTargetUser(profileData);

            // Fetch Posts
            const postsQ = query(
                collection(db, "posts"),
                where("userId", "==", uidToFetch),
                limit(18)
            );
            const postsSnap = await getDocs(postsQ);
            setUserPosts(postsSnap.docs.map(d => ({ id: d.id, ...d.data() } as MinimalPost)));

            // Fetch Likes (Only if own profile or high tier - for now just own)
            if (isOwnProfile) {
                const likesQ = query(
                    collection(db, "users", firebaseUser!.uid, "likes"),
                    orderBy("timestamp", "desc"),
                    limit(18)
                );
                const likesSnap = await getDocs(likesQ);
                setLikedPosts(likesSnap.docs.map(d => ({ id: d.id, ...d.data() } as MinimalPost)));
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
            console.error("Profile fetch error", e);
        } finally {
            setFetching(false);
        }
    };

    if (firebaseUser) fetchData();
  }, [viewId, firebaseUser, userLoading, currentUser, isOwnProfile]);

  const handleFollow = async () => {
      if (!firebaseUser || !targetUser) return;
      playClick(600, 0.1, 'square');
      
      const wasFollowing = isFollowing;
      const followRef = doc(db, "users", firebaseUser.uid, "following", targetUser.uid);
      
      // Optimistic UI Update
      setIsFollowing(!wasFollowing);
      
      const newFollowersCount = !wasFollowing 
          ? parseInt(targetUser.stats?.followers || '0') + 1 
          : Math.max(0, parseInt(targetUser.stats?.followers || '0') - 1);

      // Persist stat simulation (Target's Followers)
      const statsKey = `sim_stats_${targetUser.uid}`;
      const existingSim = JSON.parse(localStorage.getItem(statsKey) || '{}');
      localStorage.setItem(statsKey, JSON.stringify({ ...existingSim, followers: newFollowersCount.toString() }));

      // Persist stat simulation (My Following)
      if (currentUser && firebaseUser) {
          const myStatsKey = `sim_stats_${firebaseUser.uid}`;
          const myCurrentFollowing = parseInt(currentUser.stats?.following || '0');
          // Note: This is a simple increment based on loaded state. 
          // Ideally we read from localStorage first to handle multiple follows in one session if not reloaded.
          // But for a prototype, this works.
          const myExistingSim = JSON.parse(localStorage.getItem(myStatsKey) || '{}');
          // If we already have a simulated value, use that as base? 
          // Actually, currentUser.stats might NOT include the simulation yet if we didn't reload.
          // So better to use the simulated value if present.
          const baseFollowing = myExistingSim.following ? parseInt(myExistingSim.following) : myCurrentFollowing;
          const myNewFollowing = !wasFollowing ? baseFollowing + 1 : Math.max(0, baseFollowing - 1);
          
          localStorage.setItem(myStatsKey, JSON.stringify({ ...myExistingSim, following: myNewFollowing.toString() }));
      }

      setTargetUser(prev => {
          if (!prev) return null;
          return {
              ...prev,
              stats: {
                  ...prev.stats,
                  followers: newFollowersCount.toString(),
                  following: prev.stats?.following || '0',
                  likes: prev.stats?.likes || '0',
                  credits: prev.stats?.credits || '0',
                  reputation: prev.stats?.reputation || '0'
              }
          };
      });

      try {
          if (wasFollowing) {
              await deleteDoc(followRef);
              toast(`Unfollowed @${targetUser.handle}`, "info");
          } else {
              await setDoc(followRef, { timestamp: new Date() });
              toast(`Following @${targetUser.handle}`, "success");
          }
      } catch (e) { 
          console.warn("Firestore write failed, using local simulation.", e);
          const key = `sim_following_${targetUser.uid}`;
          
          if (wasFollowing) {
              localStorage.removeItem(key);
              toast(`Unfollowed @${targetUser.handle} (Simulated)`, "info");
          } else {
              localStorage.setItem(key, "true");
              toast(`Following @${targetUser.handle} (Simulated)`, "success");
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
    if (navigator.vibrate) navigator.vibrate(20);
  };

  if (userLoading || fetching || !targetUser) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-primary-bg text-accent-1 font-mono animate-pulse">
              SYNCHRONIZING PROFILE DATA...
          </div>
      );
  }

  const targetTier = (targetUser?.tier || 'free').toLowerCase();
  const currentTier = (currentUser?.tier || 'free').toLowerCase();

  console.log(`[Profile Debug] View: ${viewId || 'Own'}, Own: ${isOwnProfile}`);
  console.log(`[Profile Debug] Current Tier: ${currentTier}, Target Tier: ${targetTier}`);

  const canViewDetail = 
      isOwnProfile ||
      currentTier === 'sovereign' || 
      currentTier === 'lifetime' || 
      currentTier === targetTier;

  return (
    <div className="min-h-screen bg-primary-bg text-primary-text pb-24">
      {/* Cover */}
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
                <button onClick={() => handleStatClick('Following')}><Stat label="Following" value={targetUser.stats?.following || '0'} /></button>
                <button onClick={() => handleStatClick('Followers')}><Stat label="Followers" value={targetUser.stats?.followers || '0'} /></button>
                <button onClick={() => handleStatClick('Likes')}><Stat label="Likes" value={targetUser.stats?.likes || '0'} /></button>
                <Stat label="Rep" value={targetUser.stats?.reputation || '0'} />
                
                {targetUser.tier === 'lifetime' && isOwnProfile && (
                    <button onClick={() => setShowCertificate(true)} className="flex flex-col items-center justify-center text-amber-500 animate-pulse">
                        <ShieldCheck className="w-6 h-6 mb-1" />
                        <span className="text-[10px] uppercase font-bold">Certificate</span>
                    </button>
                )}
              </div>
          </motion.div>

        {/* Tabs */}
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

function Stat({ label, value }: { label: string, value: string }) {
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