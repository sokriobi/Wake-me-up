"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionState | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchId = useRef<number | null>(null);
  const nativeWatchId = useRef<string | null>(null);

  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      setIsTracking(false);
    }
    if (nativeWatchId.current !== null) {
      void Geolocation.clearWatch({ id: nativeWatchId.current });
      nativeWatchId.current = null;
      setIsTracking(false);
    }
  }, []);

  const startTracking = useCallback((): Promise<Location | null> => {
    if (!Capacitor.isNativePlatform() && !navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return Promise.resolve(null);
    }

    // Clear any existing watch
    stopTracking();

    setIsTracking(true);
    return new Promise<Location | null>(async (resolve) => {
      let firstUpdate = true;
      const onSuccess = (position: { coords: { latitude: number; longitude: number; accuracy: number } }) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setError(null);
          if (firstUpdate) {
            firstUpdate = false;
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
          }
      };
      const onError = (err: { message: string }) => {
          setError(err.message);
          setIsTracking(false);
          if (firstUpdate) {
            firstUpdate = false;
            resolve(null);
          }
      };

      if (Capacitor.isNativePlatform()) {
        try {
          const permissions = await Geolocation.requestPermissions();
          if (permissions.location === "denied") {
            onError({ message: "Location permission is required to track your trip." });
            return;
          }
          nativeWatchId.current = await Geolocation.watchPosition(
            { enableHighAccuracy: true, maximumAge: 0 },
            (position, error) => {
              if (error) onError({ message: error.message });
              else if (position) onSuccess(position);
            }
          );
        } catch (error) {
          onError({ message: error instanceof Error ? error.message : "Unable to access location." });
        }
      } else {
        watchId.current = navigator.geolocation.watchPosition(
          onSuccess,
          onError,
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      }
    });
  }, [stopTracking]);

  useEffect(() => {
    if (typeof window !== "undefined" && "permissions" in navigator) {
      navigator.permissions.query({ name: "geolocation" as PermissionName }).then((result) => {
        setPermission(result.state);
        result.onchange = () => setPermission(result.state);
      }).catch(e => console.error("Permission query failed", e));
    }

    return () => stopTracking();
  }, [stopTracking]);

  return { location, error, permission, startTracking, stopTracking, isTracking };
}

