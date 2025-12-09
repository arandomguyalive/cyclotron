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
}

const mockPosts: Post[] = [
    {
        id: "m1",
        caption: "Target acquired in Sector 4. Moving to intercept.",
        mediaUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=500",
        mediaType: "image",
        userHandle: "neon_ghost",
        createdAt: { toDate: () => new Date() }
    },
    {
        id: "m2",
        caption: "The data packet has been secured.",
        mediaUrl: "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=500",
        mediaType: "image",
        userHandle: "cipher_punk",
        createdAt: { toDate: () => new Date() }
    },
    {
        id: "m3",
        caption: "System override complete. We are in.",
        mediaUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=500",
        mediaType: "image",
        userHandle: "root_admin",
        createdAt: { toDate: () => new Date() }
    }
];

export function SignalGrid() {
    const { user } = useUser();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const isFree = user?.tier === 'free';

    useEffect(() => {
        // Real data fetch with mock fallback
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(3));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
                setPosts(fetched);
            } else {
                setPosts(mockPosts);
            }
            setLoading(false);
        }, (err) => {
            console.error(err);
            setPosts(mockPosts); // Fallback
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <div className="h-40 flex items-center justify-center text-xs text-secondary-text animate-pulse">Scanning frequencies...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-secondary-text uppercase tracking-wider flex items-center gap-2">
                    <Signal className={`w-4 h-4 ${isFree ? 'text-red-500' : 'text-accent-1'}`} />
                    Intercepted Signals
                </h3>
                {isFree && (
                    <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 animate-pulse">
                        ENCRYPTED
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3">
                {posts.map((post) => (
                    <div 
                        key={post.id}
                        className={`relative rounded-2xl overflow-hidden border ${isFree ? 'border-red-500/20 bg-red-900/5' : 'border-border-color bg-secondary-bg/30'}`}
                    >
                        <div className="flex p-3 gap-4 items-center">
                            {/* Media Preview */}
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-black">
                                <img 
                                    src={post.mediaUrl} 
                                    className={`w-full h-full object-cover ${isFree ? 'opacity-80 sepia-[.3]' : ''}`}
                                    alt="Signal"
                                />
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
                ))}
            </div>
        </div>
    );
}

