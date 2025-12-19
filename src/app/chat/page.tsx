"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Search, PlusCircle, Loader2, Users, Globe } from "lucide-react";
import { useUser } from "@/lib/UserContext";
import { useSonic } from "@/lib/SonicContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserSearchModal } from "@/components/chat/UserSearchModal";
import { ChatView } from "@/components/chat/ChatView";

interface Chat {
  id: string;
  participants: string[]; // UIDs of participants
  lastMessage: string;
  lastMessageTimestamp: firebase.firestore.Timestamp | Date;
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
    }
];

const factions = [
    { id: "faction-netrunner", name: "Netrunners", description: "Hackers and data brokers.", icon: "bg-cyan-500" },
    { id: "faction-corp", name: "Corp", description: "Corporate elite and security.", icon: "bg-blue-600" },
    { id: "faction-drifter", name: "Drifters", description: "Nomads of the wasteland.", icon: "bg-amber-600" },
    { id: "faction-ghost", name: "Ghosts", description: "Unknown entities.", icon: "bg-gray-600" },
];

function ChatListContent() {
  const { firebaseUser, loading: userLoading } = useUser();
  const { playClick } = useSonic();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');

  const [realChats, setRealChats] = useState<Chat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [view, setView] = useState<'direct' | 'factions'>('direct');

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

  if (userLoading || chatsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-bg text-accent-1">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
      return null; 
  }

  // Render Individual Chat View if ID is present
  if (chatId) {
      return <ChatView chatId={chatId} />;
  }

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

  return (
    <div className="flex flex-col h-screen bg-primary-bg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-color bg-primary-bg/80 backdrop-blur-md sticky top-0 z-50 safe-area-top">
        <div className="flex items-center justify-between mb-4">
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

        {/* Tabs */}
        <div className="flex p-1 bg-secondary-bg/50 rounded-xl border border-border-color">
            <button 
                onClick={() => setView('direct')} 
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 ${view === 'direct' ? 'bg-accent-1 text-primary-bg' : 'text-secondary-text hover:text-primary-text'}`}
            >
                <Users className="w-4 h-4" />
                Direct
            </button>
            <button 
                onClick={() => setView('factions')} 
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 ${view === 'factions' ? 'bg-accent-1 text-primary-bg' : 'text-secondary-text hover:text-primary-text'}`}
            >
                <Globe className="w-4 h-4" />
                Factions
            </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {view === 'direct' ? (
            chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-secondary-text text-center">
                <MessageCircle className="w-16 h-16 opacity-50 mb-4" />
                <p className="text-lg font-bold text-primary-text mb-2">No Active Transmissions</p>
                <p className="text-sm">Initiate a new encrypted channel.</p>
            </div>
            ) : (
            chats.map((chat) => (
                <Link key={chat.id} href={`/chat?id=${chat.id}`} onClick={handleChatClick}>
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
                    {chat.lastMessageTimestamp?.toDate ? chat.lastMessageTimestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Now"}
                    </span>
                </motion.div>
                </Link>
            ))
            )
        ) : (
            // Factions List
            <div className="space-y-4">
                {factions.map((faction) => (
                    <Link key={faction.id} href={`/chat?id=${faction.id}`} onClick={handleChatClick}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01 }}
                            className="flex items-center gap-4 p-6 bg-secondary-bg/30 border border-border-color rounded-2xl hover:border-accent-1/50 transition-all relative overflow-hidden group"
                        >
                            <div className={`absolute inset-0 opacity-10 ${faction.icon} group-hover:opacity-20 transition-opacity`} />
                            
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-2xl ${faction.icon}`}>
                                {faction.name[0]}
                            </div>
                            
                            <div>
                                <h3 className="font-bold text-lg text-primary-text group-hover:text-accent-1 transition-colors">{faction.name}</h3>
                                <p className="text-sm text-secondary-text">{faction.description}</p>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        )}
      </div>

      <UserSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

export default function ChatListPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-primary-bg text-accent-1"><Loader2 className="w-10 h-10 animate-spin" /></div>}>
      <ChatListContent />
    </Suspense>
  );
}
