"use client";

import { SonicProvider } from "@/lib/SonicContext";
import { UserProvider } from "@/lib/UserContext";
import { ThemeProvider } from "@/lib/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SonicProvider>
      <UserProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </UserProvider>
    </SonicProvider>
  );
}
