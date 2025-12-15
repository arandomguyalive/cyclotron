"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/UserContext";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/lib/ToastContext";
import { extractMessageFromImage } from "@/lib/steg";

interface Post {
    id: string;
    caption: string;
    mediaUrl: string;
    mediaType: "image" | "video";
    userHandle: string;
    createdAt: any;
    type: "post";
    hasHiddenMessage?: boolean;
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
    const { toast } = useToast();
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
            let fetchedPosts: (Post | MockAd)[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
            
            // Filter for standard Posts (Images/Text) only
            fetchedPosts = fetchedPosts.filter(p => (p as Post).type === 'post' || (!(p as Post).type && (p as Post).mediaType === 'image'));

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
                        return (
                            <div key={post.id} className="w-full border-b border-white/5 pb-6">
                                {/* Header */}
                                <div className="px-4 flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-secondary-bg overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userHandle}`} className="w-full h-full" />
                                        </div>
                                        <span className={`text-sm font-bold ${isFree ? 'text-secondary-text' : 'text-primary-text'}`}>
                                            @{post.userHandle}
                                        </span>
                                    </div>
                                    <MoreHorizontal className="w-5 h-5 text-secondary-text" />
                                </div>

                                {/* Media */}
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
                                                e.stopPropagation(); // Prevent parent image click
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

                                    {!isFree && user?.handle && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                                            <span className="text-white text-4xl font-black -rotate-45 uppercase tracking-widest">{user.handle}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="px-4 mt-3 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Heart 
                                            onClick={() => toast("Signal Acknowledged", "success")}
                                            className="w-6 h-6 text-primary-text hover:text-accent-1 transition-colors cursor-pointer" 
                                        />
                                        <MessageCircle 
                                            onClick={() => toast("Encrypted Channel Open", "info")}
                                            className="w-6 h-6 text-primary-text hover:text-accent-1 transition-colors cursor-pointer" 
                                        />
                                        <Share2 
                                            onClick={() => toast("Link Copied to Clipboard", "info")}
                                            className="w-6 h-6 text-primary-text hover:text-accent-1 transition-colors cursor-pointer" 
                                        />
                                    </div>
                                    <Bookmark 
                                        onClick={() => toast("Signal Saved to Archive", "encrypted")}
                                        className="w-6 h-6 text-primary-text hover:text-accent-1 transition-colors cursor-pointer" 
                                    />
                                </div>

                                {/* Content */}
                                <div className="px-4 mt-2 space-y-1">
                                    <p className="text-sm font-bold text-primary-text">2,492 likes</p>
                                    <p className="text-sm text-secondary-text line-clamp-2">
                                        <span className="font-bold text-primary-text mr-2">@{post.userHandle}</span>
                                        {post.caption}
                                    </p>
                                    <p className="text-[10px] text-secondary-text/50 uppercase tracking-wide mt-1">
                                        {new Date(post.createdAt?.toDate ? post.createdAt.toDate() : new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})} • Encrypted
                                    </p>
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
}