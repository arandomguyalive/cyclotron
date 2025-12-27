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

export type UserTier = "lobby" | "shield" | "professional" | "ultra_elite" | "sovereign";

export interface UserProfile {
  uid?: string;
  fullName: string;
  displayName: string;
  handle: string;
  email: string;
  phoneNumber: string;
  dob: string;
  bio: string;
  avatarSeed: string;
  avatarUrl?: string;
  coverImage?: string;
  faction: "Netrunner" | "Drifter" | "Corp" | "Ghost";
  tier: UserTier;
  isBlacklist?: boolean; // First 500 lifetime creators
  isOwner?: boolean;
  visualOverride?: boolean;
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
  bio: "Architect of the ABHED Registry.",
  avatarSeed: "KM18",
  faction: "Ghost",
  tier: "sovereign",
  isBlacklist: true,
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
          try {
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

                          // Map old tier names to new hierarchy if they exist
                          const legacyMap: Record<string, UserTier> = {
                              "free": "lobby",
                              "premium": "shield",
                              "gold": "professional",
                              "platinum": "ultra_elite",
                              "lifetime": "professional"
                          };
              
                          const handleUpper = data.handle?.toUpperCase() || "";
                          const isOwner = ['ABHI18', 'KINJAL18'].includes(handleUpper);

                          if (data.tier && legacyMap[data.tier]) {
                              console.log("[UserContext] Mapping legacy tier:", data.tier, "->", legacyMap[data.tier]);
                              data.tier = legacyMap[data.tier];
                              needsFix = true;
                          }
              
                          // Allow Lifetime Blacklist users to upgrade to higher tiers, but prevent accidental downgrades
                          // EXCEPTION: Owners can simulate ANY tier (Lobby/Shield) without auto-correction.
                          const higherTiers: UserTier[] = ["ultra_elite", "sovereign"];
                          if (!isOwner && data.accessType === "LIFETIME_BLACKLIST" && !higherTiers.includes(data.tier) && data.tier !== "professional") {
                              console.log("[UserContext] Enforcing Lifetime Blacklist tier: professional");
                              data.isBlacklist = true;
                              data.tier = "professional";
                              needsFix = true;
                          }
              
                          if (needsFix) {
                              console.log("[UserContext] Applying document fixes to Firestore...");
                              await setDoc(userRef, data, { merge: true });
                              return; 
                          }
              
                          
                          if (isOwner) {
                              data.isOwner = true;
                              if (!data.tier) data.tier = "sovereign";
                              // data.isBlacklist = true; // REMOVED: Allow owners to toggle blacklist status manually
                          }

                          console.log("[UserContext] Finalizing user state:", { handle: data.handle, tier: data.tier, isOwner });
                          setUser({ ...data, uid: currentUser.uid, isBlacklist: data.isBlacklist || false, isOwner });
            } else {
              // Document doesn't exist - Check if it's an owner logging in for the first time
              const ownerEmails = ['abhi18@abhed.network', 'kinjal18@abhed.network'];
              if (currentUser.email && ownerEmails.includes(currentUser.email)) {
                  const handle = currentUser.email.split('@')[0].toUpperCase();
                  const newOwner: UserProfile = {
                      fullName: `${handle} Architect`,
                      displayName: `${handle} Owner`,
                      handle: handle,
                      email: currentUser.email,
                      phoneNumber: "+0000000000",
                      dob: "1990-01-01",
                      bio: "System Architect of ABHED.",
                      avatarSeed: handle,
                      faction: "Ghost",
                      tier: "sovereign",
                      isBlacklist: true,
                      isOwner: true,
                      stats: { following: 0, followers: 0, likes: 0, credits: 1000, reputation: 100 }
                  };
                  await setDoc(userRef, newOwner);
              } else {
                  setUser(null);
              }
            }
          } catch (err) {
            console.error("Firestore snapshot error:", err);
            setUser(null);
          } finally {
            setLoading(false);
          }
        }, (error) => {
          console.error("onSnapshot failed:", error);
          setUser(null);
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

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    try {
      let email = identifier;

      // If not an email, lookup by handle or phone
      if (!identifier.includes("@")) {
          const upperIdentifier = identifier.toUpperCase();
          const ownerHandles = ['ABHI18', 'KINJAL18'];
          
          if (ownerHandles.includes(upperIdentifier)) {
              email = `${identifier.toLowerCase()}@abhed.network`;
          } else {
              const { collection, query, where, getDocs } = await import("firebase/firestore");
              
              // Try Handle (Upper case)
              let q = query(collection(db, "users"), where("handle", "==", upperIdentifier));
              let snap = await getDocs(q);
              
              if (snap.empty) {
                  // Try Phone Number
                  q = query(collection(db, "users"), where("phoneNumber", "==", identifier));
                  snap = await getDocs(q);
              }

              if (!snap.empty) {
                  email = snap.docs[0].data().email;
              } else {
                  throw new Error(`Identity "${identifier}" not recognized in the ABHED Registry.`);
              }
          }
      }

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
              tier: "lobby",
              isBlacklist: false,
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