"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, RefreshCw } from "lucide-react";
import { useUser } from "@/lib/UserContext";
import { useSonic } from "@/lib/SonicContext";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateUser } = useUser();
  const { playClick } = useSonic();
  
  // Local state for form inputs
  const [name, setName] = useState(user?.displayName || "");
  const [handle, setHandle] = useState(user?.handle || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarSeed, setAvatarSeed] = useState(user?.avatarSeed || "default");

  useEffect(() => {
    if (user) {
      setName(user.displayName);
      setHandle(user.handle);
      setBio(user.bio);
      setAvatarSeed(user.avatarSeed);
    }
  }, [user]);

  const handleSave = () => {
    playClick(440, 0.1, 'sine');
    updateUser({
      displayName: name,
      handle,
      bio,
      avatarSeed
    });
    onClose();
  };

  const randomizeAvatar = () => {
    playClick(600, 0.05, 'triangle');
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80]"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-secondary-bg border border-border-color rounded-3xl overflow-hidden pointer-events-auto shadow-2xl">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-border-color flex items-center justify-between bg-primary-bg">
                <h2 className="text-lg font-bold text-primary-text">Edit Neural Profile</h2>
                <button onClick={onClose} className="p-2 hover:bg-secondary-bg rounded-full transition-colors">
                  <X className="w-5 h-5 text-secondary-text" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full border-4 border-accent-1 bg-primary-bg overflow-hidden relative group">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                      alt="Avatar" 
                      className="w-full h-full"
                    />
                    <button 
                      onClick={randomizeAvatar}
                      className="absolute inset-0 bg-primary-bg/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <RefreshCw className="w-8 h-8 text-primary-text" />
                    </button>
                  </div>
                  <button onClick={randomizeAvatar} className="text-xs text-accent-1 hover:underline">
                    Randomize Identity
                  </button>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-secondary-text">Display Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-secondary-bg/50 border border-border-color rounded-xl px-4 py-3 text-primary-text placeholder:text-secondary-text focus:border-accent-1 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-secondary-text">Handle (@)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-3 text-secondary-text">@</span>
                        <input 
                        type="text" 
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        className="w-full bg-secondary-bg/50 border border-border-color rounded-xl pl-8 pr-4 py-3 text-primary-text placeholder:text-secondary-text focus:border-accent-1 focus:outline-none transition-colors"
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-secondary-text">Bio / Manifesto</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full bg-secondary-bg/50 border border-border-color rounded-xl px-4 py-3 text-primary-text placeholder:text-secondary-text focus:border-accent-1 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border-color bg-primary-bg flex justify-end">
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-accent-1 text-primary-bg font-bold rounded-xl hover:bg-accent-1/90 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
