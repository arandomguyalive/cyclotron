"use client";

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';

export function NativeHandler() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // 1. Status Bar Customization
    const setupStatusBar = async () => {
      try {
        // Overlap the webview with the status bar for full-screen immersive UI
        await StatusBar.setOverlaysWebView({ overlay: true });
        // Set style to Dark (Light text) for the holographic theme
        await StatusBar.setStyle({ style: Style.Dark });
      } catch (e) {
        console.warn('StatusBar initialization failed', e);
      }
    };

    // 2. Keyboard Management
    const setupKeyboard = async () => {
      try {
        // Ensure keyboard resizes the webview so inputs aren't covered
        if (Capacitor.getPlatform() === 'ios') {
           await Keyboard.setResizeMode({ mode: 'native' as "native" }); 
        }
      } catch (e) {
        console.warn('Keyboard initialization failed', e);
      }
    };

    setupStatusBar();
    setupKeyboard();

    // Cleanup or listeners if needed
    return () => {
      // Logic to revert if unmounting (though AppShell is global)
    };
  }, []);

  return null; // This component doesn't render anything
}
