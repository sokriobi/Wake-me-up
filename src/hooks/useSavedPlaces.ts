"use client";

import { useState, useEffect } from "react";

export interface SavedPlace {
  id: string;
  name: string;
  address: string;
  coords: [number, number];
  type: "home" | "office" | "other";
}

export function useSavedPlaces() {
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [recentPlaces, setRecentPlaces] = useState<SavedPlace[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("saved_places");
    const recent = localStorage.getItem("recent_places");
    if (saved) setSavedPlaces(JSON.parse(saved));
    if (recent) setRecentPlaces(JSON.parse(recent));
  }, []);

  const savePlace = (place: Omit<SavedPlace, "id">) => {
    const newPlace = { ...place, id: Date.now().toString() };
    const updated = [...savedPlaces, newPlace];
    setSavedPlaces(updated);
    localStorage.setItem("saved_places", JSON.stringify(updated));
  };

  const addRecent = (place: Omit<SavedPlace, "id">) => {
    const newPlace = { ...place, id: Date.now().toString() };
    const filtered = recentPlaces.filter(p => p.name !== place.name).slice(0, 4);
    const updated = [newPlace, ...filtered];
    setRecentPlaces(updated);
    localStorage.setItem("recent_places", JSON.stringify(updated));
  };

  const removeSaved = (id: string) => {
    const updated = savedPlaces.filter(p => p.id !== id);
    setSavedPlaces(updated);
    localStorage.setItem("saved_places", JSON.stringify(updated));
  };

  return { savedPlaces, recentPlaces, savePlace, addRecent, removeSaved };
}
