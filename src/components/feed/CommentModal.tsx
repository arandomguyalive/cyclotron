"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Trash2, Loader2, Lock, MessageCircle } from "lucide-react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, Timestamp, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/lib/UserContext";
import { useSonic } from "@/lib/SonicContext";

interface Comment {
  id: string;
  text: string;
  userId: string;
  userHandle: string;
  userAvatar: string;
  timestamp: Timestamp | Date;
}

interface CommentModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  postOwnerId: string;
}

export function CommentModal({ postId, isOpen, onClose, postOwnerId }: CommentModalProps) {
  const { firebaseUser, user } = useUser();
  const { playClick } = useSonic();
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Tier check
  const canComment = user?.tier !== 'free';

  useEffect(() => {
    if (!isOpen || !postId) return;

    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments: Comment[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(fetchedComments);
      setLoading(false);
      
      // Auto-scroll to bottom on new comment
      if (fetchedComments.length > 0) {
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }, (error) => {
        console.error("Comments listen error:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [postId, isOpen]);

  const handleSubmit = async () => {
    if (!input.trim() || !firebaseUser || !canComment) return;
    
    console.log(`[COMMENT] Attempting submission. postId: ${postId}, text: ${input.substring(0, 10)}...`);
    playClick(500, 0.1, 'square');
    const text = input.trim();
    setInput(""); // Optimistic clear

    const batch = writeBatch(db);
    const commentRef = doc(collection(db, "posts", postId, "comments"));

    try {
      batch.set(commentRef, {
        text: text,
        userId: firebaseUser.uid,
        userHandle: user?.handle || "Unknown",
        userAvatar: user?.avatarSeed || "default",
        timestamp: serverTimestamp()
      });
      
      // Notify Post Owner (if not self)
      if (postOwnerId && postOwnerId !== firebaseUser.uid) {
          console.log(`[COMMENT] Delivering notification to owner: ${postOwnerId}`);
          const notifRef = doc(collection(db, "users", postOwnerId, "notifications"));
          batch.set(notifRef, {
              type: "COMMENT",
              actorId: firebaseUser.uid,
              actorHandle: user?.handle || "Unknown",
              postId: postId,
              caption: text.substring(0, 30),
              timestamp: serverTimestamp(),
              read: false
          });
      }

      await batch.commit();
      console.log("[COMMENT] Transaction finalized.");

    } catch (e) {
      console.error("[COMMENT] Batch failed:", e);
      alert("Transmission failed. Secure channel required.");
    }
  };

  const handleDelete = async (commentId: string) => {
      if (!confirm("Delete transmission?")) return;
      try {
          await deleteDoc(doc(db, "posts", postId, "comments", commentId));
      } catch (e) {
          console.error("Delete failed", e);
      }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[110] bg-secondary-bg border-t border-border-color rounded-t-3xl h-[70vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-color flex items-center justify-between bg-primary-bg">
                <span className="font-bold text-primary-text flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Transmissions ({comments.length})
                </span>
                <button onClick={onClose} className="p-2 hover:bg-secondary-bg rounded-full">
                    <X className="w-5 h-5 text-secondary-text" />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-accent-1" /></div>
                ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-secondary-text opacity-50">
                        <MessageCircle className="w-12 h-12 mb-2" />
                        <p>No signals captured.</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary-bg overflow-hidden shrink-0 border border-border-color">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userAvatar}`} className="w-full h-full" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold text-primary-text">{comment.userHandle}</span>
                                    <span className="text-[10px] text-secondary-text">
                                        {(() => {
                                            const ts = comment.timestamp;
                                            if (!ts) return "Just now";
                                            // Check if it has toDate (Timestamp) or is Date
                                            const date = ts instanceof Date ? ts : (ts.toDate ? ts.toDate() : new Date());
                                            return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                        })()}
                                    </span>
                                </div>
                                <p className="text-sm text-secondary-text/90 mt-0.5 break-words">{comment.text}</p>
                            </div>
                            {(comment.userId === firebaseUser?.uid || postOwnerId === firebaseUser?.uid) && (
                                <button onClick={() => handleDelete(comment.id)} className="text-secondary-text/50 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-primary-bg border-t border-border-color pb-safe-area-inset-bottom">
                <div className="relative">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={canComment ? "Broadcast message..." : "Upgrade to broadcast"}
                        disabled={!canComment}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        className="w-full bg-secondary-bg border border-border-color rounded-full pl-4 pr-12 py-3 text-primary-text focus:border-accent-1 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {canComment ? (
                        <button 
                            onClick={handleSubmit}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent-1 text-primary-bg rounded-full hover:scale-105 transition-transform"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    ) : (
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
                    )}
                </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
