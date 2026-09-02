"use client";

import { useCallback, useRef } from "react";
import type { AppSettings } from "./useSettings";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export function useAlarm(settings: AppSettings) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const prepareAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audioRef.current.loop = true;
    }
    audioRef.current.volume = Math.max(0, Math.min(1, settings.volume / 100));
  }, [settings.volume]);

  const requestNotificationPermission = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      const permission = await LocalNotifications.requestPermissions();
      return permission.display === "granted";
    }
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }, []);

  const triggerAlarm = useCallback(async (message: string) => {
    // 1. Vibrate
    if (settings.vibrate && "vibrate" in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }

    // 2. Sound
    prepareAudio();
    const audio = audioRef.current;
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, settings.volume / 100));
      audio.playbackRate = settings.alarmSound === "soft_chime" ? 0.8 : settings.alarmSound === "extreme_buzz" ? 1.2 : settings.alarmSound === "radar" ? 1.35 : 1;
      audio.play().catch(e => console.error("Audio play failed:", e));
    }

    // 3. Notification
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [{
          id: 7001,
          title: "WakeMe Alarm",
          body: message,
          sound: "default",
          schedule: { at: new Date(Date.now() + 100) },
          extra: { type: "destination-alarm" },
        }],
      });
    } else if ("Notification" in window && Notification.permission === "granted") {
      new Notification("WakeMe Alarm", {
        body: message,
        icon: "/icons/icon-192x192.png",
        tag: "destination-alarm",
        requireInteraction: true
      });
    }

    // 4. Voice Alert
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance("Your stop is near. Wake up!");
      window.speechSynthesis.speak(utterance);
    }
  }, [prepareAudio, settings.alarmSound, settings.volume, settings.vibrate]);

  const stopAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }
    if (Capacitor.isNativePlatform()) {
      void LocalNotifications.cancel({ notifications: [{ id: 7001 }] });
    }
  }, []);

  return { triggerAlarm, stopAlarm, prepareAudio, requestNotificationPermission };
}
