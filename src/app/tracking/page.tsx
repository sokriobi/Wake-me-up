"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAlarm } from "@/hooks/useAlarm";
import { calculateDistance, formatDistance } from "@/lib/utils";
import { Navigation, MapPin, X, Bell, Loader2, Settings2, Play, Square, ArrowLeft, MoreVertical, Share2, LocateFixed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RouteSearch } from "@/components/RouteSearch";
import { cn } from "@/lib/utils";

const Map = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#1a1a1a] animate-pulse flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
});

const RADIUS_OPTIONS = [200, 500, 1000, 2000];
const BD_CENTER: [number, number] = [23.8103, 90.4125];

export default function TrackingPage() {
  const { location, error, startTracking, stopTracking, isTracking } = useGeolocation();
  const { triggerAlarm, stopAlarm, requestNotificationPermission } = useAlarm();
  
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [startName, setStartName] = useState<string | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [destinationName, setDestinationName] = useState<string | null>(null);
  const [alertRadius, setAlertRadius] = useState(500);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [isNavMode, setIsNavMode] = useState(false);
  const [followUser, setFollowUser] = useState(true);

  // Sync distance and check for alarm
  useEffect(() => {
    const target = destination;
    const source = location ? [location.latitude, location.longitude] : null;

    if (source && target) {
      const d = calculateDistance(source[0], source[1], target[0], target[1]);
      setDistance(d);

      if (d <= alertRadius && !isAlarmActive && isTracking) {
        setIsAlarmActive(true);
        triggerAlarm(`You are approaching ${destinationName || "your stop"}!`);
      }
    }
  }, [location, destination, alertRadius, isAlarmActive, triggerAlarm, isTracking, destinationName]);

  const handleStopAlarm = () => {
    setIsAlarmActive(false);
    stopAlarm();
    stopTracking();
    setIsNavMode(false);
    setFollowUser(false);
  };

  const handleStart = async () => {
    if (!destination) return;
    
    setIsNavMode(true);
    setFollowUser(true);
    
    // Save to history
    try {
      const recent = JSON.parse(localStorage.getItem("recent_destinations") || "[]");
      const newDest = {
        id: Date.now(),
        name: destinationName || "Point on Map",
        address: "Selected Destination",
        coords: destination
      };
      localStorage.setItem("recent_destinations", JSON.stringify([newDest, ...recent].slice(0, 5)));
    } catch (e) {
      console.error("Failed to save history", e);
    }

    startTracking();
    await requestNotificationPermission().catch(console.error);
  };

  const mapCenter: [number, number] = useMemo(() => {
    if (followUser && location) return [location.latitude, location.longitude];
    if (destination) return destination;
    if (startPoint) return startPoint;
    return BD_CENTER;
  }, [location, destination, startPoint, followUser]);

  return (
    <div className="relative h-[100dvh] w-full bg-[#1a1a1a] text-white overflow-hidden font-sans">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <Map 
          center={mapCenter}
          userLocation={location ? [location.latitude, location.longitude] : null}
          startPoint={startPoint}
          destination={destination}
          radius={alertRadius}
          followUser={followUser}
          onSelectDestination={(lat, lng) => {
            if (!isNavMode) {
              setDestination([lat, lng]);
              setDestinationName(`Point on map`);
              setFollowUser(false);
            }
          }}
        />
      </div>

      {/* Navigation Mode Header */}
      <AnimatePresence>
        {isNavMode && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="absolute top-0 left-0 right-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-md p-4 pt-12 shadow-xl border-b border-white/5"
          >
            <div className="flex items-center gap-4 max-w-lg mx-auto">
              <button 
                onClick={() => {
                  setIsNavMode(false);
                  stopTracking();
                }} 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <h2 className="text-sm font-bold text-green-500 uppercase tracking-wider">Live Tracking</h2>
                </div>
                <p className="text-lg font-bold truncate">{destinationName}</p>
              </div>
              <button className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay (Hidden in Nav Mode) */}
      {!isNavMode && (
        <div className="absolute top-12 left-0 right-0 z-40 px-4 max-w-lg mx-auto">
          <RouteSearch 
            fromName={startName || (location ? "Current Location" : "")}
            toName={destinationName || ""}
            currentLocation={location ? [location.latitude, location.longitude] : null}
            onMyLocationClick={() => {
              setFollowUser(true);
              if (!isTracking) {
                requestNotificationPermission().then(() => startTracking());
              }
            }}
            onSelectFrom={(lat, lng, name) => {
              setStartPoint(lat === 0 ? null : [lat, lng]);
              setStartName(name);
            }}
            onSelectTo={(lat, lng, name) => {
              setDestination(lat === 0 ? null : [lat, lng]);
              setDestinationName(name);
              setFollowUser(false);
            }}
          />
        </div>
      )}

      {/* Distance Bubble (Floating) */}
      {isNavMode && distance !== null && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-36 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="bg-blue-600 px-6 py-2 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/30 flex items-center gap-3">
             <Navigation size={18} fill="white" className="rotate-45" />
             <span className="text-xl font-black tracking-tight">{formatDistance(distance)}</span>
             <span className="text-[10px] font-black opacity-70 uppercase tracking-widest">Remaining</span>
          </div>
        </motion.div>
      )}

      {/* Floating Action Buttons */}
      <div className="absolute right-4 bottom-48 z-40 flex flex-col gap-3">
        <button 
          onClick={() => setFollowUser(!followUser)}
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-90",
            followUser ? "bg-blue-600 text-white" : "bg-[#242424] text-gray-400 border border-white/5"
          )}
        >
          <LocateFixed size={24} />
        </button>
      </div>

      {/* Bottom Control Sheet */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
        isNavMode ? "p-0" : "p-4 pb-12"
      )}>
        <div className={cn(
          "bg-[#1a1a1a]/95 backdrop-blur-xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/10 max-w-lg mx-auto",
          isNavMode ? "rounded-t-[40px] p-8 pb-12" : "rounded-[40px] p-6 border-x"
        )}>
          {!isNavMode ? (
            <div className="space-y-8">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
                    Wake-up Radius
                  </h2>
                  <span className="text-blue-500 font-bold bg-blue-500/10 px-3 py-1 rounded-lg">
                    {formatDistance(alertRadius)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setAlertRadius(r)}
                      className={cn(
                        "flex-1 h-14 rounded-2xl text-sm font-black transition-all border",
                        alertRadius === r 
                          ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20" 
                          : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                      )}
                    >
                      {formatDistance(r)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={!destination}
                className="w-full h-20 bg-blue-600 disabled:opacity-20 disabled:grayscale rounded-[28px] flex items-center justify-center gap-4 font-black text-2xl shadow-[0_15px_30px_rgba(37,99,235,0.3)] active:scale-95 transition-all group"
              >
                <Play fill="currentColor" size={24} className="group-hover:translate-x-1 transition-transform" />
                START TRIP
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-6">
               <div className="flex-1 min-w-0">
                 <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-1">Target Stop</p>
                 <p className="text-2xl font-black truncate leading-tight">{destinationName}</p>
                 <div className="flex items-center gap-2 mt-2">
                    <Bell size={14} className="text-blue-500" />
                    <span className="text-xs font-bold text-blue-500">Alarm at {formatDistance(alertRadius)}</span>
                 </div>
               </div>
               <button
                onClick={handleStopAlarm}
                className="w-20 h-20 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-3xl flex items-center justify-center transition-all active:scale-90 border border-red-500/20"
              >
                <Square fill="currentColor" size={28} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Extreme Alarm Overlay */}
      <AnimatePresence>
        {isAlarmActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 15, -15, 0]
              }}
              transition={{ repeat: Infinity, duration: 0.4 }}
              className="mb-12"
            >
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-red-600 shadow-2xl">
                <Bell size={64} fill="currentColor" />
              </div>
            </motion.div>
            <h1 className="text-7xl font-black mb-4 uppercase italic tracking-tighter leading-none">
              WAKE<br/>UP!
            </h1>
            <p className="text-2xl font-bold mb-16 text-white/90">
              You are {formatDistance(distance || alertRadius)} from {destinationName}
            </p>
            <button
              onClick={handleStopAlarm}
              className="w-full max-w-sm h-28 bg-white text-red-600 rounded-[40px] font-black text-4xl shadow-2xl active:scale-95 transition-transform"
            >
              ARRIVED
            </button>
            
            <motion.div 
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="absolute inset-0 bg-white/10 pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="absolute top-24 left-4 right-4 z-[60] bg-red-500/90 backdrop-blur-md text-white p-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-2xl">
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          {error}
        </div>
      )}
    </div>
  );
}

