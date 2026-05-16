"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAlarm } from "@/hooks/useAlarm";
import { useSettings } from "@/hooks/useSettings";
import { useSavedPlaces, SavedPlace } from "@/hooks/useSavedPlaces";
import { calculateDistance, formatDistance } from "@/lib/utils";
import { Navigation, MapPin, X, Bell, Loader2, Settings2, Play, Square, ArrowLeft, MoreVertical, Share2, LocateFixed, Zap, Star, Clock, ChevronUp, Map as MapIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RouteSearch } from "@/components/RouteSearch";
import { cn } from "@/lib/utils";

const Map = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-background animate-pulse flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
});

const RADIUS_OPTIONS = [200, 500, 1000, 2000];
const BD_CENTER: [number, number] = [23.8103, 90.4125];

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function TrackingContent() {
  const searchParams = useSearchParams();
  const { location, error, startTracking, stopTracking, isTracking } = useGeolocation();
  const { triggerAlarm, stopAlarm, requestNotificationPermission } = useAlarm();
  const { settings } = useSettings();
  const { savedPlaces, recentPlaces, addRecent, savePlace } = useSavedPlaces();
  
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [startName, setStartName] = useState<string | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [destinationName, setDestinationName] = useState<string | null>(null);
  const [alertRadius, setAlertRadius] = useState(500);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  
  const distance = useMemo(() => {
    const target = destination;
    const source = location ? [location.latitude, location.longitude] : null;
    if (source && target) {
      return calculateDistance(source[0], source[1], target[0], target[1]);
    }
    return null;
  }, [location, destination]);

  const [isNavMode, setIsNavMode] = useState(false);
  const [followUser, setFollowUser] = useState(true);
  const [sheetState, setSheetState] = useState<"compact" | "expanded">("compact");

  // Check for alarm
  useEffect(() => {
    if (distance !== null && distance <= alertRadius && !isAlarmActive && isTracking) {
      setIsAlarmActive(true);
      triggerAlarm(`Approaching stop: ${destinationName || "Destination"}`);
      
      // Haptic feedback if enabled
      if (settings.vibrate && "vibrate" in navigator) {
        navigator.vibrate([500, 300, 500, 300, 500]);
      }
    }
  }, [distance, alertRadius, isAlarmActive, triggerAlarm, isTracking, destinationName, settings.vibrate]);

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
    setSheetState("compact");
    
    // Add to recent history
    addRecent({
      name: destinationName || "Unknown Destination",
      address: "Recently visited",
      coords: destination,
      type: "other"
    });

    startTracking();
    await requestNotificationPermission().catch(console.error);
  };

  const selectPlace = (place: SavedPlace) => {
    setDestination(place.coords);
    setDestinationName(place.name);
    setFollowUser(false);
    setSheetState("compact");
  };

  // Load from URL params
  useEffect(() => {
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const name = searchParams.get("name");
    
    if (lat && lon && name) {
      setDestination([parseFloat(lat), parseFloat(lon)]);
      setDestinationName(name);
      setFollowUser(false);
      setSheetState("compact");
    }
  }, [searchParams]);

  // Auto-expand sheet when destination is picked
  useEffect(() => {
    if (destination && !isNavMode && sheetState === "compact") {
      const timer = setTimeout(() => setSheetState("expanded"), 0);
      return () => clearTimeout(timer);
    }
  }, [destination, isNavMode, sheetState]);

  const mapCenter: [number, number] = useMemo(() => {
    if (followUser && location) return [location.latitude, location.longitude];
    if (destination) return destination;
    return BD_CENTER;
  }, [location, destination, followUser]);

  return (
    <div className="relative h-[100dvh] w-full bg-background text-foreground overflow-hidden transition-colors duration-500">
      {/* Map Layer - Fixed Background */}
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
              setDestinationName(`Selected Location`);
              setFollowUser(false);
            }
          }}
        />
      </div>

      {/* Floating Header */}
      {!isNavMode && (
        <div className="absolute top-12 left-0 right-0 z-40 px-5 max-w-lg mx-auto pointer-events-none">
          <div className="pointer-events-auto">
            <RouteSearch 
              fromName={startName || (location ? "Current Location" : "")}
              toName={destinationName || ""}
              currentLocation={location ? [location.latitude, location.longitude] : null}
              onMyLocationClick={() => {
                setFollowUser(true);
                if (location) {
                  setStartName("Current Location");
                  setStartPoint([location.latitude, location.longitude]);
                }
              }}
              onSelectFrom={(lat, lng, name) => { setStartPoint([lat, lng]); setStartName(name); }}
              onSelectTo={(lat, lng, name) => { setDestination([lat, lng]); setDestinationName(name); setFollowUser(false); }}
            />
          </div>
        </div>
      )}

      {/* Navigation Overlay */}
      <AnimatePresence>
        {isNavMode && (
          <motion.div 
            initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}
            className="absolute top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-2xl p-6 pt-14 border-b border-primary/20 shadow-2xl"
          >
            <div className="flex items-center gap-4 max-w-lg mx-auto">
              <button onClick={() => { setIsNavMode(false); stopTracking(); }} className="p-3.5 bg-secondary rounded-2xl shadow-sm active-tap"><ArrowLeft size={24}/></button>
              <div className="flex-1">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Live Tracking</span>
                <p className="text-xl font-black truncate tracking-tighter">{destinationName}</p>
              </div>
              <div className="text-right shrink-0">
                {distance !== null ? (
                  <>
                    <span className="text-2xl font-black italic tracking-tighter text-primary">{formatDistance(distance)}</span>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Remaining</p>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="animate-spin" size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Locating...</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Control Buttons */}
      <div className="absolute right-5 bottom-[40dvh] z-30 flex flex-col gap-4">
        <button 
          onClick={() => setFollowUser(!followUser)}
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all border active-tap",
            followUser ? "bg-primary text-white border-primary shadow-primary/20" : "bg-card text-foreground border-primary/20"
          )}
        >
          <LocateFixed size={24} />
        </button>
      </div>

      {/* Native Mobile Draggable Bottom Sheet */}
      <motion.div 
        initial={{ y: "85%" }}
        animate={{ y: sheetState === "compact" ? "65%" : "15%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y < -50) setSheetState("expanded");
          else if (info.offset.y > 50) setSheetState("compact");
        }}
        className="absolute inset-0 z-50 pointer-events-none"
      >
        <div className="h-full bg-card/98 backdrop-blur-3xl border-t border-primary/20 rounded-t-[44px] shadow-[0_-25px_60px_rgba(0,0,0,0.2)] pointer-events-auto overflow-hidden flex flex-col">
          {/* Sheet Handle */}
          <div className="w-full py-4 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing shrink-0" onClick={() => setSheetState(sheetState === "compact" ? "expanded" : "compact")}>
            <div className="w-12 h-1.5 bg-muted rounded-full" />
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-2 italic">{sheetState === "compact" ? "Swipe for Details" : "Minimize"}</span>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-40 scrollbar-hide">
            {!isNavMode ? (
              <div className="space-y-10 pt-4 max-w-lg mx-auto">
                {/* Radius Selector */}
                <section>
                  <div className="flex justify-between items-center mb-6 px-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Alert Radius</h3>
                    <div className="px-3 py-1 bg-primary/10 rounded-lg"><span className="text-primary font-black text-xs italic tracking-widest">{formatDistance(alertRadius)}</span></div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {RADIUS_OPTIONS.map(r => (
                      <button 
                        key={r} onClick={() => setAlertRadius(r)}
                        className={cn(
                          "h-14 rounded-2xl text-[10px] font-black transition-all border-2 uppercase tracking-widest active-tap",
                          alertRadius === r ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-secondary/40 border-transparent text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        {formatDistance(r)}
                      </button>
                    ))}
                  </div>
                </section>

                <button 
                  onClick={handleStart} disabled={!destination}
                  className="w-full h-20 bg-primary disabled:opacity-10 rounded-[28px] flex items-center justify-center gap-5 text-2xl font-black text-white italic shadow-[0_20px_40px_rgba(37,99,235,0.3)] active:scale-95 transition-all uppercase tracking-tighter"
                >
                  <Play fill="white" size={28} /> Start Trip
                </button>

                {/* Quick Shortcuts */}
                <section>
                  <div className="flex justify-between items-center mb-6 px-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Quick Actions</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => {
                        const home = savedPlaces.find(p => p.type === "home");
                        if (home) selectPlace(home);
                        else alert("Set Home in Settings or long-press map to save!");
                      }}
                      className="flex items-center gap-4 p-6 bg-secondary/30 rounded-[32px] border border-primary/10 hover:bg-secondary transition-all shadow-sm active-tap"
                    >
                      <div className="w-12 h-12 bg-blue-500/10 rounded-[18px] flex items-center justify-center"><Star size={22} className="text-blue-500" fill="currentColor" fillOpacity={0.2} /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Home</span>
                    </button>
                    <button 
                      onClick={() => {
                        const office = savedPlaces.find(p => p.type === "office");
                        if (office) selectPlace(office);
                        else alert("Set Office in settings!");
                      }}
                      className="flex items-center gap-4 p-6 bg-secondary/30 rounded-[32px] border border-primary/10 hover:bg-secondary transition-all shadow-sm active-tap"
                    >
                      <div className="w-12 h-12 bg-purple-500/10 rounded-[18px] flex items-center justify-center"><Clock size={22} className="text-purple-500" /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Office</span>
                    </button>
                  </div>
                </section>

                {/* Recent History */}
                {recentPlaces.length > 0 && (
                  <section>
                    <div className="flex justify-between items-center mb-6 px-1">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Recent Trips</h3>
                    </div>
                    <div className="space-y-3">
                      {recentPlaces.map((place) => (
                        <button
                          key={place.id}
                          onClick={() => selectPlace(place)}
                          className="w-full flex items-center gap-4 p-5 bg-card border border-primary/10 rounded-[28px] hover:bg-secondary/30 transition-all active-tap"
                        >
                          <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                            <MapIcon size={18} />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-[11px] font-black uppercase tracking-widest truncate">{place.name}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Recently visited</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Info Card */}
                <div className="p-8 bg-foreground text-background rounded-[40px] flex gap-6 items-center overflow-hidden relative shadow-2xl">
                  <div className="w-14 h-14 bg-background/20 backdrop-blur-md rounded-2xl flex items-center justify-center relative z-10 shadow-inner"><Bell size={28}/></div>
                  <div className="relative z-10">
                    <p className="font-black italic uppercase leading-none text-lg tracking-tight">Smart Alert</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-2">Vibration and Sound enabled</p>
                  </div>
                  <Zap className="absolute -right-10 -bottom-10 w-40 h-40 text-background/5 -rotate-12" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 gap-12 max-w-lg mx-auto">
                <div className="relative">
                  <div className="w-32 h-32 bg-primary/10 rounded-[44px] flex items-center justify-center"><Navigation size={56} className="text-primary rotate-45" fill="currentColor" fillOpacity={0.2} /></div>
                  <div className="absolute inset-0 rounded-[44px] border-2 border-primary animate-ping opacity-20"></div>
                </div>
                <div className="text-center">
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 italic">Navigating To</p>
                   <p className="text-4xl font-black tracking-tighter leading-none mb-3">{destinationName}</p>
                   <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Radius: {formatDistance(alertRadius)}</p>
                </div>
                <button onClick={handleStopAlarm} className="w-28 h-28 bg-rose-500 rounded-[40px] flex items-center justify-center shadow-[0_20px_50px_rgba(244,63,94,0.3)] active:scale-90 transition-all border-4 border-white/20"><Square fill="white" size={40}/></button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Alarm Overlay */}
      <AnimatePresence>
        {isAlarmActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-rose-600 flex flex-col items-center justify-center p-10 text-center">
            <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 0.35 }} className="mb-14">
              <div className="w-40 h-40 bg-white rounded-[40px] flex items-center justify-center text-rose-600 shadow-2xl"><Bell size={80} fill="currentColor"/></div>
            </motion.div>
            <h1 className="text-8xl font-black text-white italic uppercase tracking-tighter mb-6 leading-none">Wake Up!</h1>
            <p className="text-3xl font-black text-white/90 mb-20 tracking-tight">{destinationName} is close!</p>
            <button onClick={handleStopAlarm} className="w-full max-w-sm h-32 bg-white text-rose-600 rounded-[48px] font-black text-5xl shadow-2xl active:scale-95 transition-all italic uppercase tracking-tighter">Arrived</button>
            <motion.div animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="absolute inset-0 bg-white/10 pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="absolute top-28 left-6 right-6 z-[60] bg-rose-500 text-white p-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center gap-4 shadow-2xl">
          <div className="w-3 h-3 rounded-full bg-white animate-ping shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <TrackingContent />
    </Suspense>
  );
}
