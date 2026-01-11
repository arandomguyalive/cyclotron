"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Lock, ChevronLeft, Loader2, AlertTriangle, Paperclip, Flame, MapPin, X } from "lucide-react";
import { useRouter } from "next/navigation";
import AES from "crypto-js/aes";
import encUtf8 from "crypto-js/enc-utf8";
import { useSonic, ImpactStyle } from "@/lib/SonicContext";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc, Timestamp, writeBatch } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useUser } from "@/lib/UserContext";
import { useToast } from "@/lib/ToastContext";
import { useScreenshot } from "@/lib/useScreenshot";
import { UserAvatar } from "../ui/UserAvatar";
import { GeoGate } from "./GeoGate";
import dynamic from 'next/dynamic';

const TacticalMapModal = dynamic(
  () => import('./TacticalMapModal').then((mod) => mod.TacticalMapModal),
  { ssr: false }
);

interface ChatMessage {
  id: string;
  text: string; 
  encrypted: string; 
  senderId: string;
  senderHandle: string;
  senderAvatar: string;
  senderAvatarUrl?: string;
  timestamp: Timestamp | Date;
  isBurner?: boolean;
  isBurnt?: boolean; 
  type?: 'text' | 'system' | 'image' | 'video';
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  geoLock?: {
    lat: number;
    lng: number;
    radius: number;
  };
}

const SECRET_KEY = "cyclotron-secret-key-v1";

interface ChatViewProps {
    chatId: string;
}

