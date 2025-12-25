"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut, 
  User 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";

export interface UserProfile {
  uid?: string;
  fullName: string; // Real Name
  displayName: string; // Identity Label
  handle: string; // @Handle
  email: string;
  phoneNumber: string;
  dob: string; // ISO Date
  bio: string;
  avatarSeed: string;
  avatarUrl?: string;
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
  updateUser: (updates: any) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (details: {
      email: string;
      password: string;
      handle: string;
      fullName: string;
      dob: string;
      phoneNumber: string;
      faction: UserProfile['faction'];
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultUser: UserProfile = {
  fullName: "KM18 System Admin",
  displayName: "KM18 Sovereign",
  handle: "km18_nexus",
  email: "admin@abhed.network",
  phoneNumber: "+0000000000",
  dob: "1990-01-01",
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
        
        unsubscribeSnapshot = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            let data = docSnap.data() as UserProfile;
            let needsFix = false;
            
            if (!data.stats || typeof data.stats !== 'object') {
                data.stats = { following: 0, followers: 0, likes: 0, credits: 500, reputation: 10 };
                needsFix = true;
            } else {
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
                console.log("Synchronizing secure profile data...");
                await setDoc(userRef, { stats: data.stats }, { merge: true });
                return; 
            }

            if (data.accessType === "LIFETIME_BLACKLIST") data.tier = "lifetime";
            setUser({ ...data, uid: currentUser.uid });
          } else {
            // No longer supporting default guest user in state if doc missing
            setUser(null);
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
    try {
        await updateDoc(doc(db, "users", firebaseUser.uid), updates);
    } catch (e) {
        await setDoc(doc(db, "users", firebaseUser.uid), updates, { merge: true });
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signup = async (details: {
      email: string;
      password: string;
      handle: string;
      fullName: string;
      dob: string;
      phoneNumber: string;
      faction: UserProfile['faction'];
  }) => {
      setLoading(true);
      try {
          const cred = await createUserWithEmailAndPassword(auth, details.email, details.password);
          const newUser: UserProfile = {
              fullName: details.fullName,
              displayName: details.handle,
              handle: details.handle,
              email: details.email,
              phoneNumber: details.phoneNumber,
              dob: details.dob,
              bio: `New ${details.faction} operative on the grid.`,
              avatarSeed: details.handle,
              faction: details.faction,
              tier: "free",
              stats: { following: 0, followers: 0, likes: 0, credits: 500, reputation: 10 }
          };
          await setDoc(doc(db, "users", cred.user.uid), newUser);
          setUser({ ...newUser, uid: cred.user.uid });
      } catch (error) {
          setLoading(false);
          throw error;
      }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, firebaseUser, loading, updateUser, login, signup, logout }}>
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
