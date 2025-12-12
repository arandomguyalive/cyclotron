"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, AlertTriangle, CheckCircle, Info, Lock } from "lucide-react";
import { useSonic } from "./SonicContext";

export type ToastType = "success" | "error" | "info" | "warning" | "encrypted";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { playClick } = useSonic();

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7);
    
    // Audio cue based on type
    if (type === "error") playClick(200, 0.2, "sawtooth");
    else if (type === "success") playClick(800, 0.1, "sine");
    else if (type === "encrypted") playClick(600, 0.15, "square");
    else playClick(400, 0.05, "sine");

    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, [playClick]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <HoloToast key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function HoloToast({ toast, onDismiss }: { toast: Toast, onDismiss: () => void }) {
  const colors = {
    success: "border-green-500/50 bg-green-500/10 text-green-400",
    error: "border-red-500/50 bg-red-500/10 text-red-400",
    warning: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
    info: "border-accent-1/50 bg-accent-1/10 text-accent-1",
    encrypted: "border-accent-2/50 bg-accent-2/10 text-accent-2",
  };

  const icons = {
    success: CheckCircle,
    error: AlertTriangle,
    warning: AlertTriangle,
    info: Info,
    encrypted: Lock,
  };

  const Icon = icons[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      layout
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg max-w-sm w-full ${colors[toast.type]}`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-sm font-bold tracking-wide flex-1 font-mono">{toast.message}</span>
      <button onClick={onDismiss} className="p-1 hover:bg-white/10 rounded-full transition-colors">
        <X className="w-4 h-4 opacity-70" />
      </button>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
