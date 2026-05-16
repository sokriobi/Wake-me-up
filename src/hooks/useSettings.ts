"use client";

import { useState, useEffect } from "react";

export interface AppSettings {
  alarmSound: string;
  volume: number;
  vibrate: boolean;
  theme: "light" | "dark" | "system";
}

const DEFAULT_SETTINGS: AppSettings = {
  alarmSound: "transit_alert",
  volume: 80,
  vibrate: true,
  theme: "system",
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem("app_settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const updateSettings = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem("app_settings", JSON.stringify(newSettings));
  };

  return { settings, updateSettings };
}
