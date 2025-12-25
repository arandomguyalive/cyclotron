import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Send, Image as ImageIcon, Film, Mic, Loader2, CheckCircle2, Globe, MapPin, Terminal, Lock } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import { useUser } from "@/lib/UserContext";
import { useSonic } from "@/lib/SonicContext";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionMode?: boolean;
}

export function CreatePostModal({ isOpen, onClose, missionMode = false }: CreatePostModalProps) {
  const { user, firebaseUser, updateUser } = useUser();
  const { playClick } = useSonic();
  
  const [step, setStep] = useState<"select" | "create">(missionMode ? "create" : "select");
  const [mode, setMode] = useState<"post" | "reel" | "story" | "signal">("post");
  
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [region, setRegion] = useState("global");
  
  // Sovereign Controls
  const [selectedTier, setSelectedTier] = useState<"public" | "shield" | "professional" | "ultra_elite">("public");
  const [blockedRegions, setBlockedRegions] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModeSelect = (selectedMode: "post" | "reel" | "story" | "signal") => {
      if (user?.tier === 'lobby' && (selectedMode === 'reel' || selectedMode === 'story')) {
          playClick(150, 0.2, 'sawtooth');
          alert("HIGH-BANDWIDTH PROTOCOL LOCKED. Upgrade to access Reels and Stories.");
          return;
      }
      setMode(selectedMode);
      setStep("create");
      playClick(600, 0.1, 'square');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      playClick(500, 0.05, 'square');
    }
  };

  const handleSubmit = async () => {
    if (!firebaseUser || (!file && mode !== 'signal') || !user) return;

    setIsUploading(true);
    playClick(600, 0.1, 'sine');

    try {
      let downloadURL = null;

      // 1. Upload File (if not a signal)
      if (mode !== 'signal' && file) {
          const path = mode === "story" ? "stories" : "uploads";
          const storageRef = ref(storage, `${path}/${firebaseUser.uid}/${Date.now()}_${file.name}`);
          
          const snapshot = await uploadBytes(storageRef, file);
          downloadURL = await getDownloadURL(snapshot.ref);
      }

      // Determine allowed tiers
      let allowedTiers: string[] = [];
      if (selectedTier === 'shield') allowedTiers = ['shield', 'professional', 'ultra_elite', 'sovereign'];
      if (selectedTier === 'professional') allowedTiers = ['professional', 'ultra_elite', 'sovereign'];
      if (selectedTier === 'ultra_elite') allowedTiers = ['ultra_elite', 'sovereign'];

      // 2. Create Firestore Document
      const collectionName = mode === "story" ? "stories" : "posts";
      
      await addDoc(collection(db, collectionName), {
        type: mode === 'signal' ? 'text' : mode, 
        isMission: missionMode,
        caption: caption,
        mediaUrl: downloadURL,
        mediaType: mode === 'signal' ? 'text' : (file?.type.startsWith("video") ? "video" : "image"),
        userId: firebaseUser.uid,
        userHandle: user?.handle || "ghost_user",
        userAvatar: user?.avatarSeed || "default",
        userAvatarUrl: user?.avatarUrl || null,
        userTier: user?.tier || "lobby",
        userIsBlacklist: user?.isBlacklist || false,
        region: region,
        allowedTiers: allowedTiers, 
        blockedRegions: blockedRegions.split(',').map(r => r.trim().toUpperCase()).filter(r => r.length > 0),
        likes: 0,
        createdAt: serverTimestamp(),
        expiresAt: mode === "story" ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
      });

      // 3. Award Gamification Rewards
      const repReward = 10;
      const credReward = 50;

      await updateUser({
          "stats.reputation": (user.stats.reputation || 0) + repReward,
          "stats.credits": (user.stats.credits || 0) + credReward
      });

      setIsSuccess(true);
      playClick(880, 0.2, 'triangle'); 
      
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setCaption("");
    setFile(null);
    setPreviewUrl(null);
    setIsSuccess(false);
    setStep(missionMode ? "create" : "select"); // Reset to correct initial step
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
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[190]"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[200] bg-secondary-bg border-t border-border-color rounded-t-3xl h-[85vh] flex flex-col shadow-[0_-10px_40px_rgba(0,240,255,0.1)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-color">
              <h2 className={`text-xl font-bold tracking-wider uppercase ${missionMode ? "text-brand-orange animate-pulse" : "text-primary-text"}`}>
                  {missionMode ? "CLASSIFIED MISSION" : (step === 'select' ? 'Create' : `New ${mode}`)}
              </h2>
              <button onClick={handleClose} className="p-2 bg-secondary-bg/50 rounded-full text-secondary-text hover:text-primary-text hover:bg-secondary-bg">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
               
               {step === 'select' ? (
                   <div className="flex flex-col gap-4 h-full justify-center">
                       <button onClick={() => handleModeSelect('post')} className="flex items-center gap-4 p-6 bg-secondary-bg/50 border border-border-color rounded-2xl hover:bg-accent-1/10 hover:border-accent-1 transition-all group text-left">
                           <div className="p-4 bg-secondary-bg rounded-full text-accent-1 group-hover:scale-110 transition-transform"><ImageIcon className="w-8 h-8" /></div>
                           <div>
                               <h3 className="text-xl font-bold text-primary-text group-hover:text-accent-1">Post</h3>
                               <p className="text-sm text-secondary-text">Share images to the feed.</p>
                           </div>
                       </button>
                       <button onClick={() => handleModeSelect('signal')} className="flex items-center gap-4 p-6 bg-secondary-bg/50 border border-border-color rounded-2xl hover:bg-green-500/10 hover:border-green-500 transition-all group text-left">
                           <div className="p-4 bg-secondary-bg rounded-full text-green-500 group-hover:scale-110 transition-transform"><Terminal className="w-8 h-8" /></div>
                           <div>
                               <h3 className="text-xl font-bold text-primary-text group-hover:text-green-500">Signal</h3>
                               <p className="text-sm text-secondary-text">Broadcast text-only transmission.</p>
                           </div>
                       </button>
                       <button onClick={() => handleModeSelect('reel')} className={`flex items-center gap-4 p-6 bg-secondary-bg/50 border border-border-color rounded-2xl transition-all group text-left ${user?.tier === 'lobby' ? 'opacity-50' : 'hover:bg-accent-2/10 hover:border-accent-2'}`}>
                           <div className="p-4 bg-secondary-bg rounded-full text-accent-2 group-hover:scale-110 transition-transform">
                               {user?.tier === 'lobby' ? <Lock className="w-8 h-8" /> : <Film className="w-8 h-8" />}
                           </div>
                           <div className="flex-1">
                               <div className="flex items-center justify-between">
                                   <h3 className="text-xl font-bold text-primary-text group-hover:text-accent-2">Reel</h3>
                                   {user?.tier === 'lobby' && <span className="px-2 py-0.5 bg-accent-2/20 text-accent-2 text-[10px] rounded font-bold uppercase">Pro</span>}
                               </div>
                               <p className="text-sm text-secondary-text">Share vertical videos to Vortex.</p>
                           </div>
                       </button>
                       <button onClick={() => handleModeSelect('story')} className={`flex items-center gap-4 p-6 bg-secondary-bg/50 border border-border-color rounded-2xl transition-all group text-left ${user?.tier === 'lobby' ? 'opacity-50' : 'hover:bg-purple-500/10 hover:border-purple-500'}`}>
                           <div className="p-4 bg-secondary-bg rounded-full text-purple-500 group-hover:scale-110 transition-transform">
                               {user?.tier === 'lobby' ? <Lock className="w-8 h-8" /> : <Globe className="w-8 h-8" />}
                           </div>
                           <div className="flex-1">
                               <div className="flex items-center justify-between">
                                   <h3 className="text-xl font-bold text-primary-text group-hover:text-purple-500">Story</h3>
                                   {user?.tier === 'lobby' && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-500 text-[10px] rounded font-bold uppercase">Pro</span>}
                               </div>
                               <p className="text-sm text-secondary-text">Ephemeral updates (24h).</p>
                           </div>
                       </button>
                   </div>
               ) : (
                   <div className="flex flex-col gap-6 h-full">
                       
                       {/* Sovereign Controls & Region (All Tiers for region) */}
                       <div className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-4">
                           {user?.tier !== 'lobby' && (
                               <>
                               <div className="flex items-center justify-between">
                                   <span className="text-xs font-bold text-secondary-text uppercase tracking-wider">Visibility</span>
                                   <div className="flex gap-2">
                                       {(['public', 'shield', 'professional', 'ultra_elite'] as const).map(t => (
                                           <button 
                                                key={t}
                                                onClick={() => setSelectedTier(t)}
                                                className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${selectedTier === t ? 'bg-accent-1 text-black' : 'bg-white/5 text-secondary-text hover:bg-white/10'}`}
                                           >
                                               {t === 'public' ? 'All' : `${t.charAt(0).toUpperCase() + t.slice(1)}+`}
                                           </button>
                                       ))}
                                   </div>
                               </div>
                               <div>
                                   <span className="text-xs font-bold text-secondary-text uppercase tracking-wider block mb-2">Geo-Block (Country Codes)</span>
                                   <input 
                                        type="text" 
                                        value={blockedRegions}
                                        onChange={(e) => setBlockedRegions(e.target.value)}
                                        placeholder="e.g. US, CN, RU (Comma separated)"
                                        className="w-full bg-transparent border-b border-white/10 py-1 text-sm text-white placeholder:text-secondary-text/30 focus:border-accent-1 focus:outline-none font-mono"
                                   />
                               </div>
                               </>
                           )}
                           
                           <div className="flex items-center justify-between">
                               <span className="text-xs font-bold text-secondary-text uppercase tracking-wider">Transmission Sector</span>
                               <div className="flex gap-2">
                                   {['global', 'na', 'eu', 'asia', 'hidden'].map(s => (
                                       <button 
                                            key={s}
                                            onClick={() => setRegion(s)}
                                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${region === s ? 'bg-brand-orange text-white' : 'bg-white/5 text-secondary-text hover:bg-white/10'}`}
                                       >
                                           {s}
                                       </button>
                                   ))}
                               </div>
                           </div>
                       </div>

                       {/* Conditional UI based on Mode */}
                       {mode === 'signal' ? (
                           <div className="flex-1 flex flex-col bg-black border border-green-500/30 rounded-2xl p-4 font-mono shadow-[0_0_20px_rgba(34,197,94,0.1)] relative overflow-hidden">
                               <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50 animate-pulse" />
                               <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder=">> ENTER TRANSMISSION..."
                                    className="flex-1 bg-transparent border-none text-green-500 placeholder:text-green-900 focus:ring-0 resize-none outline-none text-lg leading-relaxed"
                                    autoFocus
                               />
                               <div className="text-right text-xs text-green-700 mt-2">
                                   {caption.length} / 280 BYTES
                               </div>
                           </div>
                       ) : (
                           <>
                           <div 
                             onClick={() => !file && fileInputRef.current?.click()}
                             className={`relative w-full aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group ${
                                file ? "border-transparent bg-black" : "border-border-color hover:border-accent-1/50 hover:bg-secondary-bg/50"
                             }`}
                           >
                             {previewUrl ? (
                                (file?.type.startsWith("video")) ? (
                                    <video src={previewUrl} className="w-full h-full object-cover" autoPlay muted loop />
                                ) : (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                )
                             ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-secondary-text group-hover:text-accent-1 transition-colors">
                                    <Upload className="w-12 h-12" />
                                    <span className="font-mono text-sm">UPLOAD {mode.toUpperCase()}_</span>
                                </div>
                             )}
                             
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

                           <textarea 
                              value={caption}
                              onChange={(e) => setCaption(e.target.value)}
                              placeholder={missionMode ? "Evidence for Directive..." : `Caption your ${mode}...`}
                              className="w-full flex-1 bg-transparent border-none text-lg text-primary-text placeholder:text-secondary-text/50 focus:ring-0 resize-none font-light"
                           />
                           </>
                       )}
                   </div>
               )}
            </div>

            {/* Footer */}
            {step === 'create' && (
                <div className="p-4 border-t border-border-color bg-primary-bg pb-safe-area-inset-bottom">
                     <button 
                        disabled={(!file && mode !== 'signal') || isUploading || isSuccess || (mode === 'signal' && !caption.trim())}
                        onClick={handleSubmit}
                        className={`w-full py-4 rounded-xl font-bold text-primary-bg flex items-center justify-center gap-2 transition-all ${
                            isSuccess ? "bg-green-500" : ((file || (mode === 'signal' && caption.trim())) ? "bg-accent-1 hover:bg-accent-1/90" : "bg-secondary-text/20 cursor-not-allowed")
                        }`}
                     >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>UPLOADING...</span>
                            </>
                    ) : isSuccess ? (
                        <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>{missionMode ? "MISSION COMPLETE" : "UPLOAD COMPLETE"}</span>
                        </>
                    ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span>PUBLISH {mode === 'signal' ? 'SIGNAL' : ''}</span>
                            </>
                        )}
                     </button>
                </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
