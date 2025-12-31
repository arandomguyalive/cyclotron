"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, RefreshCw, Loader2, Image as ImageIcon, Camera } from "lucide-react";
import { useUser } from "@/lib/UserContext";
import { useSonic } from "@/lib/SonicContext";
import { doc, setDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateUser, firebaseUser } = useUser();
  const { playClick } = useSonic();
  
  // Local state for form inputs
  const [name, setName] = useState(user?.displayName || "");
  const [handle, setHandle] = useState(user?.handle || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarSeed, setAvatarSeed] = useState(user?.avatarSeed || "default");
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(user?.coverImage || null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName);
      setHandle(user.handle);
      setBio(user.bio);
      setAvatarSeed(user.avatarSeed);
      setAvatarPreview(user.avatarUrl || null);
      setCoverPreview(user.coverImage || null);
    }
  }, [user]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        playClick(500, 0.05, 'square');
    }
  }

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
        playClick(500, 0.05, 'square');
    }
  }

  const handleSave = async () => {
    if (!firebaseUser) return;
    
    setIsSaving(true);
    playClick(440, 0.1, 'sine');

    try {
        let avatarUrl = user?.avatarUrl;
        let coverImageUrl = user?.coverImage;

        // 1. Upload Avatar if changed
        if (avatarFile) {
            const avatarRef = ref(storage, `avatars/${firebaseUser.uid}_${Date.now()}`);
            const snapshot = await uploadBytes(avatarRef, avatarFile);
            avatarUrl = await getDownloadURL(snapshot.ref);
        }

        // 2. Upload Cover if changed
        if (coverFile) {
            const storageRef = ref(storage, `covers/${firebaseUser.uid}_${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, coverFile);
            coverImageUrl = await getDownloadURL(snapshot.ref);
        }

        // 3. Sync to Context/Firestore
        await updateUser({
            displayName: name || "",
            handle: handle || "",
            bio: bio || "",
            avatarSeed: avatarSeed || "default",
            avatarUrl: avatarUrl || null,
            coverImage: coverImageUrl || null
        });
        
        onClose();
    } catch (error: any) {
        console.error("Neural sync error:", error);
        alert(`Neural Link Unstable: ${error.message || "Unknown error"}`);
    } finally {
        setIsSaving(false);
    }
  };

  const randomizeAvatar = () => {
    playClick(600, 0.05, 'triangle');
    setAvatarFile(null); // Clear manual upload
    setAvatarPreview(null);
    setAvatarSeed(Math.random().toString(36).substring(7));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[190]"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-secondary-bg border border-border-color rounded-3xl overflow-hidden pointer-events-auto shadow-2xl">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-border-color flex items-center justify-between bg-primary-bg">
                <h2 className="text-lg font-bold text-primary-text">Profile Settings</h2>
                <button onClick={onClose} className="p-2 hover:bg-secondary-bg rounded-full transition-colors">
                  <X className="w-5 h-5 text-secondary-text" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                
                {/* Cover Image Upload */}
                <div 
                    onClick={() => coverInputRef.current?.click()}
                    className="relative w-full h-32 rounded-xl bg-secondary-bg border-2 border-dashed border-border-color hover:border-accent-1 overflow-hidden cursor-pointer group transition-all"
                >
                    {coverPreview ? (
                        <img src={coverPreview} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" alt="Cover Preview" />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-secondary-text group-hover:text-accent-1">
                            <ImageIcon className="w-8 h-8 mb-2" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Update Cover</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                    <input type="file" ref={coverInputRef} onChange={handleCoverSelect} accept="image/*" className="hidden" />
                </div>

                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 -mt-12 relative z-10">
                  <div 
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-24 h-24 rounded-full border-4 border-accent-1 bg-primary-bg overflow-hidden relative group cursor-pointer"
                  >
                    <img 
                      src={avatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-primary-bg/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-primary-text" />
                    </div>
                    <input type="file" ref={avatarInputRef} onChange={handleAvatarSelect} accept="image/*" className="hidden" />
                  </div>
                  <div className="flex gap-4">
                      <button onClick={randomizeAvatar} className="text-[10px] font-bold uppercase tracking-widest text-secondary-text hover:text-accent-1 transition-colors">
                        Randomize Photo
                      </button>
                      <button onClick={() => avatarInputRef.current?.click()} className="text-[10px] font-bold uppercase tracking-widest text-accent-1">
                        Upload Photo
                      </button>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-text ml-1">Display Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-secondary-bg border border-border-color rounded-xl px-4 py-3 text-primary-text placeholder:text-secondary-text focus:border-accent-1 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-text ml-1">Username (@)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-3 text-secondary-text">@</span>
                        <input 
                        type="text" 
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        className="w-full bg-secondary-bg border border-border-color rounded-xl pl-8 pr-4 py-3 text-primary-text placeholder:text-secondary-text focus:border-accent-1 focus:outline-none transition-colors font-mono"
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary-text ml-1">Bio / About Me</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full bg-secondary-bg border border-border-color rounded-xl px-4 py-3 text-primary-text placeholder:text-secondary-text focus:border-accent-1 focus:outline-none transition-colors resize-none font-light"
                    />
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border-color bg-primary-bg flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-accent-1 text-primary-bg font-bold rounded-xl hover:bg-accent-1/90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        SAVING...
                      </>
                  ) : (
                      <>
                        <Save className="w-4 h-4" />
                        UPDATE PROFILE
                      </>
                  )}
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
