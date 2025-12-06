"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Lock, RefreshCw, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import AES from "crypto-js/aes";
import encUtf8 from "crypto-js/enc-utf8";
import { useSonic } from "@/lib/SonicContext";

interface Message {
  id: string;
  text: string;
  encrypted: string;
  sender: "me" | "them";
  timestamp: number;
}

const SECRET_KEY = "cyclotron-secret-key-v1";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Initial welcome message
  useEffect(() => {
    addMessage("Welcome to Cyclotron Secure Chat. End-to-End Encrypted.", "them");
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (text: string, sender: "me" | "them") => {
    const encrypted = AES.encrypt(text, SECRET_KEY).toString();
    const newMessage: Message = {
      id: Date.now().toString() + Math.random(),
      text,
      encrypted,
      sender,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    addMessage(input, "me");
    setInput("");
    
    // Auto-reply simulation
    setTimeout(() => {
      addMessage("I received your encrypted transmission.", "them");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-cyber-black">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3 bg-cyber-black/80 backdrop-blur-md sticky top-0 z-50 safe-area-top">
        <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
        >
            <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyber-blue to-cyber-purple p-[2px]">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Agent" 
            alt="Agent" 
            className="w-full h-full rounded-full bg-black"
          />
        </div>
        <div>
          <h2 className="font-bold text-white">Agent Zero</h2>
          <div className="flex items-center gap-1 text-xs text-cyber-blue/80">
            <Lock className="w-3 h-3" />
            <span>E2EE Active</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-cyber-black border-t border-white/10 sticky bottom-0 z-50 pb-safe-area-inset-bottom">
        <div className="flex items-center gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type encrypted message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyber-blue transition-colors"
          />
          <button 
            onClick={handleSend}
            className="w-10 h-10 rounded-full bg-cyber-blue flex items-center justify-center text-black hover:bg-cyber-blue/80 transition-colors shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const [isRevealed, setIsRevealed] = useState(message.sender === "me"); // Sent messages are always revealed
  const [scratchProgress, setScratchProgress] = useState(0);
  const { playClick } = useSonic();

  const handleScratch = (e: React.PointerEvent) => {
    if (isRevealed) return;
    
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
      className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
    >
      <div 
        className={`max-w-[80%] rounded-2xl p-3 relative overflow-hidden cursor-crosshair touch-none select-none ${
        message.sender === "me" 
          ? "bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30 rounded-tr-none" 
          : "bg-white/10 text-white border border-white/10 rounded-tl-none"
      }`}
        onPointerMove={handleScratch}
      >
        {!isRevealed ? (
           <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2 text-xs font-mono opacity-70 text-cyber-pink">
                <Lock className="w-3 h-3" />
                <span>SCRUB TO DECRYPT</span>
             </div>
             <p className="font-mono text-sm break-all opacity-50 blur-[1px]">
                {message.encrypted.substring(0, Math.min(message.encrypted.length, 50))}
             </p>
             {/* Progress Bar */}
             <div className="h-1 w-full bg-white/10 rounded-full mt-1 overflow-hidden">
                 <motion.div 
                    className="h-full bg-cyber-pink"
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
            {message.text}
          </motion.p>
        )}
        
        {/* Decorative corner */}
        <div className={`absolute top-0 w-2 h-2 ${message.sender === "me" ? "right-0 bg-cyber-blue" : "left-0 bg-white/50"}`} />
      </div>
    </motion.div>
  );
}
