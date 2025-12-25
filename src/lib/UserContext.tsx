"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { 
  onAuthStateChanged, 
  signInAnonymously as firebaseSignInAnonymously, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut, 
  User 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";

export interface UserProfile {
  uid?: string;
  displayName: string;
  handle: string;
  bio: string;
  avatarSeed: string;
  coverImage?: string;
  faction: "Netrunner" | "Drifter" | "Corp" | "Ghost";
  tier: "free" | "premium" | "gold" | "platinum" | "sovereign" | "lifetime";
  accessType?: "LIFETIME_BLACKLIST";
  billingCycle?: "monthly" | "annual";
  inventory?: string[];
  privacy?: {
    ghostMode: boolean;
    bioLock: boolean;
    screenshotAlert: boolean;
    dataSaver: boolean;
    selfDestructTimer: string;
  };
  stats: {
    following: number;
    followers: number;
    likes: number;
    credits: number;
    reputation: number;
  };
}

interface UserContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  updateUser: (updates: any) => Promise<void>; // Any to support dot-notation strings
  loginAnonymously: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, handle: string) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultUser: UserProfile = {
  displayName: "KM18 Sovereign",
  handle: "km18_nexus",
  bio: "Architect of the Cyclotron.",
  avatarSeed: "KM18",
  faction: "Ghost",
  tier: "sovereign",
  stats: { following: 0, followers: 0, likes: 0, credits: 0, reputation: 0 }
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        
        // Use onSnapshot for real-time local profile updates
        unsubscribeSnapshot = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            let data = docSnap.data() as UserProfile;
            
            // --- DATA FIXER (Resilience Layer) ---
            let needsFix = false;
            
            // 1. Initialize stats if missing or corrupted
            if (!data.stats || typeof data.stats !== 'object') {
                data.stats = { following: 0, followers: 0, likes: 0, credits: 500, reputation: 10 };
                needsFix = true;
            } else {
                // 2. Convert existing string stats to numbers
                const keys: (keyof UserProfile['stats'])[] = ['following', 'followers', 'likes', 'credits', 'reputation'];
                keys.forEach(key => {
                    const val = data.stats[key];
                    if (typeof val === 'string') {
                        (data.stats as any)[key] = Number((val as string).replace(/[^\d.-]/g, '')) || 0;
                        needsFix = true;
                    }
                });
            }

            if (needsFix) {
                console.log("Legacy Data Detected. Synchronizing Numeric Signal...");
                // Force an atomic update to fix the database record
                await setDoc(userRef, { stats: data.stats }, { merge: true });
                return; 
            }

            if (data.accessType === "LIFETIME_BLACKLIST") data.tier = "lifetime";
            setUser({ ...data, uid: currentUser.uid });
          } else {
            // New user or guest
            setUser({ ...defaultUser, uid: currentUser.uid });
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const updateUser = async (updates: any) => {
    if (!firebaseUser) return;
    console.log(`[updateUser] Attempting update for ${firebaseUser.uid}`, updates);
    try {
        await updateDoc(doc(db, "users", firebaseUser.uid), updates);
        console.log(`[updateUser] Success.`);
    } catch (e) {
        console.warn("[updateUser] updateDoc failed, trying setDoc merge", e);
        await setDoc(doc(db, "users", firebaseUser.uid), updates, { merge: true });
        console.log(`[updateUser] Success via setDoc.`);
    }
  };

  const loginAnonymously = async () => {
    setLoading(true);
    try {
      await firebaseSignInAnonymously(auth);
    } catch (error) {
      console.error("Anonymous login failed", error);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login failed", error);
      setLoading(false);
      throw error;
    }
  };

  const signup = async (email: string, password: string, handle: string) => {
      setLoading(true);
      try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          // Create User Profile
          const newUser: UserProfile = {
              displayName: handle,
              handle: handle,
              bio: "New to the grid.",
              avatarSeed: "Agent",
              faction: "Drifter",
              tier: "free",
              stats: { following: 0, followers: 0, likes: 0, credits: 500, reputation: 10 }
          };
          await setDoc(doc(db, "users", cred.user.uid), newUser);
          setUser(newUser);
      } catch (error) {
          console.error("Signup failed", error);
          setLoading(false);
          throw error;
      }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem("oblivion_user"); // Clear local overrides on logout
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, firebaseUser, loading, updateUser, loginAnonymously, login, signup, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
