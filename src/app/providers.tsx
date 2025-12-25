"use client";

import { SonicProvider } from "@/lib/SonicContext";
import { UserProvider } from "@/lib/UserContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import { ToastProvider } from "@/lib/ToastContext";
import { NativeHandler } from "@/components/layout/NativeHandler";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SonicProvider>
      <NativeHandler />
      <ToastProvider>
        <UserProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </UserProvider>
      </ToastProvider>
    </SonicProvider>
  );
}
