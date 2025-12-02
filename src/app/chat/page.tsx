"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Lock, RefreshCw } from "lucide-react";
import AES from "crypto-js/aes";
import encUtf8 from "crypto-js/enc-utf8";

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
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-cyber-black pt-4">
      {/* Header */}
      <div className="px-4 pb-4 border-b border-white/10 flex items-center gap-3 bg-cyber-black/50 backdrop-blur-md sticky top-0 z-10">
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
      <div className="p-4 pb-6 bg-cyber-black border-t border-white/10">
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
            className="w-10 h-10 rounded-full bg-cyber-blue flex items-center justify-center text-black hover:bg-cyber-blue/80 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const [decrypted, setDecrypted] = useState(false);
  
  // Simulate decryption delay for effect
  useEffect(() => {
    const timer = setTimeout(() => setDecrypted(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[80%] rounded-2xl p-3 relative overflow-hidden ${
        message.sender === "me" 
          ? "bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30 rounded-tr-none" 
          : "bg-white/10 text-white border border-white/10 rounded-tl-none"
      }`}>
        {!decrypted ? (
           <div className="flex items-center gap-2 text-xs font-mono opacity-70">
             <RefreshCw className="w-3 h-3 animate-spin" />
             <span className="truncate max-w-[150px]">{message.encrypted.substring(0, 20)}...</span>
           </div>
        ) : (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
