"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { 
  onAuthStateChanged, 
  signInAnonymously as firebaseSignInAnonymously, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  User 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface UserProfile {
  displayName: string;
  handle: string;
  bio: string;
  avatarSeed: string;
  coverImage?: string;
  faction: "Netrunner" | "Drifter" | "Corp" | "Ghost";
  tier: "free" | "premium" | "gold" | "platinum" | "sovereign";
  stats: {
    following: string;
    followers: string;
    likes: string;
    credits: string;
    reputation: string;
  };
}

interface UserContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  updateUser: (updates: Partial<UserProfile>) => void;
  loginAnonymously: () => Promise<void>;
  signup: (email: string, password: string, handle: string) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultUser: UserProfile = {
  displayName: "Cyber Drifter",
  handle: "neon_genesis",
  bio: "Building digital dreams in the void.\nFull-stack Developer | UI Enthusiast",
  avatarSeed: "User123",
  faction: "Netrunner",
  tier: "free",
  stats: {
    following: "245",
    followers: "12.4K",
    likes: "84.2K",
    credits: "2450",
    reputation: "50",
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

          // Apply Simulated Tier Override
          const simulatedTier = localStorage.getItem("simulated_tier");
          if (simulatedTier) {
              userData = { ...userData, tier: simulatedTier as any };
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
              stats: { following: "0", followers: "0", likes: "0", credits: "500", reputation: "10" }
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
    <UserContext.Provider value={{ user, firebaseUser, loading, updateUser, loginAnonymously, signup, logout }}>
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
