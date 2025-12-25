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
import { UserAvatar } from "../ui/UserAvatar";
import { IdentityBadges } from "../ui/IdentityBadges";

interface Post {
    id: string;
    userId: string;
    caption: string;
    mediaUrl: string;
    mediaType: "image" | "video";
    userHandle: string;
    userAvatar: string;
    userAvatarUrl?: string;
    userTier?: string;
    userFaction?: string;
    userIsBlacklist?: boolean;
    userIsOwner?: boolean;
    createdAt: Timestamp | Date;
    type: "post" | "text";
    likes: number;
    shares?: number;
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
    const [posts, setPosts] = useState<(Post | MockAd)[]>([]); 
    const [loading, setLoading] = useState(true);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
    const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
    const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);

    const viewerTier = user?.tier || 'lobby';
    const isFree = viewerTier === 'lobby';

    useEffect(() => {
        if (!firebaseUser) return;

        const unsubscribeLikes = onSnapshot(collection(db, "users", firebaseUser.uid, "likes"), (snap) => {
            setLikedPosts(new Set(snap.docs.map(doc => doc.id)));
        });

        const unsubscribeSaved = onSnapshot(collection(db, "users", firebaseUser.uid, "bookmarks"), (snap) => {
            setSavedPosts(new Set(snap.docs.map(doc => doc.id)));
        });

        const unsubscribeFollowing = onSnapshot(collection(db, "users", firebaseUser.uid, "following"), (snap) => {
            setFollowingSet(new Set(snap.docs.map(doc => doc.id)));
        });

        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(10));
        const unsubscribePosts = onSnapshot(q, (snapshot) => {
            let fetchedPosts: (Post | MockAd)[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
            fetchedPosts = fetchedPosts.filter(p => (p as Post).type === 'post' || (p as Post).type === 'text' || (!(p as Post).type && (p as Post).mediaType === 'image'));

            if (isFree && fetchedPosts.length > 1) {
                fetchedPosts.splice(1, 0, mockAd);
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

    if (loading) return <div className="h-40 flex items-center justify-center text-xs text-secondary-text animate-pulse">Scanning frequencies...</div>;

    return (
        <div className="space-y-4 pb-20">
            <div className="flex items-center justify-between px-4">
                <h3 className="text-xl font-bold text-primary-text tracking-tight">Latest Signals</h3>
                {isFree && <span className="text-[10px] bg-secondary-bg/10 text-secondary-text px-2 py-0.5 rounded border border-border-color">PUBLIC CHANNEL</span>}
            </div>

            <div className="flex flex-col gap-8">
                {posts.map((item) => (
                    item.type === "ad" ? (
                        <AdItem key={item.id} ad={item as MockAd} />
                    ) : (
                        <SignalItem 
                            key={item.id} 
                            post={item as Post} 
                            viewerTier={viewerTier} 
                            isFree={isFree}
                            likedPosts={likedPosts}
                            savedPosts={savedPosts}
                            followingSet={followingSet}
                            onComment={() => setActiveCommentPost(item as Post)}
                        />
                    )
                ))}
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

function SignalItem({ post, viewerTier, isFree, likedPosts, savedPosts, followingSet, onComment }: any) {
    const { user, firebaseUser, updateUser } = useUser();
    const { toast } = useToast();
    const [commentsCount, setCommentsCount] = useState(0);
    const [sharesCount, setSharesCount] = useState(post.shares || 0);
    const [likesCount, setLikesCount] = useState(post.likes || 0);

    useEffect(() => {
        const unsubscribePost = onSnapshot(doc(db, "posts", post.id), (snap) => {
            if (snap.exists()) {
                const d = snap.data();
                setSharesCount(d.shares || 0);
                setLikesCount(d.likes || 0);
            }
        });

        const unsubscribeComments = onSnapshot(collection(db, "posts", post.id, "comments"), (snap) => {
            setCommentsCount(snap.size);
        });
        return () => {
            unsubscribePost();
            unsubscribeComments();
        };
    }, [post.id]);

    const handleLike = async () => {
        if (!firebaseUser || !user) return;
        const isLiked = likedPosts.has(post.id);
        const batch = writeBatch(db);
        const postRef = doc(db, "posts", post.id);
        const likeRef = doc(db, "users", firebaseUser.uid, "likes", post.id);
        const ownerRef = doc(db, "users", post.userId);

        try {
            if (!isLiked) {
                batch.update(postRef, { likes: increment(1) });
                batch.update(ownerRef, { "stats.likes": increment(1), "stats.reputation": increment(1) });
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
                batch.update(ownerRef, { "stats.likes": increment(-1), "stats.reputation": increment(-1) });
                batch.delete(likeRef);
            }
            await batch.commit();
        } catch (e: any) { 
            try {
                const batch = writeBatch(db);
                if (!isLiked) {
                    batch.update(postRef, { likes: (likesCount || 0) + 1 });
                    batch.set(ownerRef, { stats: { likes: increment(1), reputation: increment(1) } }, { merge: true });
                    batch.set(likeRef, { postId: post.id, timestamp: serverTimestamp() });
                } else {
                    batch.update(postRef, { likes: Math.max(0, (likesCount || 0) - 1) });
                    batch.set(ownerRef, { stats: { likes: increment(-1), reputation: increment(-1) } }, { merge: true });
                    batch.delete(likeRef);
                }
                await batch.commit();
            } catch (err) {}
        }
    };

    const handleSave = async () => {
        if (!firebaseUser) return;
        const isSaved = savedPosts.has(post.id);
        const saveRef = doc(db, "users", firebaseUser.uid, "bookmarks", post.id);
        try {
            if (!isSaved) {
                await setDoc(saveRef, { postId: post.id, mediaUrl: post.mediaUrl, mediaType: post.mediaType, timestamp: serverTimestamp() });
                toast("Signal Saved", "success");
            } else {
                await deleteDoc(saveRef);
                toast("Removed from Archive", "info");
            }
        } catch (e) { console.error(e); }
    };

    const handleFollow = async () => {
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
                await batch.commit();
                toast(`Linked with @${post.userHandle}`, "success");
            } else {
                batch.delete(myFollowingRef);
                batch.delete(targetFollowerRef);
                batch.update(meRef, { "stats.following": increment(-1) });
                batch.update(themRef, { "stats.followers": increment(-1) });
                await batch.commit();
                toast(`Disconnected from @${post.userHandle}`, "info");
            }
        } catch (e) { 
            try {
                const batch = writeBatch(db);
                if (!isFollowing) {
                    batch.set(myFollowingRef, { timestamp: serverTimestamp() });
                    batch.set(targetFollowerRef, { timestamp: serverTimestamp() });
                    batch.set(meRef, { stats: { following: increment(1) } }, { merge: true });
                    batch.set(themRef, { stats: { followers: increment(1) } }, { merge: true });
                } else {
                    batch.delete(myFollowingRef);
                    batch.delete(targetFollowerRef);
                    batch.set(meRef, { stats: { following: increment(-1) } }, { merge: true });
                    batch.set(themRef, { stats: { followers: increment(-1) } }, { merge: true });
                }
                await batch.commit();
            } catch (err) {}
        }
    };

    const handleExtractHiddenMessage = async () => {
        if (!post.hasHiddenMessage || post.mediaType !== 'image') {
            toast("No hidden message detected.", "info");
            return;
        }
        try {
            const response = await fetch(post.mediaUrl);
            const blob = await response.blob();
            const imageFile = new File([blob], "stego_image.png", { type: blob.type });
            const extractedMessage = await extractMessageFromImage(imageFile);
            toast(extractedMessage ? `Message: ${extractedMessage}` : "Decryption failed", extractedMessage ? "success" : "warning");
        } catch (error) {}
    };

    const isTierAllowed = user?.isOwner || !post.allowedTiers || post.allowedTiers.length === 0 || post.allowedTiers.includes(viewerTier);
    if (!isTierAllowed) {
        return (
            <div className="w-full border-b border-white/5 pb-6">
                <div className="relative w-full aspect-[4/5] bg-black border border-red-900/30 flex items-center justify-center">
                    <div className="p-6 bg-black/80 border border-red-500/50 rounded-xl text-center">
                        <h3 className="text-red-500 font-bold uppercase">Clearance Required</h3>
                        <p className="text-[10px] text-red-400/70 font-mono mt-1">Tier level protocol missing.</p>
                    </div>
                </div>
            </div>
        );
    }

    const showGlitched = isFree && !user?.isOwner;

    return (
        <div className="w-full border-b border-white/5 pb-6 font-sans">
            <div className="px-4 flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <UserAvatar seed={post.userHandle} url={post.userAvatarUrl} size="sm" isBlacklist={post.userIsBlacklist} isOwner={post.userIsOwner} showRing={false} />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${showGlitched ? 'text-secondary-text' : 'text-primary-text'}`}>@{post.userHandle}</span>
                            <IdentityBadges tier={post.userTier} faction={post.userFaction} isBlacklist={post.userIsBlacklist} isOwner={post.userIsOwner} size="sm" />
                            {firebaseUser && post.userId !== firebaseUser.uid && (
                                <button onClick={handleFollow} className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${followingSet.has(post.userId) ? 'border-accent-1 text-accent-1 bg-accent-1/10' : 'border-secondary-text text-secondary-text'}`}>{followingSet.has(post.userId) ? 'Linked' : 'Link+'}</button>
                            )}
                        </div>
                    </div>
                </div>
                <MoreHorizontal className="w-5 h-5 text-secondary-text" />
            </div>

            {post.type === 'text' ? (
                <div className="relative w-full aspect-[4/5] bg-black border-y border-green-900/30 p-8 flex flex-col justify-center overflow-hidden font-mono">
                    <div className="relative z-10 text-green-500 text-lg">
                        <span className="text-green-700 text-xs block mb-4 uppercase tracking-widest border-b border-green-900/50 pb-2">Incoming Transmission_</span>
                        {post.caption}
                        <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse"/>
                    </div>
                </div>
            ) : (
                <div className="relative w-full aspect-[4/5] bg-black overflow-hidden" onClick={() => showGlitched && toast("Upgrade for HD Access", "warning")}>
                    <img src={post.mediaUrl} className={`w-full h-full object-cover transition-all duration-500 ${showGlitched ? 'grayscale blur-[1px]' : ''}`} />
                    {showGlitched && <div className="absolute top-4 right-4 bg-brand-orange text-white text-[10px] font-bold px-2 py-1 rounded">LOCKED</div>}
                </div>
            )}

            <div className="px-4 mt-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <Heart onClick={handleLike} className={`w-6 h-6 transition-colors cursor-pointer ${likedPosts.has(post.id) ? 'text-brand-hot-pink fill-brand-hot-pink' : 'text-primary-text'}`} />
                        {likesCount > 0 && <span className="text-xs font-bold text-primary-text font-mono">{likesCount}</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MessageCircle onClick={onComment} className="w-6 h-6 text-primary-text cursor-pointer" />
                        {commentsCount > 0 && <span className="text-xs font-bold text-accent-1 font-mono">{commentsCount}</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Share2 onClick={async () => {
                            if (isFree) { toast("UPGRADE REQUIRED: Secure sharing restricted.", "error"); return; }
                            try {
                                await updateDoc(doc(db, "posts", post.id), { shares: increment(1) });
                                navigator.clipboard.writeText(`${window.location.origin}/profile?view=${post.userId}`);
                                toast("Link Copied", "info");
                            } catch (e) {}
                        }} className="w-6 h-6 text-primary-text cursor-pointer" />
                        {sharesCount > 0 && <span className="text-xs font-bold text-secondary-text font-mono">{sharesCount}</span>}
                    </div>
                </div>
                <Bookmark onClick={handleSave} className={`w-6 h-6 transition-colors cursor-pointer ${savedPosts.has(post.id) ? 'text-accent-1 fill-accent-1' : 'text-primary-text'}`} />
            </div>

            <div className="px-4 mt-2 space-y-1">
                {post.type !== 'text' && (
                    <p className="text-sm text-secondary-text line-clamp-2">
                        <span className="font-bold text-primary-text mr-2">@{post.userHandle}</span>{post.caption}
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

function AdItem({ ad }: { ad: MockAd }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`relative mx-4 rounded-2xl border border-${ad.color}/20 bg-${ad.color}/5 p-6 backdrop-blur-md text-center`}>
            <img src={ad.imageUrl} alt={ad.title} className="w-full h-48 object-cover rounded-xl mb-4" />
            <h4 className={`text-lg font-bold text-${ad.color} mb-2`}>{ad.title}</h4>
            <p className="text-sm text-secondary-text mb-6">{ad.description}</p>
            <button className={`w-full py-3 bg-${ad.color} text-primary-bg rounded-xl font-bold`}>{ad.cta}</button>
        </motion.div>
    );
}