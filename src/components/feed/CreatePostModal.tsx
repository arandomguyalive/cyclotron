"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Send, Image as ImageIcon, Film, Mic, Loader2, CheckCircle2 } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import { useUser } from "@/lib/UserContext";
import { useSonic } from "@/lib/SonicContext";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { user, firebaseUser } = useUser();
  const { playClick } = useSonic();
  
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mode, setMode] = useState<"post" | "story">("post"); // New: Mode State
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      playClick(500, 0.05, 'square');
    }
  };

  const handleSubmit = async () => {
    if (!firebaseUser || !file) return;

    setIsUploading(true);
    playClick(600, 0.1, 'sine');

    try {
      // 1. Upload File
      const path = mode === "story" ? "stories" : "uploads";
      const storageRef = ref(storage, `${path}/${firebaseUser.uid}/${Date.now()}_${file.name}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 2. Create Firestore Document
      // Stories go to 'stories', Posts to 'posts'
      const collectionName = mode === "story" ? "stories" : "posts";
      
      await addDoc(collection(db, collectionName), {
        caption: caption,
        mediaUrl: downloadURL,
        mediaType: file.type.startsWith("video") ? "video" : "image",
        userId: firebaseUser.uid,
        userHandle: user?.handle || "ghost_user",
        userAvatar: user?.avatarSeed || "default",
        likes: 0,
        createdAt: serverTimestamp(),
        // Stories auto-expire in 24h
        expiresAt: mode === "story" ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
      });

      setIsSuccess(true);
      playClick(880, 0.2, 'triangle'); 
      
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      console.error("Upload failed", error);
      alert("Transmission failed. Signal lost.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setCaption("");
    setFile(null);
    setPreviewUrl(null);
    setIsSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[80]"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[90] bg-secondary-bg border-t border-border-color rounded-t-3xl h-[90vh] flex flex-col shadow-[0_-10px_40px_rgba(0,240,255,0.1)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-color">
              <div className="flex gap-4">
                <button 
                  onClick={() => setMode("post")}
                  className={`text-xl font-bold tracking-wider uppercase transition-colors ${mode === "post" ? "text-accent-1" : "text-secondary-text"}`}
                >
                  Transmit
                </button>
                <div className="w-[1px] h-6 bg-border-color" />
                <button 
                  onClick={() => setMode("story")}
                  className={`text-xl font-bold tracking-wider uppercase transition-colors ${mode === "story" ? "text-accent-1" : "text-secondary-text"}`}
                >
                  Flux
                </button>
              </div>
              <button onClick={handleClose} className="p-2 bg-secondary-bg/50 rounded-full text-secondary-text hover:text-primary-text hover:bg-secondary-bg">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
               
               {/* File Preview / Selector */}
               <div 
                 onClick={() => !file && fileInputRef.current?.click()}
                 className={`relative w-full aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group ${
                    file ? "border-transparent bg-black" : "border-border-color hover:border-accent-1/50 hover:bg-secondary-bg/50"
                 }`}
               >
                 {previewUrl ? (
                    file?.type.startsWith("video") ? (
                        <video src={previewUrl} className="w-full h-full object-cover" autoPlay muted loop />
                    ) : (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    )
                 ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-secondary-text group-hover:text-accent-1 transition-colors">
                        <Upload className="w-12 h-12" />
                        <span className="font-mono text-sm">UPLOAD MEDIA_</span>
                    </div>
                 )}
                 
                 {/* Change File Button */}
                 {file && (
                     <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                        }}
                        className="absolute bottom-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-bold border border-white/20 hover:bg-white/20"
                     >
                        CHANGE
                     </button>
                 )}

                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept="image/*,video/*" 
                    className="hidden" 
                 />
               </div>

               {/* Caption Input */}
               <div className="flex-1">
                   <textarea 
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Enter transmission data..."
                      className="w-full h-full bg-transparent border-none text-lg text-primary-text placeholder:text-secondary-text/50 focus:ring-0 resize-none font-light"
                   />
               </div>
            </div>

            {/* Footer / Actions */}
            <div className="p-4 border-t border-border-color bg-primary-bg pb-safe-area-inset-bottom">
                 <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex gap-4 text-accent-1">
                        <ImageIcon className="w-6 h-6 opacity-50 cursor-pointer hover:opacity-100" onClick={() => fileInputRef.current?.click()} />
                        <Film className="w-6 h-6 opacity-50 cursor-pointer hover:opacity-100" onClick={() => fileInputRef.current?.click()} />
                        <Mic className="w-6 h-6 opacity-50 cursor-not-allowed" />
                    </div>
                    <span className="text-xs font-mono text-secondary-text">{caption.length} / 280</span>
                 </div>

                 {user?.tier === 'free' && (
                     <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-accent-1/10 border border-accent-1/20 text-accent-1 text-xs font-mono p-2 rounded-lg mb-3 flex items-center justify-between"
                     >
                        <span>KM18 Tax: <span className="font-bold">30%</span> on Transactions.</span>
                        <span className="text-[10px] bg-accent-1/30 px-1 rounded-sm">LOBBY</span>
                     </motion.div>
                 )}

                 <button 
                    disabled={!file || isUploading || isSuccess}
                    onClick={handleSubmit}
                    className={`w-full py-4 rounded-xl font-bold text-primary-bg flex items-center justify-center gap-2 transition-all ${
                        isSuccess ? "bg-green-500" : (file ? "bg-accent-1 hover:bg-accent-1/90" : "bg-secondary-text/20 cursor-not-allowed")
                    }`}
                 >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>TRANSMITTING...</span>
                        </>
                    ) : isSuccess ? (
                        <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>UPLOAD COMPLETE</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            <span>INITIATE UPLOAD</span>
                        </>
                    )}
                 </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
