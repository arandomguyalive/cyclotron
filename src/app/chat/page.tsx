"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Search, PlusCircle, Loader2 } from "lucide-react";
import { useUser } from "@/lib/UserContext";
import { useSonic } from "@/lib/SonicContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserSearchModal } from "@/components/chat/UserSearchModal";

interface Chat {
  id: string;
  participants: string[]; // UIDs of participants
  lastMessage: string;
  lastMessageTimestamp: any;
  // Other metadata like chat name, avatar, etc.
  mockName?: string;
  mockAvatar?: string;
}

const mockChats: Chat[] = [
    {
        id: "mock-c1",
        participants: [],
        lastMessage: "U2FsdGVkX1+...", // Encrypted-looking text
        lastMessageTimestamp: { toDate: () => new Date(Date.now() - 1000 * 60 * 5) },
        mockName: "Cyber_Ghost",
        mockAvatar: "Ghost"
    },
    {
        id: "mock-c2",
        participants: [],
        lastMessage: "Coordinates received.",
        lastMessageTimestamp: { toDate: () => new Date(Date.now() - 1000 * 60 * 60 * 2) },
        mockName: "Nexus_Admin",
        mockAvatar: "Admin"
    },
    {
        id: "mock-c3",
        participants: [],
        lastMessage: "The grid is unstable.",
        lastMessageTimestamp: { toDate: () => new Date(Date.now() - 1000 * 60 * 60 * 24) },
        mockName: "Neon_Rat",
        mockAvatar: "Rat"
    }
];

export default function ChatListPage() {
  const { firebaseUser, loading: userLoading } = useUser();
  const { playClick } = useSonic();
  const router = useRouter();
  const [realChats, setRealChats] = useState<Chat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (!userLoading && !firebaseUser) {
      router.push("/login");
      return;
    }

    if (firebaseUser) {
      const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", firebaseUser.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedChats: Chat[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Chat[];
        setRealChats(fetchedChats);
        setChatsLoading(false);
      }, (error) => {
        console.error("Error fetching chat list:", error);
        setChatsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [firebaseUser, userLoading, router]);

  const chats = realChats.length > 0 ? realChats : mockChats;

  const handleChatClick = () => {
    playClick(350, 0.05, 'square');
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const handleNewChat = () => {
    playClick(500, 0.08, 'sine');
    if (navigator.vibrate) navigator.vibrate(30);
    setIsSearchOpen(true);
  };

  if (userLoading || chatsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-bg text-accent-1">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
      return null; // Should redirect to login by useEffect
  }

  return (
    <div className="flex flex-col h-screen bg-primary-bg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-color flex items-center justify-between bg-primary-bg/80 backdrop-blur-md sticky top-0 z-50 safe-area-top">
        <h2 className="text-xl font-bold text-primary-text">Transmissions</h2>
        <div className="flex items-center gap-4">
          <button onClick={handleChatClick} className="text-secondary-text hover:text-primary-text transition-colors">
            <Search className="w-6 h-6" />
          </button>
          <button onClick={handleNewChat} className="text-accent-1 hover:text-accent-1/80 transition-colors">
            <PlusCircle className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-secondary-text text-center">
            <MessageCircle className="w-16 h-16 opacity-50 mb-4" />
            <p className="text-lg font-bold text-primary-text mb-2">No Active Transmissions</p>
            <p className="text-sm">Initiate a new encrypted channel.</p>
          </div>
        ) : (
          chats.map((chat) => (
            <Link key={chat.id} href={`/chat/${chat.id}`} onClick={handleChatClick}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-3 p-4 bg-secondary-bg/50 border border-border-color rounded-xl hover:border-accent-1/30 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent-1 to-accent-2 flex items-center justify-center p-[2px] overflow-hidden">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.mockAvatar || chat.id}`} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full bg-primary-bg"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-primary-text">
                    {chat.mockName || `Encrypted Channel ${chat.id.substring(0, 5)}...`}
                  </h3>
                  <p className="text-sm text-secondary-text line-clamp-1 font-mono opacity-80">
                    {chat.lastMessage || "No messages yet."}
                  </p>
                </div>
                <span className="text-xs text-secondary-text/70">
                  {chat.lastMessageTimestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ""}
                </span>
              </motion.div>
            </Link>
          ))
        )}
      </div>

      <UserSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}