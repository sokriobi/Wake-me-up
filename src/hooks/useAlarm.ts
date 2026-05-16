"use client";

import { useCallback, useRef } from "react";

export function useAlarm() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }, []);

  const triggerAlarm = useCallback(async (message: string) => {
    // 1. Vibrate
    if ("vibrate" in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }

    // 2. Sound
    if (!audioRef.current) {
      audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audioRef.current.loop = true;
    }
    audioRef.current.play().catch(e => console.error("Audio play failed:", e));

    // 3. Notification
    if ("Notification" in window && Notification.permission === "granted") {
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
  }, []);

  const stopAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }
  }, []);

  return { triggerAlarm, stopAlarm, requestNotificationPermission };
}
