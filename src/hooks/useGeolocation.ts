"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading?: number | null;
  speed?: number | null;
}

export function useGeolocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionState | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);

  const watchId = useRef<number | null>(null);
  const nativeWatchId = useRef<string | null>(null);
  const simulationTimer = useRef<NodeJS.Timeout | null>(null);

  const stopSimulation = useCallback(() => {
    if (simulationTimer.current) {
      clearInterval(simulationTimer.current);
      simulationTimer.current = null;
    }
    setIsSimulating(false);
  }, []);

  const stopTracking = useCallback(() => {
    stopSimulation();
    if (typeof window === "undefined") return;
    if (watchId.current !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (nativeWatchId.current !== null) {
      void Geolocation.clearWatch({ id: nativeWatchId.current }).catch(() => {});
      nativeWatchId.current = null;
    }
    setIsTracking(false);
  }, [stopSimulation]);

  const startTracking = useCallback((): Promise<Location | null> => {
    if (typeof window === "undefined") return Promise.resolve(null);
    stopTracking();
    setIsTracking(true);
    setError(null);

    return new Promise<Location | null>(async (resolve) => {
      let resolved = false;

      const handleSuccess = (coords: { latitude: number; longitude: number; accuracy: number; heading?: number | null; speed?: number | null }) => {
        const loc: Location = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          heading: coords.heading || null,
          speed: coords.speed || null,
        };
        setLocation(loc);
        setError(null);
        if (!resolved) {
          resolved = true;
          resolve(loc);
        }
      };

      const handleError = (msg: string) => {
        setError(msg);
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      };

      if (Capacitor.isNativePlatform()) {
        try {
          const perm = await Geolocation.requestPermissions();
          if (perm.location === "denied") {
            handleError("Location permission is required to track your transit.");
            setIsTracking(false);
            return;
          }
          nativeWatchId.current = await Geolocation.watchPosition(
            { enableHighAccuracy: true, maximumAge: 3000 },
            (position, err) => {
              if (err) {
                handleError(err.message || "Location tracking error");
              } else if (position) {
                handleSuccess(position.coords);
              }
            }
          );
        } catch (e) {
          handleError(e instanceof Error ? e.message : "Unable to access native GPS.");
          setIsTracking(false);
        }
      } else {
        try {
          watchId.current = navigator.geolocation.watchPosition(
            (pos) => handleSuccess(pos.coords),
            (err) => {
              if (err.code === err.TIMEOUT) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => handleSuccess(pos.coords),
                  (e) => handleError(e.message),
                  { enableHighAccuracy: false, timeout: 10000 }
                );
              } else if (err.code === err.PERMISSION_DENIED) {
                handleError("Please allow location access in your browser settings.");
                setIsTracking(false);
              } else {
                handleError(err.message);
              }
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 2000 }
          );
        } catch (err) {
          handleError(err instanceof Error ? err.message : "Failed to start GPS tracking.");
          setIsTracking(false);
        }
      }
    });
  }, [stopTracking]);

  // High-fidelity trip simulation along a route
  const startSimulation = useCallback((
    startCoords: [number, number],
    destCoords: [number, number],
    speedMultiplier: number = 1
  ) => {
    stopTracking();
    setIsSimulating(true);
    setIsTracking(true);
    setSimulationProgress(0);

    const totalSteps = 60; // 60 smooth interpolated steps
    let currentStep = 0;
    const intervalMs = Math.max(100, Math.floor(600 / speedMultiplier));

    // Set initial location
    setLocation({
      latitude: startCoords[0],
      longitude: startCoords[1],
      accuracy: 5,
      speed: 12 * speedMultiplier,
    });

    if (simulationTimer.current) clearInterval(simulationTimer.current);

    simulationTimer.current = setInterval(() => {
      currentStep++;
      const fraction = Math.min(1, currentStep / totalSteps);
      setSimulationProgress(Math.round(fraction * 100));

      // Ease out or linear interpolation
      const lat = startCoords[0] + (destCoords[0] - startCoords[0]) * fraction;
      const lon = startCoords[1] + (destCoords[1] - startCoords[1]) * fraction;

      setLocation({
        latitude: lat,
        longitude: lon,
        accuracy: 5,
        speed: fraction < 1 ? 12 * speedMultiplier : 0,
      });

      if (fraction >= 1) {
        if (simulationTimer.current) {
          clearInterval(simulationTimer.current);
          simulationTimer.current = null;
        }
      }
    }, intervalMs);
  }, [stopTracking]);

  const setManualLocation = useCallback((lat: number, lon: number) => {
    setLocation({
      latitude: lat,
      longitude: lon,
      accuracy: 5
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "permissions" in navigator) {
      navigator.permissions.query({ name: "geolocation" as PermissionName }).then((result) => {
        setPermission(result.state);
        result.onchange = () => setPermission(result.state);
      }).catch(() => {});
    }

    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return { 
    location, 
    error, 
    permission, 
    isTracking, 
    isSimulating,
    simulationProgress,
    startTracking, 
    stopTracking, 
    startSimulation, 
    stopSimulation,
    setManualLocation 
  };
}
