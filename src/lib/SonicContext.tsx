"use client";

import React, { createContext, useContext, useRef, useEffect, useState, useCallback } from 'react';

import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export { ImpactStyle };

interface SonicContextType {
  playClick: (frequency?: number, duration?: number, type?: OscillatorType) => void;
  playHum: (state: 'start' | 'stop' | 'adjust', frequency?: number, gain?: number) => void;
  playHaptic: (style?: ImpactStyle | 'selection' | 'vibrate') => void;
}

const SonicContext = createContext<SonicContextType | undefined>(undefined);

export const SonicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const humOscillatorRef = useRef<OscillatorNode | null>(null);
  const humGainRef = useRef<GainNode | null>(null);

  const [initialized, setInitialized] = useState(false);

  // Initialize AudioContext on first user interaction
  const initializeAudio = useCallback(() => {
    if (!audioContextRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('AudioContext initialized');
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    // Attach a global click listener to initialize audio context
    // This is necessary for some browsers (e.g., Chrome) that require user gesture
    document.addEventListener('click', initializeAudio, { once: true });
    document.addEventListener('keydown', initializeAudio, { once: true });

    return () => {
      document.removeEventListener('click', initializeAudio);
      document.removeEventListener('keydown', initializeAudio);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [initializeAudio]);

  const playClick = useCallback((frequency = 440, duration = 0.05, type: OscillatorType = 'sine') => {
    if (!audioContextRef.current || audioContextRef.current.state === 'suspended') {
      initializeAudio(); // Attempt to resume/initialize
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }

    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioContextRef.current.currentTime); // Master volume for clicks

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + duration);
    }
  }, [initializeAudio]);

  const playHum = useCallback((state: 'start' | 'stop' | 'adjust', frequency = 80, gain = 0.1) => {
    if (!audioContextRef.current || audioContextRef.current.state === 'suspended') {
        initializeAudio();
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
    }

    if (!audioContextRef.current || audioContextRef.current.state !== 'running') {
        return; // Cannot play if AudioContext is not running
    }

    if (state === 'start' && !humOscillatorRef.current) {
      humOscillatorRef.current = audioContextRef.current.createOscillator();
      humGainRef.current = audioContextRef.current.createGain();

      humOscillatorRef.current.type = 'sine';
      humOscillatorRef.current.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      humGainRef.current.gain.setValueAtTime(gain, audioContextRef.current.currentTime);

      humOscillatorRef.current.connect(humGainRef.current);
      humGainRef.current.connect(audioContextRef.current.destination);

      humOscillatorRef.current.start();
      console.log('Hum started');
    } else if (state === 'stop' && humOscillatorRef.current) {
      humOscillatorRef.current.stop();
      humOscillatorRef.current.disconnect();
      humGainRef.current?.disconnect();
      humOscillatorRef.current = null;
      humGainRef.current = null;
      console.log('Hum stopped');
    } else if (state === 'adjust' && humOscillatorRef.current && humGainRef.current) {
        humOscillatorRef.current.frequency.linearRampToValueAtTime(frequency, audioContextRef.current.currentTime + 0.1);
        humGainRef.current.gain.linearRampToValueAtTime(gain, audioContextRef.current.currentTime + 0.1);
        console.log(`Hum adjusted: Freq=${frequency}, Gain=${gain}`);
    }
  }, [initializeAudio]);

  const playHaptic = useCallback(async (style: ImpactStyle | 'selection' | 'vibrate' = ImpactStyle.Light) => {
    if (Capacitor.isNativePlatform()) {
      try {
        if (style === 'selection') {
          await Haptics.selectionStart();
        } else if (style === 'vibrate') {
          await Haptics.vibrate();
        } else {
          await Haptics.impact({ style });
        }
      } catch (e) {
        console.warn('Haptics failed', e);
      }
    } else if (navigator.vibrate) {
      // Fallback for web
      navigator.vibrate(style === ImpactStyle.Heavy ? 50 : 20);
    }
  }, []);

  return (
    <SonicContext.Provider value={{ playClick, playHum, playHaptic }}>
      {children}
    </SonicContext.Provider>
  );
};

export const useSonic = () => {
  const context = useContext(SonicContext);
  if (context === undefined) {
    throw new Error('useSonic must be used within a SonicProvider');
  }
  return context;
};
