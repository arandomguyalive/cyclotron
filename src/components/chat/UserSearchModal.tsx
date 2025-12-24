"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, UserPlus, Loader2 } from "lucide-react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/lib/UserContext";
import { useSonic } from "@/lib/SonicContext";
import { useRouter } from "next/navigation";

interface UserResult {
  id: string;
  handle: string;
  displayName: string;
  avatarSeed: string;
}

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSearchModal({ isOpen, onClose }: UserSearchModalProps) {
  const { firebaseUser } = useUser();
  const { playClick } = useSonic();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Client-side filtering for better UX in prototype
        const usersRef = collection(db, "users");
        const q = query(usersRef, limit(50)); // Fetch enough candidates
        
        const snapshot = await getDocs(q);
        const foundUsers: UserResult[] = [];
        const lowerQuery = searchQuery.toLowerCase();

        snapshot.forEach(doc => {
            const data = doc.data();
            const handle = (data.handle || "").toLowerCase();
            const name = (data.displayName || "").toLowerCase();
            
            if (doc.id !== firebaseUser?.uid && (handle.includes(lowerQuery) || name.includes(lowerQuery))) {
                foundUsers.push({ id: doc.id, ...data } as UserResult);
            }
        });
        setResults(foundUsers);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, firebaseUser]);

  const handleViewProfile = (targetUserId: string) => {
    playClick(600, 0.1, 'square');
    router.push(`/profile?view=${targetUserId}`);
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
            onClick={onClose}
            className="fixed inset-0 bg-primary-bg/80 backdrop-blur-sm z-[80]"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-secondary-bg border border-border-color rounded-3xl overflow-hidden pointer-events-auto shadow-2xl flex flex-col max-h-[60vh]">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-border-color flex items-center justify-between bg-primary-bg">
                <h2 className="text-lg font-bold text-primary-text">Find Operatives</h2>
                <button onClick={onClose} className="p-2 hover:bg-secondary-bg rounded-full transition-colors">
                  <X className="w-5 h-5 text-secondary-text" />
                </button>
              </div>

              {/* Search Input */}
              <div className="p-4 bg-primary-bg border-b border-border-color">
                  <div className="relative">
                      <Search className="absolute left-4 top-3.5 w-5 h-5 text-secondary-text" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by handle..." 
                        className="w-full bg-secondary-bg/50 border border-border-color rounded-xl pl-12 pr-4 py-3 text-primary-text focus:border-accent-1 focus:outline-none transition-colors"
                        autoFocus
                      />
                  </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-secondary-bg">
                  {isSearching ? (
                      <div className="flex justify-center p-8">
                          <Loader2 className="w-6 h-6 animate-spin text-accent-1" />
                      </div>
                  ) : results.length > 0 ? (
                      results.map(user => (
                          <button 
                            key={user.id}
                            onClick={() => handleViewProfile(user.id)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-primary-bg rounded-xl transition-colors group text-left"
                          >
                              <div className="w-10 h-10 rounded-full bg-secondary-bg overflow-hidden border border-border-color group-hover:border-accent-1/50">
                                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed}`} alt={user.handle} className="w-full h-full" />
                              </div>
                              <div className="flex-1">
                                  <div className="font-bold text-primary-text">@{user.handle}</div>
                                  <div className="text-xs text-secondary-text">{user.displayName}</div>
                              </div>
                              <UserPlus className="w-5 h-5 text-secondary-text group-hover:text-accent-1" />
                          </button>
                      ))
                  ) : searchQuery ? (
                      <div className="text-center p-8 text-secondary-text text-sm">
                          No operatives found matching that handle.
                      </div>
                  ) : (
                      <div className="text-center p-8 text-secondary-text/50 text-xs">
                          Enter a handle to initiate scan.
                      </div>
                  )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
