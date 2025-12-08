"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Lock, ChevronLeft, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import AES from "crypto-js/aes";
import encUtf8 from "crypto-js/enc-utf8";
import { useSonic } from "@/lib/SonicContext";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/lib/UserContext";

interface ChatMessage {
  id: string;
  text: string; // The decrypted text
  encrypted: string; // The stored encrypted text
  senderId: string;
  senderHandle: string;
  senderAvatar: string;
  timestamp: any;
}

const SECRET_KEY = "cyclotron-secret-key-v1"; // IMPORTANT: In a real app, this key would be managed server-side and exchanged securely.

export default function ChatPage() {
  const { id: chatId } = useParams<{ id: string }>();
  const { firebaseUser, user: currentUserProfile, loading: userLoading } = useUser();
  const { playClick } = useSonic();
  const router = useRouter();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatPartner, setChatPartner] = useState<{ uid: string, handle: string, avatarSeed: string } | null>(null);
  const [chatLoading, setChatLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userLoading && !firebaseUser) {
      router.push("/login"); // Redirect if not authenticated
      return;
    }

    if (!chatId || !firebaseUser) {
        setChatLoading(false);
        return;
    }

    // Handle Mock Chats (Prevent Firebase Calls)
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
        setChatLoading(false);
        return;
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
            // No chat found, maybe create a new one or redirect
            router.push("/chat"); // Go back to chat list
            return;
        }

        // Setup real-time message listener
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
            setChatLoading(false);
        }, (error) => {
            console.error("Error fetching messages:", error);
            setChatLoading(false);
        });

        return () => unsubscribe();
    };

    fetchChatDetails();
  }, [chatId, firebaseUser, userLoading, router]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !firebaseUser || !currentUserProfile || !chatId) return;

    playClick(500, 0.08, 'square'); // Send message sound

    const encrypted = AES.encrypt(input, SECRET_KEY).toString();

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        encrypted: encrypted,
        senderId: firebaseUser.uid,
        senderHandle: currentUserProfile.handle,
        senderAvatar: currentUserProfile.avatarSeed,
        timestamp: serverTimestamp(),
      });
      setInput("");

      // Update last message in chat document
      await setDoc(doc(db, "chats", chatId), {
        lastMessage: encrypted, // Store encrypted last message for consistency
        lastMessageTimestamp: serverTimestamp(),
      }, { merge: true });

    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send transmission. Connection unstable.");
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
      return null; // Should be handled by useEffect redirect
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-primary-bg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-color flex items-center gap-3 bg-primary-bg/80 backdrop-blur-md sticky top-0 z-50 safe-area-top">
        <button 
            onClick={() => router.push("/chat")} // Go back to chat list
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
        <div>
          <h2 className="font-bold text-primary-text">{chatPartner?.handle || "Agent Zero"}</h2>
          <div className="flex items-center gap-1 text-xs text-accent-1/80">
            <Lock className="w-3 h-3" />
            <span>E2EE Active</span>
          </div>
        </div>
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
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-primary-bg border-t border-border-color sticky bottom-0 z-50 pb-safe-area-inset-bottom">
        <div className="flex items-center gap-2 relative">
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

function MessageBubble({ message, isMine, senderHandle, senderAvatar }: { message: ChatMessage, isMine: boolean, senderHandle: string, senderAvatar: string }) {
  const [isRevealed, setIsRevealed] = useState(isMine); // Sent messages are always revealed
  const [scratchProgress, setScratchProgress] = useState(0);
  const { playClick } = useSonic();

  // Decrypt message once revealed
  const decryptedText = useRef<string | null>(null);
  if (isRevealed && decryptedText.current === null) {
      try {
          const bytes = AES.decrypt(message.encrypted, SECRET_KEY);
          decryptedText.current = bytes.toString(encUtf8);
      } catch (e) {
          console.error("Decryption failed:", e);
          decryptedText.current = "[DECRYPTION FAILED]";
      }
  }

  const handleScratch = (e: React.PointerEvent) => {
    if (isRevealed || isMine) return; // Cannot scratch own messages or already revealed ones
    
    // Increment progress on movement
    setScratchProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
            setIsRevealed(true);
            playClick(800, 0.1, 'sine'); // Unlock sound
            if (navigator.vibrate) navigator.vibrate(50);
            return 100;
        }
        if (newProgress % 10 === 0) {
             playClick(100 + newProgress * 2, 0.02, 'sawtooth'); // Scratching sound
        }
        return newProgress;
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
    >
        {!isMine && ( // Show avatar for other users
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
        {!isRevealed ? (
           <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2 text-xs font-mono opacity-70 text-accent-2">
                <Lock className="w-3 h-3" />
                <span>SCRUB TO DECRYPT</span>
             </div>
             <p className="font-mono text-sm break-all opacity-50 blur-[1px]">
                {message.encrypted.substring(0, Math.min(message.encrypted.length, 50))}
             </p>
             {/* Progress Bar */}
             <div className="h-1 w-full bg-border-color rounded-full mt-1 overflow-hidden">
                 <motion.div 
                    className="h-full bg-accent-2"
                    style={{ width: `${scratchProgress}%` }}
                 />
             </div>
           </div>
        ) : (
          <motion.p 
            initial={{ opacity: 0, filter: "blur(5px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            className="text-sm"
          >
            {decryptedText.current || message.text}
          </motion.p>
        )}
        <span className={`block text-[10px] text-secondary-text/50 mt-1 ${isMine ? "text-right" : "text-left"}`}>
            {new Date(message.timestamp?.toDate()).toLocaleTimeString()}
        </span>
      </div>
    </motion.div>
  );
}