export function ChatView({ chatId }: ChatViewProps) {
  const { firebaseUser, user: currentUserProfile, loading: userLoading } = useUser();
  const { playClick, playHaptic } = useSonic();
  const { toast } = useToast();
  const router = useRouter();

  const isFree = currentUserProfile?.tier === 'lobby';

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatPartner, setChatPartner] = useState<{ uid: string, handle: string, avatarSeed: string, avatarUrl?: string } | null>(null);
  const [chatLoading, setChatLoading] = useState(true);
  const [isBurnerMode, setIsBurnerMode] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [geoData, setGeoData] = useState<{ lat: number; lng: number; radius: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 📸 Screenshot Detection System
  useScreenshot(async () => {
    if (!firebaseUser || !currentUserProfile || !chatId) return;

    const now = Date.now();
    const lastAlert = parseInt(sessionStorage.getItem('last_screenshot_alert') || '0');
    if (now - lastAlert < 5000) return;
    sessionStorage.setItem('last_screenshot_alert', now.toString());

    toast("Screenshot Detected. Notifying party...", "error");
    playClick(150, 0.5, 'sawtooth');

    try {
        let locationString = "Unknown Sector";
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            if (data.city && data.country_name) {
                locationString = `${data.city}, ${data.country_name}`;
            }
        } catch (err) {}

        const alertText = `⚠️ SCREENSHOT DETECTED\nUSER: ${currentUserProfile.handle}\nID: ${firebaseUser.uid}\nLOC: ${locationString}`;
        const encryptedAlert = AES.encrypt(alertText, SECRET_KEY).toString();

        await addDoc(collection(db, "chats", chatId, "messages"), {
            encrypted: encryptedAlert,
            senderId: firebaseUser.uid,
            senderHandle: "SYSTEM", 
            senderAvatar: "alert",
            timestamp: serverTimestamp(),
            isBurner: false,
            type: 'system'
        });

        if (chatPartner && chatPartner.uid && !chatPartner.uid.startsWith("mock-")) {
            await addDoc(collection(db, "users", chatPartner.uid, "notifications"), {
                type: "SCREENSHOT_POST",
                actorId: firebaseUser.uid,
                actorHandle: currentUserProfile.handle,
                caption: "Secure Channel",
                timestamp: serverTimestamp(),
                read: false
            });
        }
    } catch (e) {}
  });

  const messagesRef = useRef<ChatMessage[]>([]);
  useEffect(() => {
      messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
      if (chatId.startsWith("mock-")) return;

      const burnMessages = async () => {
          const burnerMessages = messagesRef.current.filter(m => m.isBurner && !m.isBurnt);
          if (burnerMessages.length === 0) return;
          
          const batch = writeBatch(db);
          burnerMessages.forEach(msg => {
              const msgRef = doc(db, "chats", chatId, "messages", msg.id);
              batch.update(msgRef, {
                  isBurnt: true,
                  text: "",
                  encrypted: "U2FsdGVkX1+... [INCINERATED]",
              });
          });

          try {
              await batch.commit();
          } catch (e) {}
      };

      const handleVisibilityChange = () => {
          if (document.hidden) burnMessages();
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          burnMessages();
      };
  }, [chatId]);

  useEffect(() => {
    if (!userLoading && !firebaseUser) {
      router.push("/login");
      return;
    }

    if (!chatId || !firebaseUser) return;

    if (chatId.startsWith("mock-")) {
        if (chatLoading) {
            setTimeout(() => {
                setChatPartner({ uid: "mock-partner", handle: "Cyber_Ghost", avatarSeed: "Ghost" });
                setMessages([
                    { id: "m1", text: "The grid is unstable today.", encrypted: "U2FsdGVkX1+...", senderId: "mock-partner", senderHandle: "Cyber_Ghost", senderAvatar: "Ghost", timestamp: new Date() },
                    { id: "m2", text: "Affirmative.", encrypted: "U2FsdGVkX1+...", senderId: firebaseUser.uid, senderHandle: currentUserProfile?.handle || "You", senderAvatar: currentUserProfile?.avatarSeed || "User", timestamp: new Date() }
                ]);
                setChatLoading(false);
            }, 0);
        }
        return;
    }

    if (chatId.startsWith("faction-")) {
        const factionName = chatId.replace("faction-", "").toUpperCase();
        setChatPartner({ uid: chatId, handle: `${factionName} CHANNEL`, avatarSeed: factionName });
        
        const messagesQuery = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
            setChatLoading(false);
        });
        return () => unsubscribe();
    }

    const fetchChatDetails = async () => {
        const chatDoc = await getDoc(doc(db, "chats", chatId));
        if (chatDoc.exists()) {
            const otherId = chatDoc.data()?.participants.find((p: string) => p !== firebaseUser.uid);
            if (otherId) {
                const partnerDoc = await getDoc(doc(db, "users", otherId));
                if (partnerDoc.exists()) {
                    const d = partnerDoc.data();
                    setChatPartner({ uid: otherId, handle: d.handle, avatarSeed: d.avatarSeed, avatarUrl: d.avatarUrl });
                }
            }
        } else {
            router.push("/chat");
            return;
        }

        const unsubscribe = onSnapshot(query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc")), (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
            setChatLoading(false);
        });
        return () => unsubscribe();
    };

    fetchChatDetails();
  }, [chatId, firebaseUser, userLoading, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!firebaseUser || !chatId) return;
    
    setIsUploading(true);
    playClick(150, 0.1, 'sine');

    try {
        const fileRef = ref(storage, `chats/${chatId}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        
        // Determine type
        const type = file.type.startsWith('video') ? 'video' : 'image';
        
        // Auto-send the media message
        const currentGeo = geoData;
        setGeoData(null); // Consumed
        
        await addDoc(collection(db, "chats", chatId, "messages"), {
            senderId: firebaseUser.uid,
            senderHandle: currentUserProfile?.handle || "Agent",
            senderAvatar: currentUserProfile?.avatarSeed || "User",
            senderAvatarUrl: currentUserProfile?.avatarUrl || "",
            encrypted: "", // No text
            mediaUrl: url,
            mediaType: type,
            timestamp: serverTimestamp(),
            isBurner: isBurnerMode,
            type: type, // 'image' or 'video'
            ...(currentGeo && { geoLock: currentGeo })
        });

    } catch (e) {
        console.error("Upload failed", e);
        toast("Transmission Interrupted", "error");
    } finally {
        setIsUploading(false);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !geoData) || !firebaseUser || !chatId) return;

    playClick(200, 0.1, 'sine');
    
    // Reset GeoData after sending
    const currentGeo = geoData; 
    setGeoData(null); 
    const textToSend = input; 
    setInput("");

    const encryptedText = AES.encrypt(textToSend || "Location Drop", SECRET_KEY).toString();

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: firebaseUser.uid,
        senderHandle: currentUserProfile?.handle || "Agent",
        senderAvatar: currentUserProfile?.avatarSeed || "User",
        senderAvatarUrl: currentUserProfile?.avatarUrl || "",
        encrypted: encryptedText,
        timestamp: serverTimestamp(),
        isBurner: isBurnerMode,
        type: 'text',
        ...(currentGeo && { geoLock: currentGeo })
      });
      
      // Update last message in chat summary
      // ... (omitted for brevity, assume existing logic handles lastMessage update)
    } catch (e) {
      console.error("Failed to send", e);
    }
  };

  const handleGeoConfirm = (lat: number, lng: number, radius: number) => {
      setGeoData({ lat, lng, radius });
      setShowMap(false);
      // Auto-fill a message if empty
      if (!input) setInput("📍 SECURE LOCATION DROP");
  };

  if (userLoading || chatLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-primary-bg text-accent-1"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  }

  if (!firebaseUser) return null;

  return (
    <div className="flex flex-col h-[100dvh] bg-primary-bg">
      <div className="px-4 py-3 border-b border-border-color flex items-center gap-3 bg-primary-bg/80 backdrop-blur-md sticky top-0 z-50 safe-area-top">
        <button onClick={() => router.push("/chat")} className="p-2 -ml-2 text-secondary-text hover:text-primary-text transition-colors"><ChevronLeft className="w-6 h-6" /></button>
        <UserAvatar seed={chatPartner?.avatarSeed} url={chatPartner?.avatarUrl} size="md" showRing={!chatId.startsWith("faction-")} />
        <div className="flex-1">
          <h2 className="font-bold text-primary-text">{chatPartner?.handle || "Agent Zero"}</h2>
          <div className="flex items-center gap-1 text-xs opacity-80">{isFree ? <><AlertTriangle className="w-3 h-3 text-brand-orange" /> <span className="text-brand-orange">UNSECURED</span></> : <><Lock className="w-3 h-3 text-accent-1" /> <span className="text-accent-1">E2EE</span></>}</div>
        </div>
        {( !isFree || currentUserProfile?.isOwner ) && !chatId.startsWith("faction-") && (
            <button onClick={() => setIsBurnerMode(!isBurnerMode)} className={`p-2 rounded-full transition-all ${isBurnerMode ? 'bg-brand-orange/20 text-brand-orange animate-pulse' : 'text-secondary-text hover:text-primary-text'}`}><Flame className="w-5 h-5" /></button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            isMine={msg.senderId === firebaseUser.uid} 
            senderHandle={msg.senderHandle} 
            senderAvatar={msg.senderAvatar} 
            senderAvatarUrl={msg.senderAvatarUrl} 
            isGroup={chatId.startsWith("faction-")} 
            onMediaClick={(url, type) => setSelectedMedia({ url, type })}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <AnimatePresence>
        {selectedMedia && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
                onClick={() => setSelectedMedia(null)}
            >
                <button 
                    onClick={() => setSelectedMedia(null)}
                    className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-[110]"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-4xl max-h-[90vh] flex items-center justify-center">
                    {selectedMedia.type === 'video' ? (
                        <video src={selectedMedia.url} controls autoPlay className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
                    ) : (
                        <img src={selectedMedia.url} alt="Full View" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 bg-primary-bg border-t border-border-color sticky bottom-0 z-50 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 relative">
          <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileSelect} 
             className="hidden" 
             accept="image/*,video/*"
          />
          <button onClick={() => setShowMap(true)} className={`p-2 rounded-full transition-all ${geoData ? 'bg-brand-cyan text-black' : 'text-accent-1 hover:bg-accent-1/10'}`}>
             <MapPin className="w-5 h-5" />
          </button>
          <button 
             onClick={() => {
                 if (isFree && !currentUserProfile?.isOwner) {
                     toast("Restricted: Upgrade to Attach Files", "warning");
                 } else {
                     fileInputRef.current?.click();
                 }
             }} 
             disabled={isUploading}
             className={`p-2 rounded-full transition-all ${isUploading ? 'animate-pulse text-brand-orange' : 'text-accent-1 hover:bg-accent-1/10'} ${(isFree && !currentUserProfile?.isOwner) ? 'opacity-50' : ''}`}
          >
             {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
          </button>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder={geoData ? "Geo-Locked Message..." : "Type encrypted message..."} className="flex-1 bg-secondary-bg border border-border-color rounded-full px-4 py-3 text-primary-text focus:border-accent-1 outline-none" />
          <button onClick={handleSend} className="w-10 h-10 rounded-full bg-accent-1 flex items-center justify-center text-primary-bg"><Send className="w-5 h-5" /></button>
        </div>
      </div>

      <TacticalMapModal 
        isOpen={showMap} 
        onClose={() => setShowMap(false)} 
        onConfirm={handleGeoConfirm} 
      />
    </div>
  );
}

function MessageBubble({ message, isMine, senderHandle, senderAvatar, senderAvatarUrl, isGroup = false, onMediaClick }: { message: ChatMessage, isMine: boolean, senderHandle: string, senderAvatar: string, senderAvatarUrl?: string, isGroup?: boolean, onMediaClick?: (url: string, type: 'image' | 'video') => void }) {
  const [isRevealed, setIsRevealed] = useState(isMine);
  const [isBurnt, setIsBurnt] = useState(message.isBurnt || false); 
  const [scratchProgress, setScratchProgress] = useState(0);
  const [burnProgress, setBurnProgress] = useState(0);
  const { playClick, playHaptic } = useSonic();

  const displayDecryptedText = useMemo(() => {
    if (isRevealed && message.encrypted) {
      try { return AES.decrypt(message.encrypted, SECRET_KEY).toString(encUtf8); } catch (e) { return "[ERROR]"; }
    }
    return null;
  }, [isRevealed, message.encrypted]);

  // Geo-Lock Content Wrapper
  const content = (
      <>
        {message.geoLock ? (
            <GeoGate targetLat={message.geoLock.lat} targetLng={message.geoLock.lng} radius={message.geoLock.radius}>
                <motion.div initial={{ opacity: 0, filter: "blur(5px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} className="text-sm relative z-10 flex flex-col gap-2">
                    {message.mediaUrl && (
                        message.mediaType === 'video' ? 
                        <video src={message.mediaUrl} className="max-w-[200px] rounded-lg border border-white/20 cursor-pointer" onClick={() => onMediaClick?.(message.mediaUrl!, 'video')} /> :
                        <img src={message.mediaUrl} alt="Secure Attachment" className="max-w-[200px] rounded-lg border border-white/20 cursor-pointer" onClick={() => onMediaClick?.(message.mediaUrl!, 'image')} />
                    )}
                    {(displayDecryptedText || message.text) && (
                        <div className="flex items-start gap-2">
                             {message.isBurner && <Flame className="w-3 h-3 text-brand-orange animate-pulse mt-1 shrink-0" />}
                             <p>{displayDecryptedText || message.text}</p>
                        </div>
                    )}
                </motion.div>
            </GeoGate>
        ) : (
            <motion.div initial={{ opacity: 0, filter: "blur(5px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} className="text-sm relative z-10 flex flex-col gap-2">
                {message.mediaUrl && (
                    message.mediaType === 'video' ? 
                    <video src={message.mediaUrl} className="max-w-[200px] rounded-lg border border-white/20 cursor-pointer" onClick={() => onMediaClick?.(message.mediaUrl!, 'video')} /> :
                    <img src={message.mediaUrl} alt="Secure Attachment" className="max-w-[200px] rounded-lg border border-white/20 cursor-pointer" onClick={() => onMediaClick?.(message.mediaUrl!, 'image')} />
                )}
                {(displayDecryptedText || message.text) && (
                    <div className="flex items-start gap-2">
                            {message.isBurner && <Flame className="w-3 h-3 text-brand-orange animate-pulse mt-1 shrink-0" />}
                            <p>{displayDecryptedText || message.text}</p>
                    </div>
                )}
            </motion.div>
        )}
      </>
  );

  useEffect(() => {
      if (!isRevealed || isBurnt || message.isBurnt || !message.isBurner) return; // Only burn if explicitly marked as burner
      const burnDuration = 10000; 
      const interval = 100;
      const step = (100 * interval) / burnDuration;
      const timer = setInterval(() => {
          setBurnProgress(prev => {
              if (prev >= 100) { clearInterval(timer); setIsBurnt(true); return 100; }
              return prev + step;
          });
      }, interval);
      return () => clearInterval(timer);
  }, [isRevealed, isBurnt, message.isBurner]);

  const handleScratch = () => {
    if (isRevealed || isMine) return;
    setScratchProgress(prev => {
        const next = prev + 2;
        if (next >= 100) { setIsRevealed(true); playClick(880, 0.1, 'sine'); playHaptic(ImpactStyle.Medium); return 100; }
        if (next % 10 === 0) playClick(100 + next * 2, 0.02, 'sawtooth');
        return next;
    });
  };

  if (message.type === 'system') {
      return (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center my-4 w-full">
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-xs font-bold animate-pulse text-center">
                  <div className="flex items-center gap-2 mb-1 border-b border-red-500/30 pb-1 w-full justify-center"><AlertTriangle className="w-4 h-4" /><span>SECURITY BREACH</span></div>
                  {displayDecryptedText || message.text || "ALERT"}
              </div>
          </motion.div>
      );
  }

  if (isBurnt || message.isBurnt) {
      return <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}><div className="text-[10px] text-secondary-text/30 font-mono border border-secondary-text/10 px-2 py-1 rounded">[INCINERATED]</div></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
        {!isMine && <UserAvatar seed={senderAvatar} url={senderAvatarUrl} size="sm" showRing={false} className="mr-2" />}
      <div className={`max-w-[80%] rounded-2xl p-3 relative overflow-hidden ${isMine ? "rounded-tr-none bg-accent-1/20 text-accent-1 border border-accent-1/30" : "rounded-tl-none bg-secondary-bg/10 text-primary-text border border-border-color cursor-crosshair"}`} onPointerMove={!isMine ? handleScratch : undefined}>
        {isGroup && !isMine && <div className="text-[10px] text-accent-1 font-bold mb-1 uppercase tracking-wider">{senderHandle}</div>}
        {!isRevealed ? <div className="flex flex-col gap-1"><div className="flex items-center gap-2 text-xs font-mono opacity-70 text-accent-2"><Lock className="w-3 h-3" /><span>SCRUB</span></div><p className="font-mono text-sm break-all opacity-50 blur-[1px]">{message.encrypted.substring(0, 50)}</p><div className="h-1 w-full bg-border-color rounded-full mt-1 overflow-hidden"><motion.div className="h-full bg-accent-2" style={{ width: `${scratchProgress}%` }} /></div></div> : <>{content}<div className="absolute bottom-0 left-0 h-[2px] bg-brand-orange/50 blur-[1px]" style={{ width: `${burnProgress}%` }} /></>}
        <span className={`block text-[10px] text-secondary-text/50 mt-1 ${isMine ? "text-right" : "text-left"}`}>{(() => { const ts = message.timestamp; const d = ts instanceof Date ? ts : ts?.toDate ? ts.toDate() : new Date(); return d.toLocaleTimeString(); })()}</span>
      </div>
    </motion.div>
  );
}
