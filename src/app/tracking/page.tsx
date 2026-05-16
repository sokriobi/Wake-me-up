"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAlarm } from "@/hooks/useAlarm";
import { calculateDistance, formatDistance } from "@/lib/utils";
import { Navigation, MapPin, X, Bell, Loader2, Settings2, Play, Square, ArrowLeft, MoreVertical, Share2, LocateFixed, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RouteSearch } from "@/components/RouteSearch";
import { cn } from "@/lib/utils";

const Map = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-background animate-pulse flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
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
    <div className="relative h-[100dvh] w-full bg-background text-foreground overflow-hidden font-sans transition-colors duration-500">
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
            className="absolute top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl p-6 pt-14 shadow-2xl border-b border-border"
          >
            <div className="flex items-center gap-5 max-w-lg mx-auto">
              <button 
                onClick={() => {
                  setIsNavMode(false);
                  stopTracking();
                }} 
                className="p-3.5 bg-secondary hover:bg-border rounded-2xl transition-all shadow-sm"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                  <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Navigating Live</h2>
                </div>
                <p className="text-xl font-black truncate tracking-tight">{destinationName}</p>
              </div>
              <button className="p-3.5 bg-secondary hover:bg-border rounded-2xl transition-all shadow-sm">
                <Share2 size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay (Hidden in Nav Mode) */}
      {!isNavMode && (
        <div className="absolute top-14 left-0 right-0 z-40 px-5 max-w-lg mx-auto">
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
          className="absolute top-44 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="bg-primary px-8 py-3 rounded-[24px] shadow-[0_20px_40px_rgba(37,99,235,0.3)] border border-white/10 flex items-center gap-4">
             <Navigation size={20} fill="white" className="rotate-45 text-white" />
             <div className="flex flex-col items-start">
               <span className="text-2xl font-black tracking-tighter leading-none text-white italic">{formatDistance(distance)}</span>
               <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.2em] mt-1">Remaining</span>
             </div>
          </div>
        </motion.div>
      )}

      {/* Floating Action Buttons */}
      <div className="absolute right-5 bottom-52 z-40 flex flex-col gap-4">
        <button 
          onClick={() => setFollowUser(!followUser)}
          className={cn(
            "w-16 h-16 rounded-[22px] flex items-center justify-center shadow-2xl transition-all active:scale-90 border",
            followUser 
              ? "bg-primary text-white border-primary shadow-primary/20" 
              : "bg-background text-foreground border-border"
          )}
        >
          <LocateFixed size={28} />
        </button>
      </div>

      {/* Bottom Control Sheet */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 z-40 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
        isNavMode ? "p-0" : "p-5 pb-14"
      )}>
        <div className={cn(
          "bg-card/95 backdrop-blur-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.15)] border-t border-border max-w-lg mx-auto",
          isNavMode ? "rounded-t-[50px] p-10 pb-16" : "rounded-[44px] p-8 border-x"
        )}>
          {!isNavMode ? (
            <div className="space-y-10">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                    Wake-up Radius
                  </h2>
                  <div className="px-3 py-1 bg-primary/10 rounded-lg">
                    <span className="text-primary font-black text-xs italic tracking-widest uppercase">
                      Active: {formatDistance(alertRadius)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setAlertRadius(r)}
                      className={cn(
                        "flex-1 h-14 rounded-2xl text-[10px] font-black transition-all border-2 tracking-widest uppercase",
                        alertRadius === r 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary"
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
                className="w-full h-20 bg-primary disabled:opacity-10 disabled:grayscale rounded-[32px] flex items-center justify-center gap-5 font-black text-2xl shadow-[0_20px_40px_rgba(37,99,235,0.3)] active:scale-95 transition-all text-white italic group uppercase tracking-tight"
              >
                <Play fill="white" size={28} className="group-hover:translate-x-1 transition-transform" />
                Start Journey
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-8">
               <div className="flex-1 min-w-0">
                 <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mb-2 italic">Target Station</p>
                 <p className="text-3xl font-black truncate leading-none tracking-tighter">{destinationName}</p>
                 <div className="flex items-center gap-3 mt-4">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Bell size={16} className="text-primary" fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <span className="text-xs font-black text-primary uppercase tracking-widest">Alarm set at {formatDistance(alertRadius)}</span>
                 </div>
               </div>
               <button
                onClick={handleStopAlarm}
                className="w-24 h-24 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-[32px] flex items-center justify-center transition-all active:scale-90 border-2 border-rose-500/10 shadow-lg shadow-rose-500/5"
              >
                <Square fill="currentColor" size={32} />
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
            className="fixed inset-0 z-[100] bg-rose-600 flex flex-col items-center justify-center p-10 text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.4, 1],
                rotate: [0, 20, -20, 0]
              }}
              transition={{ repeat: Infinity, duration: 0.35 }}
              className="mb-14"
            >
              <div className="w-40 h-40 bg-white rounded-[40px] flex items-center justify-center text-rose-600 shadow-2xl">
                <Bell size={80} fill="currentColor" />
              </div>
            </motion.div>
            <h1 className="text-8xl font-black mb-6 uppercase italic tracking-tighter leading-none text-white">
              WAKE<br/>UP!
            </h1>
            <p className="text-3xl font-black mb-20 text-white/90 tracking-tight">
              {destinationName} is here!
            </p>
            <button
              onClick={handleStopAlarm}
              className="w-full max-w-sm h-32 bg-white text-rose-600 rounded-[48px] font-black text-5xl shadow-2xl active:scale-95 transition-transform uppercase italic tracking-tighter"
            >
              Arrived
            </button>
            
            <motion.div 
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute inset-0 bg-white/10 pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="absolute top-28 left-6 right-6 z-[60] bg-rose-500 text-white p-5 rounded-[24px] text-xs font-black uppercase tracking-widest flex items-center gap-4 shadow-2xl">
          <div className="w-3 h-3 rounded-full bg-white animate-ping shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}


