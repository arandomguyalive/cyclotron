"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, ShieldCheck, MapPin, AlertTriangle } from 'lucide-react';
import { MapEvents } from './MapEvents';

// Fix for default Leaflet markers in Next.js
const icon = L.icon({
  iconUrl: '/icons/icon-192x192.png', // Fallback to our app icon or a specific pin
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});

interface TacticalMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (lat: number, lng: number, radius: number) => void;
}

export function TacticalMapModal({ isOpen, onClose, onConfirm }: TacticalMapModalProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(50); // Default 50m
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get current user location on mount
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setPosition(loc); // Default pin to current location
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <div className="w-full max-w-lg bg-cyber-black border border-brand-cyan/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,212,229,0.2)] flex flex-col h-[80vh]">
          {/* Header */}
          <div className="p-4 border-b border-brand-cyan/20 bg-black flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-brand-cyan animate-spin-slow" />
              <h2 className="text-lg font-bold text-brand-cyan tracking-widest uppercase">Geo-Lock Protocol</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white font-mono text-xs">[ESC]</button>
          </div>

          {/* Map Area */}
          <div className="relative flex-1 bg-zinc-900 z-0">
            {typeof window !== 'undefined' && (
              <MapContainer 
                center={userLocation || [20.5937, 78.9629]} // Default to India center if location fails
                zoom={15} 
                style={{ height: '100%', width: '100%', background: '#000' }}
                zoomControl={false}
              >
                {/* Dark Matter Tile Layer */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                <MapEvents onLocationSelect={(lat, lng) => setPosition({ lat, lng })} />

                {position && (
                  <>
                    <Marker position={[position.lat, position.lng]} icon={icon} />
                    <Circle 
                      center={[position.lat, position.lng]} 
                      radius={radius} 
                      pathOptions={{ color: '#00D4E5', fillColor: '#00D4E5', fillOpacity: 0.2 }} 
                    />
                  </>
                )}
              </MapContainer>
            )}

            {/* Overlay Info */}
            <div className="absolute top-4 left-4 z-[400] bg-black/70 backdrop-blur border border-white/10 p-2 rounded text-xs font-mono text-brand-cyan">
              <p>LAT: {position?.lat.toFixed(6) || '---'}</p>
              <p>LNG: {position?.lng.toFixed(6) || '---'}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 bg-black border-t border-brand-cyan/20 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono text-gray-400 mb-2">
                 <span>PERIMETER RADIUS</span>
                 <span className="text-brand-cyan">{radius}m</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="500" 
                value={radius} 
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan"
              />
            </div>

            <div className="flex gap-3">
               <button 
                  onClick={() => {
                     if (position) onConfirm(position.lat, position.lng, radius);
                  }}
                  disabled={!position}
                  className="flex-1 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan text-brand-cyan py-3 rounded uppercase font-bold tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                  <MapPin className="w-4 h-4" />
                  Encrypt & Lock
               </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
