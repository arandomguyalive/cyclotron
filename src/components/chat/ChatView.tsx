"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Lock, ChevronLeft, Loader2, AlertTriangle, Paperclip, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import AES from "crypto-js/aes";
import encUtf8 from "crypto-js/enc-utf8";
import { useSonic } from "@/lib/SonicContext";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/lib/UserContext";
import { useToast } from "@/lib/ToastContext";

interface ChatMessage {
  id: string;
  text: string; 
  encrypted: string; 
  senderId: string;
  senderHandle: string;
  senderAvatar: string;
  timestamp: firebase.firestore.Timestamp | Date;
  isBurner?: boolean;
}

const SECRET_KEY = "cyclotron-secret-key-v1";

interface ChatViewProps {
    chatId: string;
}

export function ChatView({ chatId }: ChatViewProps) {
  const { firebaseUser, user: currentUserProfile, loading: userLoading } = useUser();
  const { playClick } = useSonic();
  const { toast } = useToast();
  const router = useRouter();

  const isFree = currentUserProfile?.tier === 'free';

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatPartner, setChatPartner] = useState<{ uid: string, handle: string, avatarSeed: string } | null>(null);
  const [chatLoading, setChatLoading] = useState(true);
  const [isBurnerMode, setIsBurnerMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userLoading && !firebaseUser) {
      router.push("/login");
      return;
    }

    if (!chatId || !firebaseUser) {
        if (chatLoading) setChatLoading(false); // Guard against unnecessary calls
        return;
    }

    if (chatId.startsWith("mock-")) {
        setChatPartner({
            uid: "mock-partner",
            handle: "Cyber_Ghost",
            avatarSeed: "Ghost"
        });
        setMessages([
            {
                id: "m1",
                text: "The grid is unstable today.",
                encrypted: "U2FsdGVkX1+...",
                senderId: "mock-partner",
                senderHandle: "Cyber_Ghost",
                senderAvatar: "Ghost",
                timestamp: { toDate: () => new Date(Date.now() - 3600000) }
            },
            {
                id: "m2",
                text: "Affirmative. I'm seeing packet loss in Sector 7.",
                encrypted: "U2FsdGVkX1+...",
                senderId: firebaseUser.uid,
                senderHandle: currentUserProfile?.handle || "You",
                senderAvatar: currentUserProfile?.avatarSeed || "User",
                timestamp: { toDate: () => new Date(Date.now() - 3500000) }
            }
        ]);
        if (chatLoading) setChatLoading(false);
        return;
    }

    // Handle Faction Channels
    if (chatId.startsWith("faction-")) {
        const factionName = chatId.replace("faction-", "").toUpperCase();
        setChatPartner({
            uid: chatId,
            handle: `${factionName} CHANNEL`,
            avatarSeed: factionName
        });
        
        const messagesQuery = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const newMessages: ChatMessage[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ChatMessage[];
            setMessages(newMessages);
            if (chatLoading) setChatLoading(false);
        }, (error) => {
            console.error("Error fetching messages:", error);
            if (chatLoading) setChatLoading(false);
        });

        return () => unsubscribe();
    }

    // Fetch chat participants and details
    const fetchChatDetails = async () => {
        const chatDocRef = doc(db, "chats", chatId);
        const chatDoc = await getDoc(chatDocRef);

        if (chatDoc.exists()) {
            const participants = chatDoc.data()?.participants;
            const otherParticipantId = participants.find((p: string) => p !== firebaseUser.uid);
            
            if (otherParticipantId) {
                const partnerDocRef = doc(db, "users", otherParticipantId);
                const partnerDoc = await getDoc(partnerDocRef);
                if (partnerDoc.exists()) {
                    const partnerData = partnerDoc.data();
                    setChatPartner({
                        uid: otherParticipantId,
                        handle: partnerData.handle || "Unknown",
                        avatarSeed: partnerData.avatarSeed || "default"
                    });
                } else {
                    setChatPartner({
                        uid: otherParticipantId,
                        handle: "Ghost User",
                        avatarSeed: "default"
                    });
                }
            }
        } else {
            router.push("/chat"); 
            return;
        }

        const messagesQuery = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const newMessages: ChatMessage[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ChatMessage[];
            setMessages(newMessages);
            if (chatLoading) setChatLoading(false);
        }, (error) => {
            console.error("Error fetching messages:", error);
            if (chatLoading) setChatLoading(false);
        });

        return () => unsubscribe();
    };

    fetchChatDetails();
  }, [chatId, firebaseUser, userLoading, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !firebaseUser || !currentUserProfile || !chatId) return;

    playClick(500, 0.08, 'square'); 

    const encrypted = AES.encrypt(input, SECRET_KEY).toString();

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        encrypted: encrypted,
        senderId: firebaseUser.uid,
        senderHandle: currentUserProfile.handle,
        senderAvatar: currentUserProfile.avatarSeed,
        timestamp: serverTimestamp(),
        isBurner: isBurnerMode,
      });
      setInput("");

      await setDoc(doc(db, "chats", chatId), {
        lastMessage: encrypted, 
        lastMessageTimestamp: serverTimestamp(),
      }, { merge: true });

    } catch (error) {
      console.error("Error sending message:", error);
      toast("Transmission failed. Connection unstable.", "error");
    }
  };

  if (userLoading || chatLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-bg text-accent-1">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
      return null; 
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-primary-bg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-color flex items-center gap-3 bg-primary-bg/80 backdrop-blur-md sticky top-0 z-50 safe-area-top">
        <button 
            onClick={() => router.push("/chat")} 
            className="p-2 -ml-2 text-secondary-text hover:text-primary-text transition-colors"
        >
            <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-1 to-accent-2 p-[2px]">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chatPartner?.avatarSeed || 'Agent'}`} 
            alt="Agent" 
            className="w-full h-full rounded-full bg-primary-bg"
          />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-primary-text">{chatPartner?.handle || "Agent Zero"}</h2>
          {isFree ? (
              <div className="flex items-center gap-1 text-xs text-brand-orange animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span>UNSECURED LINE</span>
              </div>
          ) : (
              <div className="flex items-center gap-1 text-xs text-accent-1/80">
                <Lock className="w-3 h-3" />
                <span>E2EE Active</span>
              </div>
          )}
        </div>

        {/* Burner Toggle (Premium+) - Disabled for Factions */}
        {!isFree && !chatId.startsWith("faction-") && (
            <button 
                onClick={() => {
                    setIsBurnerMode(!isBurnerMode);
                    toast(isBurnerMode ? "Burner Mode Deactivated" : "Burner Mode Active: Messages will self-destruct", "info");
                }}
                className={`p-2 rounded-full transition-all ${isBurnerMode ? 'bg-brand-orange/20 text-brand-orange animate-pulse' : 'text-secondary-text hover:text-primary-text'}`}
            >
                <Flame className="w-5 h-5" />
            </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            isMine={msg.senderId === firebaseUser.uid}
            senderHandle={msg.senderHandle}
            senderAvatar={msg.senderAvatar}
            isGroup={chatId.startsWith("faction-")}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-primary-bg border-t border-border-color sticky bottom-0 z-50 pb-safe-area-inset-bottom">
        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => {
                if (isFree) {
                    toast("File Channel Restricted. Upgrade to Shield.", "warning");
                } else {
                    toast("Secure file channel open. (Mock)", "success");
                }
            }}
            className={`p-2 rounded-full transition-colors ${isFree ? 'text-secondary-text/50 cursor-not-allowed' : 'text-accent-1 hover:bg-accent-1/10'}`}
          >
              <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type encrypted message..."
            className="flex-1 bg-secondary-bg backdrop-blur-sm border border-border-color rounded-full px-4 py-3 text-primary-text placeholder:text-secondary-text focus:outline-none focus:border-accent-1 transition-colors"
          />
          <button 
            onClick={handleSend}
            className="w-10 h-10 rounded-full bg-accent-1 flex items-center justify-center text-primary-bg hover:bg-accent-1/80 transition-colors shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isMine, senderHandle, senderAvatar, isGroup = false }: { message: ChatMessage, isMine: boolean, senderHandle: string, senderAvatar: string, isGroup?: boolean }) {
  const [isRevealed, setIsRevealed] = useState(isMine); // Sent messages are always revealed
  const [scratchProgress, setScratchProgress] = useState(0);
  const [burnProgress, setBurnProgress] = useState(0);
  const [isBurnt, setIsBurnt] = useState(false);
  const { playClick } = useSonic();
  const [displayDecryptedText, setDisplayDecryptedText] = useState<string | null>(null);

  // Decrypt message when revealed
  useEffect(() => {
    if (isRevealed && message.encrypted) {
      try {
          const bytes = AES.decrypt(message.encrypted, SECRET_KEY);
          const decryptedValue = bytes.toString(encUtf8);
          if (decryptedValue !== displayDecryptedText) {
            setDisplayDecryptedText(decryptedValue);
          }
      } catch (e) {
          console.error("Decryption failed:", e);
          if (displayDecryptedText !== "[DECRYPTION FAILED]") {
            setDisplayDecryptedText("[DECRYPTION FAILED]");
          }
      }
    } else if (!isRevealed && displayDecryptedText !== null) {
        setDisplayDecryptedText(null); // Clear on un-reveal
    }
  }, [isRevealed, message.encrypted, displayDecryptedText]);

  // Burn Timer Simulation (Visual only, starts after reveal)
  useEffect(() => {
      if (!isRevealed || isBurnt) return;
      
      // Faster burn for Burner Mode messages
      const burnDuration = message.isBurner ? 10000 : 30000; 
      const interval = 100;
      const step = (100 * interval) / burnDuration;

      const timer = setInterval(() => {
          setBurnProgress(prev => {
              if (prev >= 100) {
                  clearInterval(timer);
                  setIsBurnt(true);
                  return 100;
              }
              return prev + step;
          });
      }, interval);

      return () => clearInterval(timer);
  }, [isRevealed, isBurnt, message.isBurner]);

  const handleScratch = (e: React.PointerEvent) => {
    if (isRevealed || isMine) return;
    
    setScratchProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
            setIsRevealed(true);
            playClick(800, 0.1, 'sine');
            if (navigator.vibrate) navigator.vibrate(50);
            return 100;
        }
        if (newProgress % 10 === 0) {
             playClick(100 + newProgress * 2, 0.02, 'sawtooth');
        }
        return newProgress;
    });
  };

  if (isBurnt) {
      return (
        <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <div className="text-[10px] text-secondary-text/30 font-mono border border-secondary-text/10 px-2 py-1 rounded">
                [MESSAGE INCINERATED]
            </div>
        </div>
      );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
    >
        {!isMine && ( 
            <div className="w-8 h-8 rounded-full bg-secondary-bg mr-2 overflow-hidden flex-shrink-0">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${senderAvatar}`} alt={senderHandle} className="w-full h-full" />
            </div>
        )}
      <div 
        className={`max-w-[80%] rounded-2xl p-3 relative overflow-hidden ${isMine ? "rounded-tr-none" : "rounded-tl-none"} ${
        isMine 
          ? "bg-accent-1/20 text-accent-1 border border-accent-1/30" 
          : "bg-secondary-bg/10 text-primary-text border border-border-color cursor-crosshair touch-none select-none"
      }`}
        onPointerMove={!isMine ? handleScratch : undefined}
      >
        {isGroup && !isMine && (
            <div className="text-[10px] text-accent-1 font-bold mb-1 uppercase tracking-wider">{senderHandle}</div>
        )}
        {!isRevealed ? (
           <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2 text-xs font-mono opacity-70 text-accent-2">
                <Lock className="w-3 h-3" />
                <span>SCRUB TO DECRYPT</span>
             </div>
             <p className="font-mono text-sm break-all opacity-50 blur-[1px]">
                {message.encrypted.substring(0, Math.min(message.encrypted.length, 50))}
             </p>
             {/* Scrub Progress Bar */}
             <div className="h-1 w-full bg-border-color rounded-full mt-1 overflow-hidden">
                 <motion.div 
                    className="h-full bg-accent-2"
                    style={{ width: `${scratchProgress}%` }}
                 />
             </div>
           </div>
        ) : (
          <>
            <motion.div 
                initial={{ opacity: 0, filter: "blur(5px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                className="text-sm relative z-10 flex items-start gap-2"
            >
                {message.isBurner && <Flame className="w-3 h-3 text-brand-orange animate-pulse mt-1 shrink-0" />}
                <p>{displayDecryptedText || message.text}</p>
            </motion.div>
            
            {/* Burn Fuse Visual */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-brand-orange/50 blur-[1px] transition-all duration-100" style={{ width: `${burnProgress}%` }} />
          </>
        )}
        <span className={`block text-[10px] text-secondary-text/50 mt-1 ${isMine ? "text-right" : "text-left"}`}>
            {new Date(message.timestamp?.toDate()).toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  );
}
