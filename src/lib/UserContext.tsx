"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UserProfile {
  displayName: string;
  handle: string;
  bio: string;
  avatarSeed: string;
  faction: "Netrunner" | "Drifter" | "Corp" | "Ghost";
  stats: {
    following: string;
    followers: string;
    likes: string;
  };
}

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const defaultUser: UserProfile = {
  displayName: "Cyber Drifter",
  handle: "neon_genesis",
  bio: "Building digital dreams in the void.\nFull-stack Developer | UI Enthusiast",
  avatarSeed: "User123",
  faction: "Netrunner",
  stats: {
    following: "245",
    followers: "12.4K",
    likes: "84.2K",
  },
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultUser);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("oblivion_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load user data", e);
      }
    }
  }, []);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const newState = { ...prev, ...updates };
      localStorage.setItem("oblivion_user", JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
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
