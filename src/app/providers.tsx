"use client";

import { SonicProvider } from "@/lib/SonicContext";
import { UserProvider } from "@/lib/UserContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import { ToastProvider } from "@/lib/ToastContext";
import { LocationProvider } from "@/lib/LocationContext";
import { ZenModeProvider } from "@/lib/ZenModeContext";
import { NativeHandler } from "@/components/layout/NativeHandler";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SonicProvider>
      <NativeHandler />
      <ToastProvider>
        <LocationProvider>
          <UserProvider>
            <ZenModeProvider>
              <ThemeProvider>
                {children}
              </ThemeProvider>
            </ZenModeProvider>
          </UserProvider>
        </LocationProvider>
      </ToastProvider>
    </SonicProvider>
  );
}
