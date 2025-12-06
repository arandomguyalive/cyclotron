"use client";

import { SonicProvider } from "@/lib/SonicContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SonicProvider>
      {children}
    </SonicProvider>
  );
}
