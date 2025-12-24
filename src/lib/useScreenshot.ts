"use client";

import { useEffect } from 'react';

/**
 * A hook that attempts to detect screenshot events.
 * 
 * WEB LIMITATION: Browsers strictly sandbox screenshot functionality. 
 * We can only reliably detect the 'PrintScreen' key press on desktop.
 * On mobile/native builds, this should be replaced with `capacitor-screenshot` plugin listeners.
 * 
 * @param onScreenshot Callback function to execute when a screenshot is detected
 */
export const useScreenshot = (onScreenshot: () => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Standard "PrintScreen" check with fallbacks for Linux/Legacy browsers
      if (e.key === 'PrintScreen' || e.key === 'Print' || e.code === 'PrintScreen') {
        onScreenshot();
      }
      // Attempt to detect Mac Shortcuts (Cmd+Shift+3 or Cmd+Shift+4)
      // Note: macOS often intercepts these before the browser, but some browser versions leak the keydown.
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '$' || e.key === '#')) {
          onScreenshot();
      }
    };

    // For Mac users, 'PrintScreen' doesn't exist. cmd+shift+3/4 are system level and undetectable by the browser.
    // However, we can listen for focus loss which *sometimes* correlates with snipping tools,
    // though this generates too many false positives to be usable for a "Security Alert".
    
    window.addEventListener('keyup', handleKeyDown);

    return () => {
      window.removeEventListener('keyup', handleKeyDown);
    };
  }, [onScreenshot]);
};
