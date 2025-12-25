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
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface UserProfile {
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
  updateUser: (updates: Partial<UserProfile>) => void;
  loginAnonymously: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, handle: string) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultUser: UserProfile = {
  displayName: "KM18 Sovereign",
  handle: "km18_nexus",
  bio: "Architect of the Cyclotron. Digital sovereignty is the only truth.",
  avatarSeed: "KM18",
  faction: "Ghost",
  tier: "sovereign",
  stats: {
    following: 245,
    followers: 12400,
    likes: 84200,
    credits: 2450,
    reputation: 50,
  },
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      
      if (currentUser) {
        // Try to fetch real profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          let userData: UserProfile;

          if (userDoc.exists()) {
            userData = userDoc.data() as UserProfile;
          } else {
            // Fallback to default/mock user
            const saved = localStorage.getItem("oblivion_user");
            userData = saved ? JSON.parse(saved) : defaultUser;
          }

          // Check for Lifetime Access
          if (userData.accessType === "LIFETIME_BLACKLIST") {
              userData.tier = "lifetime";
          }

          // Apply Simulated Tier Override
          const simulatedTier = localStorage.getItem("simulated_tier");
          if (simulatedTier) {
              userData = { ...userData, tier: simulatedTier as UserProfile['tier'] };
          }

          setUser(userData);

        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(defaultUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!firebaseUser) return;

    try {
        await setDoc(doc(db, "users", firebaseUser.uid), updates, { merge: true });
        
        setUser((prev) => {
          if (!prev) return null;
          const newState = { ...prev, ...updates };
          
          // Persist simulation
          if (updates.tier) {
              localStorage.setItem("simulated_tier", updates.tier);
          }

          // If we are anonymous/testing, save to local storage
          if (firebaseUser?.isAnonymous) {
              localStorage.setItem("oblivion_user", JSON.stringify(newState));
          }
          return newState;
        });
    } catch (e) {
        console.error("Failed to update user profile", e);
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
