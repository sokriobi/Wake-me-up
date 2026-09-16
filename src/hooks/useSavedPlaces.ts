"use client";

import { useState, useEffect, useCallback } from "react";

export interface SavedPlace {
  id: string;
  name: string;
  address: string;
  coords: [number, number];
  type: "home" | "office" | "custom" | "other";
  icon?: string;
}

const DEFAULT_PLACES: SavedPlace[] = [
  {
    id: "default-home",
    name: "Home",
    address: "Tap to set your home address",
    coords: [23.8103, 90.4125],
    type: "home"
  },
  {
    id: "default-office",
    name: "Office",
    address: "Tap to set your workplace",
    coords: [23.7925, 90.4078],
    type: "office"
  }
];

export function useSavedPlaces() {
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("saved_places");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_PLACES;
        }
      }
      return DEFAULT_PLACES;
    }
    return DEFAULT_PLACES;
  });

  const [recentPlaces, setRecentPlaces] = useState<SavedPlace[]>(() => {
    if (typeof window !== "undefined") {
      const recent = localStorage.getItem("recent_places");
      if (recent) {
        try {
          return JSON.parse(recent);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  // Sync savedPlaces state to localStorage
  const persistSaved = (places: SavedPlace[]) => {
    setSavedPlaces(places);
    if (typeof window !== "undefined") {
      localStorage.setItem("saved_places", JSON.stringify(places));
    }
  };

  // Add or update a fixed location (Home, Office, or Custom)
  const savePlace = useCallback((place: Omit<SavedPlace, "id"> & { id?: string }) => {
    setSavedPlaces(prev => {
      // If it's home or office, update existing or create
      if (place.type === "home" || place.type === "office") {
        const existingIdx = prev.findIndex(p => p.type === place.type || p.id === `default-${place.type}`);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            ...place,
            id: updated[existingIdx].id
          };
          if (typeof window !== "undefined") localStorage.setItem("saved_places", JSON.stringify(updated));
          return updated;
        }
      }

      const id = place.id || `place-${Date.now()}`;
      const newPlace: SavedPlace = {
        id,
        name: place.name,
        address: place.address,
        coords: place.coords,
        type: place.type,
        icon: place.icon
      };
      const updated = [newPlace, ...prev.filter(p => p.id !== id)];
      if (typeof window !== "undefined") localStorage.setItem("saved_places", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Remove a saved/fixed location
  const removeSaved = useCallback((id: string) => {
    setSavedPlaces(prev => {
      const updated = prev.filter(p => p.id !== id);
      if (typeof window !== "undefined") localStorage.setItem("saved_places", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Add to recent searches
  const addRecent = useCallback((place: Omit<SavedPlace, "id">) => {
    setRecentPlaces(prev => {
      const newPlace = { ...place, id: `recent-${Date.now()}` };
      const filtered = prev.filter(p => p.name.toLowerCase() !== place.name.toLowerCase()).slice(0, 6);
      const updated = [newPlace, ...filtered];
      if (typeof window !== "undefined") localStorage.setItem("recent_places", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Remove single recent item
  const removeRecent = useCallback((id: string) => {
    setRecentPlaces(prev => {
      const updated = prev.filter(p => p.id !== id);
      if (typeof window !== "undefined") localStorage.setItem("recent_places", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear all recents
  const clearRecents = useCallback(() => {
    setRecentPlaces([]);
    if (typeof window !== "undefined") localStorage.removeItem("recent_places");
  }, []);

  const homePlace = savedPlaces.find(p => p.type === "home" && p.address !== "Tap to set your home address");
  const officePlace = savedPlaces.find(p => p.type === "office" && p.address !== "Tap to set your workplace");
  const customPlaces = savedPlaces.filter(p => p.type === "custom" || p.type === "other");

  return { 
    savedPlaces, 
    recentPlaces, 
    homePlace,
    officePlace,
    customPlaces,
    savePlace, 
    removeSaved, 
    addRecent, 
    removeRecent,
    clearRecents 
  };
}
