"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/UserContext";
import { collection, query, orderBy, limit, onSnapshot, Timestamp, doc, updateDoc, increment, setDoc, serverTimestamp, writeBatch, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/lib/ToastContext";
import { extractMessageFromImage } from "@/lib/steg";
import { CommentModal } from "@/components/feed/CommentModal";

interface Post {
    id: string;
    userId: string;
    caption: string;
    mediaUrl: string;
    mediaType: "image" | "video";
    userHandle: string;
    createdAt: Timestamp | Date;
    type: "post" | "text";
    likes: number;
    hasHiddenMessage?: boolean;
    allowedTiers?: string[];
    blockedRegions?: string[];
}

interface MockAd {
    id: string;
    type: "ad";
    title: string;
    description: string;
    imageUrl: string;
    cta: string;
    color: string;
}

const mockAd: MockAd = {
    id: "ad-km18-upgrade",
    type: "ad",
    title: "KM18 Presents: The Firewall Upgrade",
    description: "Secure your data. Mask your presence. Unlock full bandwidth.",
    imageUrl: "https://images.unsplash.com/photo-1506729623722-b53502883017?q=80&w=500",
    cta: "UPGRADE NOW",
    color: "accent-1"
};

export function SignalGrid() {
    const { user, firebaseUser } = useUser();
    const { toast } = useToast();
    const [posts, setPosts] = useState<(Post | MockAd)[]>([]); 
    const [loading, setLoading] = useState(true);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
    const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
    const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);
    const [dataSaver, setDataSaver] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('oblivion_dataSaver') === 'true';
        }
        return false;
    });

    const viewerTier = user?.tier || 'free';
    const isFree = viewerTier === 'free';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const viewerRegion = (user as any)?.region || 'global';
    const isShield = viewerTier === 'premium';
    const isForensic = ['gold', 'platinum', 'sovereign', 'lifetime'].includes(viewerTier);

    useEffect(() => {
        if (!firebaseUser) return;

        // Listen to User's Likes
        const unsubscribeLikes = onSnapshot(collection(db, "users", firebaseUser.uid, "likes"), (snap) => {
            const ids = new Set(snap.docs.map(doc => doc.id));
            setLikedPosts(ids);
        });

        // Listen to User's Bookmarks
        const unsubscribeSaved = onSnapshot(collection(db, "users", firebaseUser.uid, "bookmarks"), (snap) => {
            const ids = new Set(snap.docs.map(doc => doc.id));
            setSavedPosts(ids);
        });

        // Listen to User's Following
        const unsubscribeFollowing = onSnapshot(collection(db, "users", firebaseUser.uid, "following"), (snap) => {
            const ids = new Set(snap.docs.map(doc => doc.id));
            setFollowingSet(ids);
        });

        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(10));
        const unsubscribePosts = onSnapshot(q, (snapshot) => {
            let fetchedPosts: (Post | MockAd)[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
            fetchedPosts = fetchedPosts.filter(p => (p as Post).type === 'post' || (p as Post).type === 'text' || (!(p as Post).type && (p as Post).mediaType === 'image'));

            if (isFree && fetchedPosts.length > 1) {
                const adIndex = 1;
                fetchedPosts.splice(adIndex, 0, mockAd);
            }
            setPosts(fetchedPosts);
            setLoading(false);
        }, (err) => {
            console.error(err);
            setLoading(false);
        });

        return () => {
            unsubscribeLikes();
            unsubscribeSaved();
            unsubscribeFollowing();
            unsubscribePosts();
        };
    }, [firebaseUser, isFree]);

    const handleLike = async (post: Post) => {
        if (!firebaseUser || !user) return;
        const isLiked = likedPosts.has(post.id);
        const batch = writeBatch(db);
        const postRef = doc(db, "posts", post.id);
        const likeRef = doc(db, "users", firebaseUser.uid, "likes", post.id);

        try {
            if (!isLiked) {
                batch.update(postRef, { likes: increment(1) });
                batch.set(likeRef, { postId: post.id, timestamp: serverTimestamp() });
                if (post.userId !== firebaseUser.uid) {
                    const notifRef = doc(collection(db, "users", post.userId, "notifications"));
                    batch.set(notifRef, {
                        type: "LIKE",
                        actorId: firebaseUser.uid,
                        actorHandle: user.handle,
                        postId: post.id,
                        timestamp: serverTimestamp(),
                        read: false
                    });
                }
                toast("Signal Liked", "success");
            } else {
                batch.update(postRef, { likes: increment(-1) });
                batch.delete(likeRef);
            }
            await batch.commit();
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async (post: Post) => {
        if (!firebaseUser) return;
        const isSaved = savedPosts.has(post.id);
        const saveRef = doc(db, "users", firebaseUser.uid, "bookmarks", post.id);

        try {
            if (!isSaved) {
                await setDoc(saveRef, { postId: post.id, timestamp: serverTimestamp() });
                toast("Signal Saved to Archive", "success");
            } else {
                await deleteDoc(saveRef);
                toast("Removed from Archive", "info");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleFollow = async (post: Post) => {
        if (!firebaseUser || !user || post.userId === firebaseUser.uid) return;
        const isFollowing = followingSet.has(post.userId);
        const batch = writeBatch(db);
        const myFollowingRef = doc(db, "users", firebaseUser.uid, "following", post.userId);
        const targetFollowerRef = doc(db, "users", post.userId, "followers", firebaseUser.uid);
        const meRef = doc(db, "users", firebaseUser.uid);
        const themRef = doc(db, "users", post.userId);

        try {
            if (!isFollowing) {
                batch.set(myFollowingRef, { timestamp: serverTimestamp() });
                batch.set(targetFollowerRef, { timestamp: serverTimestamp() });
                batch.update(meRef, { "stats.following": increment(1) });
                batch.update(themRef, { "stats.followers": increment(1) });
                
                const notifRef = doc(collection(db, "users", post.userId, "notifications"));
                batch.set(notifRef, {
                    type: "FOLLOW",
                    actorId: firebaseUser.uid,
                    actorHandle: user.handle,
                    timestamp: serverTimestamp(),
                    read: false
                });
                toast(`Linked with @${post.userHandle}`, "success");
            } else {
                batch.delete(myFollowingRef);
                batch.delete(targetFollowerRef);
                batch.update(meRef, { "stats.following": increment(-1) });
                batch.update(themRef, { "stats.followers": increment(-1) });
                toast(`Disconnected from @${post.userHandle}`, "info");
            }
            await batch.commit();
        } catch (e) {
            console.error(e);
        }
    };

    const handleExtractHiddenMessage = async (post: Post) => {
        if (!post.hasHiddenMessage || post.mediaType !== 'image') {
            toast("No hidden message detected.", "info");
            return;
        }

        try {
            toast("Analyzing image for hidden signals...", "info");
            const response = await fetch(post.mediaUrl);
            const blob = await response.blob();
            const imageFile = new File([blob], "stego_image.png", { type: blob.type });

            const extractedMessage = await extractMessageFromImage(imageFile);
            if (extractedMessage) {
                toast(`Hidden Message: ${extractedMessage}`, "success");
            } else {
                toast("No decipherable hidden message found.", "warning");
            }
        } catch (error) {
            console.error("Error extracting hidden message:", error);
            toast("Failed to extract hidden message.", "error");
        }
    };

    if (loading) return <div className="h-40 flex items-center justify-center text-xs text-secondary-text animate-pulse">Scanning frequencies...</div>;

    return (
        <div className="space-y-4 pb-20">
            <div className="flex items-center justify-between px-4">
                <h3 className="text-xl font-bold text-primary-text tracking-tight">Latest Signals</h3>
                {isFree && (
                    <span className="text-[10px] bg-secondary-bg/10 text-secondary-text px-2 py-0.5 rounded border border-border-color">
                        PUBLIC CHANNEL
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-8">
                {posts.map((item) => {
                    if (item.type === "ad") {
                        const ad = item as MockAd;
                        return (
                            <motion.div 
                                key={ad.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`relative mx-4 rounded-2xl overflow-hidden border border-${ad.color}/20 bg-${ad.color}/5 p-6 backdrop-blur-md text-center`}
                            >
                                <img src={ad.imageUrl} alt={ad.title} className="w-full h-48 object-cover rounded-xl mb-4" />
                                <h4 className={`text-lg font-bold text-${ad.color} mb-2`}>{ad.title}</h4>
                                <p className="text-sm text-secondary-text mb-6">{ad.description}</p>
                                <button className={`w-full py-3 bg-${ad.color} text-primary-bg rounded-xl font-bold`}>
                                    {ad.cta}
                                </button>
                            </motion.div>
                        );
                    } else {
                        const post = item as Post;
                        const isTierAllowed = !post.allowedTiers || post.allowedTiers.length === 0 || post.allowedTiers.includes(viewerTier);
                        const isRegionBlocked = post.blockedRegions && post.blockedRegions.includes(viewerRegion);

                        if (!isTierAllowed || isRegionBlocked) {
                            return (
                                <div key={post.id} className="w-full border-b border-white/5 pb-6">
                                    <div className="px-4 mb-3 flex items-center gap-3 opacity-50">
                                        <div className="w-8 h-8 rounded-full bg-secondary-bg" />
                                        <div className="h-4 w-24 bg-secondary-bg rounded" />
                                    </div>
                                    <div className="relative w-full aspect-[4/5] bg-black border border-red-900/30 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
                                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#2a0000_10px,#2a0000_20px)] opacity-20" />
                                        <div className="relative z-10 p-6 bg-black/80 border border-red-500/50 rounded-xl">
                                            <h3 className="text-red-500 font-bold tracking-widest uppercase mb-2">
                                                {isRegionBlocked ? "GEO-BLOCKED" : "CLEARANCE REQUIRED"}
                                            </h3>
                                            <p className="text-xs text-red-400/70 font-mono">
                                                {isRegionBlocked 
                                                    ? `CONTENT UNAVAILABLE IN ${viewerRegion.toUpperCase()}` 
                                                    : `TIER LEVEL [${post.allowedTiers?.join('/').toUpperCase()}] REQUIRED`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={post.id} className="w-full border-b border-white/5 pb-6">
                                <div className="px-4 flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-secondary-bg overflow-hidden relative">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userHandle}`} className="w-full h-full" />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold ${isFree ? 'text-secondary-text' : 'text-primary-text'}`}>
                                                    @{post.userHandle}
                                                </span>
                                                {firebaseUser && post.userId !== firebaseUser.uid && (
                                                    <button 
                                                        onClick={() => handleFollow(post)}
                                                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border transition-colors ${followingSet.has(post.userId) ? 'border-accent-1 text-accent-1 bg-accent-1/10' : 'border-secondary-text text-secondary-text hover:border-primary-text hover:text-primary-text'}`}
                                                    >
                                                        {followingSet.has(post.userId) ? 'Linked' : 'Link+'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <MoreHorizontal className="w-5 h-5 text-secondary-text" />
                                </div>

                                {post.type === 'text' ? (
                                    <div className="relative w-full aspect-[4/5] bg-black border-y border-green-900/30 p-8 flex flex-col justify-center overflow-hidden font-mono">
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none" />
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
                                        <div className="relative z-10 text-green-500 text-lg leading-relaxed whitespace-pre-wrap break-words">
                                            <span className="text-green-700 text-xs block mb-4 uppercase tracking-widest border-b border-green-900/50 pb-2">
                                                Incoming Transmission_
                                            </span>
                                            {post.caption}
                                            <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse"/>
                                        </div>
                                        <div className="absolute bottom-4 right-4 text-[10px] text-green-800 uppercase tracking-widest">
                                            END OF LINE
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        className="relative w-full aspect-[4/5] bg-black overflow-hidden cursor-pointer"
                                        onClick={() => {
                                            if (isFree) {
                                                toast("Upgrade for High-Definition Access", "warning");
                                            }
                                        }}
                                    >
                                        <img 
                                            src={post.mediaUrl} 
                                            className={`w-full h-full object-cover transition-all duration-500 ${isFree || dataSaver ? 'grayscale contrast-125 blur-[1px] opacity-70' : ''}`}
                                            alt="Signal"
                                        />
                                        {post.hasHiddenMessage && post.mediaType === 'image' && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    handleExtractHiddenMessage(post);
                                                }}
                                                className="absolute top-4 left-4 bg-brand-cyan/20 backdrop-blur-md text-brand-cyan px-3 py-1 rounded-full flex items-center gap-2 hover:bg-brand-cyan/30 transition-colors z-10"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase">Decrypt</span>
                                            </button>
                                        )}
                                        {isFree && (
                                            <div className="absolute top-4 right-4 bg-brand-orange text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-lg">
                                                LOCKED
                                            </div>
                                        )}
                                        {isForensic && user?.handle && (
                                            <div 
                                                className="absolute inset-0 flex flex-wrap content-around justify-around pointer-events-none opacity-10 font-mono text-white text-xs z-10"
                                                style={{
                                                    transform: 'rotate(-30deg) scale(1.5)',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {Array(20).fill(0).map((_, i) => (
                                                    <span key={i} className="mx-4 my-2 whitespace-nowrap">{user.handle.toUpperCase()}</span>
                                                ))}
                                            </div>
                                        )}
                                        {isShield && user?.handle && (
                                            <div className="absolute bottom-4 right-4 pointer-events-none z-10 bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-brand-cyan/20">
                                                <span className="text-brand-cyan/50 text-[10px] font-mono tracking-widest uppercase">
                                                    {user.handle.toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="px-4 mt-3 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Heart 
                                            onClick={() => handleLike(post)}
                                            className={`w-6 h-6 transition-colors cursor-pointer ${likedPosts.has(post.id) ? 'text-brand-hot-pink fill-brand-hot-pink' : 'text-primary-text hover:text-accent-1'}`} 
                                        />
                                        <MessageCircle 
                                            onClick={() => {
                                                if (isFree) {
                                                    toast("UPGRADE REQUIRED: Frequency modulation (comments) restricted.", "error");
                                                } else {
                                                    // Since SignalGrid doesn't have local modal state, we'll use a local state or direct navigation
                                                    // For consistency with Vortex, let's add a local state for the active post being commented on
                                                    setActiveCommentPost(post);
                                                }
                                            }}
                                            className="w-6 h-6 text-primary-text hover:text-accent-1 transition-colors cursor-pointer" 
                                        />
                                        <Share2 
                                            onClick={async () => {
                                                try {
                                                    await updateDoc(doc(db, "posts", post.id), { shares: increment(1) });
                                                    navigator.clipboard.writeText(`${window.location.origin}/profile?view=${post.userId}`);
                                                    toast("Link Copied to Clipboard", "info");
                                                } catch (e) {}
                                            }}
                                            className="w-6 h-6 text-primary-text hover:text-accent-1 transition-colors cursor-pointer" 
                                        />
                                    </div>
                                    <Bookmark 
                                        onClick={() => handleSave(post)}
                                        className={`w-6 h-6 transition-colors cursor-pointer ${savedPosts.has(post.id) ? 'text-accent-1 fill-accent-1' : 'text-primary-text hover:text-accent-1'}`} 
                                    />
                                </div>

                                <div className="px-4 mt-2 space-y-1">
                                    <p className="text-sm font-bold text-primary-text">{post.likes || 0} likes</p>
                                    {post.type !== 'text' && (
                                        <p className="text-sm text-secondary-text line-clamp-2">
                                            <span className="font-bold text-primary-text mr-2">@{post.userHandle}</span>
                                            {post.caption}
                                        </p>
                                    )}
                                    <p className="text-[10px] text-secondary-text/50 uppercase tracking-wide mt-1">
                                        {(() => {
                                            const ts = post.createdAt;
                                            const date = ts instanceof Date ? ts : ts?.toDate ? ts.toDate() : new Date();
                                            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
                                        })()} • Encrypted
                                    </p>
                                </div>
                            </div>
                        );
                    }
                })}
            </div>

            {activeCommentPost && (
                <CommentModal 
                    postId={activeCommentPost.id}
                    isOpen={!!activeCommentPost}
                    onClose={() => setActiveCommentPost(null)}
                    postOwnerId={activeCommentPost.userId}
                />
            )}
        </div>
    );
}