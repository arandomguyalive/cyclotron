"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/UserContext";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Lock, Signal, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

interface Post {
    id: string;
    caption: string;
    mediaUrl: string;
    mediaType: "image" | "video";
    userHandle: string;
    createdAt: any;
    type: "post";
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

const mockPosts: Post[] = [
    {
        id: "m1",
        caption: "Target acquired in Sector 4. Moving to intercept.",
        mediaUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=500",
        mediaType: "image",
        userHandle: "neon_ghost",
        createdAt: { toDate: () => new Date() },
        type: "post"
    },
    {
        id: "m2",
        caption: "The data packet has been secured.",
        mediaUrl: "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=500",
        mediaType: "image",
        userHandle: "cipher_punk",
        createdAt: { toDate: () => new Date() },
        type: "post"
    },
    {
        id: "m3",
        caption: "System override complete. We are in.",
        mediaUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=500",
        mediaType: "image",
        userHandle: "root_admin",
        createdAt: { toDate: () => new Date() },
        type: "post"
    },
    {
        id: "m4",
        caption: "Found a backdoor into the mainframe. Almost in.",
        mediaUrl: "https://images.unsplash.com/photo-1596541223405-b04b6c31885f?q=80&w=500",
        mediaType: "image",
        userHandle: "matrix_diver",
        createdAt: { toDate: () => new Date(Date.now() - 1000 * 60 * 60) },
        type: "post"
    }
];

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
    const { user } = useUser();
    const [posts, setPosts] = useState<(Post | MockAd)[]>([]); // Allow MockAd type
    const [loading, setLoading] = useState(true);
    const [dataSaver, setDataSaver] = useState(false);

    const isFree = user?.tier === 'free';

    useEffect(() => {
        // Check data saver setting
        setDataSaver(localStorage.getItem('oblivion_dataSaver') === 'true');
        
        const handleStorageChange = () => {
            setDataSaver(localStorage.getItem('oblivion_dataSaver') === 'true');
        };
        window.addEventListener("storage", handleStorageChange);

        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(4)); // Fetch more posts to insert ad
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let fetchedPosts: (Post | MockAd)[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "post" })) as Post[];
            
            if (fetchedPosts.length === 0) {
                fetchedPosts = mockPosts;
            }

            // Inject mock ad for free users
            if (isFree && fetchedPosts.length > 1) {
                const adIndex = 1; // After the first real post
                fetchedPosts.splice(adIndex, 0, mockAd);
            }
            setPosts(fetchedPosts);
            setLoading(false);
        }, (err) => {
            console.error(err);
            setPosts(mockPosts); // Fallback
            setLoading(false);
        });
        return () => {
            unsubscribe();
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [isFree]); // Re-run effect if tier changes

    if (loading) return <div className="h-40 flex items-center justify-center text-xs text-secondary-text animate-pulse">Scanning frequencies...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-secondary-text uppercase tracking-wider flex items-center gap-2">
                    <Signal className={`w-4 h-4 ${isFree ? 'text-secondary-text' : 'text-accent-1'}`} />
                    Intercepted Signals
                </h3>
                {isFree && (
                    <span className="text-[10px] bg-secondary-bg/10 text-secondary-text px-2 py-0.5 rounded border border-border-color">
                        PUBLIC CHANNEL
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3">
                {posts.map((item) => {
                    if (item.type === "ad") {
                        const ad = item as MockAd;
                        return (
                            <motion.div 
                                key={ad.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`relative rounded-2xl overflow-hidden border border-${ad.color}/20 bg-${ad.color}/5 p-4 backdrop-blur-md`}
                            >
                                <div className="flex items-center gap-4">
                                    <img src={ad.imageUrl} alt={ad.title} className="w-16 h-16 object-cover rounded-lg" />
                                    <div>
                                        <h4 className={`text-sm font-bold text-${ad.color}`}>{ad.title}</h4>
                                        <p className="text-xs text-secondary-text">{ad.description}</p>
                                    </div>
                                </div>
                                <button className={`mt-3 w-full py-2 bg-${ad.color} text-primary-bg rounded-lg text-xs font-bold`}>
                                    {ad.cta}
                                </button>
                                <div className="absolute inset-0 bg-transparent z-10 cursor-pointer" onClick={() => alert("Redirect to Upgrade Page (Mock)")} />
                            </motion.div>
                        );
                    } else {
                        const post = item as Post;
                        return (
                            <div 
                                key={post.id}
                                className={`relative rounded-2xl overflow-hidden border transition-all ${
                                    isFree 
                                        ? 'border-white/5 bg-white/5 backdrop-blur-md' 
                                        : 'border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10'
                                }`}
                            >
                                <div className="flex p-3 gap-4 items-center">
                                    {/* Media Preview */}
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-black">
                                        <img 
                                            src={post.mediaUrl} 
                                            className={`w-full h-full object-cover ${isFree || dataSaver ? 'grayscale contrast-125 blur-[1px] opacity-70' : ''}`}
                                            alt="Signal"
                                        />
                                        
                                        {/* Free User Lock Badge */}
                                        {isFree && (
                                            <div className="absolute top-0 right-0 bg-red-600 text-white text-[6px] font-bold px-1 py-0.5 rounded-bl-md z-10">
                                                LOCKED
                                            </div>
                                        )}

                                        {/* Premium Watermark */}
                                        {!isFree && user?.handle && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <motion.span 
                                                    initial={{ opacity: 0.05, rotate: -30 }}
                                                    animate={{ opacity: 0.08, rotate: -30 }}
                                                    transition={{ repeat: Infinity, duration: 8, ease: "linear", repeatType: "reverse" }}
                                                    className="text-white text-[10px] font-extrabold tracking-widest uppercase opacity-5"
                                                    style={{ textShadow: '0 0 5px rgba(255,255,255,0.2)' }}
                                                >
                                                    {user.handle.toUpperCase()}
                                                </motion.span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-xs font-bold ${isFree ? 'text-secondary-text' : 'text-primary-text'}`}>
                                                @{post.userHandle}
                                            </span>
                                            <span className="text-[10px] text-secondary-text/50">
                                                {new Date(post.createdAt?.toDate ? post.createdAt.toDate() : new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                                            </span>
                                        </div>
                                        
                                        <p className="text-sm text-secondary-text line-clamp-2">
                                            {post.caption}
                                        </p>
                                    </div>
                                </div>

                                {/* Upgrade Overlay for Free Users - Subtle Interaction Lock */}
                                {isFree && (
                                    <div className="absolute inset-0 bg-transparent z-10 cursor-pointer" onClick={() => alert("Upgrade to interact (Like/Comment).")} />
                                )}
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
}

