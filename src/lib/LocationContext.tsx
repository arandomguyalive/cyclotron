"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface GeoLocation {
  ip: string;
  city: string;
  region: string; // State/Province
  region_code: string;
  country: string;
  country_name: string;
  postal: string; // Zip
  latitude: number;
  longitude: number;
  org: string; // ISP
}

interface LocationContextType {
  location: GeoLocation | null;
  loading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check session storage first
      const cached = sessionStorage.getItem("abhed_geo_location");
      if (cached) {
        setLocation(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) {
        throw new Error("Failed to acquire location signal");
      }
      const data = await response.json();
      
      // Basic validation
      if (data.error) {
        throw new Error(data.reason || "Location signal jammed");
      }

      const geoData: GeoLocation = {
        ip: data.ip,
        city: data.city,
        region: data.region,
        region_code: data.region_code,
        country: data.country_code, // ipapi returns 'country_code' as 2-letter, 'country_name' as full
        country_name: data.country_name,
        postal: data.postal,
        latitude: data.latitude,
        longitude: data.longitude,
        org: data.org,
      };

      sessionStorage.setItem("abhed_geo_location", JSON.stringify(geoData));
      setLocation(geoData);
    } catch (err: any) {
      console.error("Location Context Error:", err);
      setError(err.message || "Signal lost");
      // Fallback or empty state is handled by consumer
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ location, loading, error, refreshLocation: fetchLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
