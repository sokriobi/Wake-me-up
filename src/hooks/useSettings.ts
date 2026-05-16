"use client";

import { useState } from "react";

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
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_settings");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse settings", e);
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem("app_settings", JSON.stringify(newSettings));
  };

  return { settings, updateSettings };
}
