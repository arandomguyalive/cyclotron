"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Bell, ShieldAlert, Heart, MessageCircle, UserPlus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  type: "SCREENSHOT_POST" | "LIKE" | "COMMENT" | "FOLLOW" | "SYSTEM";
  actorId: string;
  actorHandle: string;
  postId?: string;
  caption?: string;
  timestamp: any;
  read: boolean;
}

export default function NotificationsPage() {
  const { firebaseUser, user, loading } = useUser();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push("/login");
      return;
    }

    if (firebaseUser) {
      const q = query(
        collection(db, "users", firebaseUser.uid, "notifications"),
        orderBy("timestamp", "desc"),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        setNotifications(items);
        setFetching(false);
      });

      return () => unsubscribe();
    }
  }, [firebaseUser, loading, router]);

  const markAsRead = async (notifId: string) => {
      if (!firebaseUser) return;
      await updateDoc(doc(db, "users", firebaseUser.uid, "notifications", notifId), {
          read: true
      });
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-bg text-accent-1">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg pb-24 relative overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 pt-safe-area-top sticky top-0 z-50 bg-primary-bg/80 backdrop-blur-md border-b border-border-color">
          <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-accent-1" />
              <h1 className="text-xl font-bold text-primary-text">ACTIVITY LOG</h1>
          </div>
      </div>

      <div className="p-4 space-y-4">
        {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-secondary-text opacity-50">
                <Bell className="w-12 h-12 mb-4" />
                <p>No new signals detected.</p>
            </div>
        ) : (
            <AnimatePresence>
                {notifications.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        onClick={() => markAsRead(item.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            item.read 
                                ? "bg-secondary-bg/20 border-border-color" 
                                : "bg-secondary-bg/50 border-accent-1/50 shadow-[0_0_15px_-5px_rgba(var(--color-accent-1-rgb),0.3)]"
                        }`}
                    >
                        <div className="flex items-start gap-4">
                            {/* Icon based on type */}
                            <div className={`p-2 rounded-full shrink-0 ${
                                item.type === 'SCREENSHOT_POST' ? 'bg-red-500/20 text-red-500' :
                                item.type === 'LIKE' ? 'bg-pink-500/20 text-pink-500' :
                                'bg-accent-1/20 text-accent-1'
                            }`}>
                                {item.type === 'SCREENSHOT_POST' && <ShieldAlert className="w-5 h-5" />}
                                {item.type === 'LIKE' && <Heart className="w-5 h-5" />}
                                {(item.type === 'COMMENT' || item.type === 'SYSTEM') && <MessageCircle className="w-5 h-5" />}
                                {item.type === 'FOLLOW' && <UserPlus className="w-5 h-5" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <p className={`text-sm font-bold ${item.type === 'SCREENSHOT_POST' ? 'text-red-400' : 'text-primary-text'}`}>
                                        {item.type === 'SCREENSHOT_POST' ? "SECURITY ALERT" : item.actorHandle}
                                    </p>
                                    <span className="text-[10px] text-secondary-text whitespace-nowrap ml-2">
                                        {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                                    </span>
                                </div>
                                
                                <p className="text-xs text-secondary-text mt-1 break-words">
                                    {item.type === 'SCREENSHOT_POST' && (
                                        <span>captured your post: <span className="text-primary-text font-mono">"{item.caption}"</span></span>
                                    )}
                                    {item.type === 'LIKE' && "liked your transmission."}
                                    {item.type === 'FOLLOW' && "is now tracking your signal."}
                                    {item.type === 'SYSTEM' && item.caption}
                                </p>
                            </div>
                            
                            {!item.read && (
                                <div className="w-2 h-2 rounded-full bg-accent-1 mt-2 shrink-0 animate-pulse" />
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        )}
      </div>
    </div>
  );
}
