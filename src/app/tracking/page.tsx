"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAlarm } from "@/hooks/useAlarm";
import { useSettings } from "@/hooks/useSettings";
import { useSavedPlaces, SavedPlace } from "@/hooks/useSavedPlaces";
import { calculateDistance, formatDistance } from "@/lib/utils";
import { 
  Navigation, 
  MapPin, 
  Bell, 
  Loader2, 
  Play, 
  Square, 
  ArrowLeft, 
  LocateFixed, 
  Zap, 
  Star, 
  Clock, 
  Map as MapIcon, 
  Home as HomeIcon, 
  Briefcase, 
  Trash2,
  FastForward,
  Sparkles,
  Volume2,
  Moon,
  Sun,
  Bus,
  Train,
  Car,
  Compass,
  Gauge
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RouteSearch } from "@/components/RouteSearch";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const Map = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-background animate-pulse flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>
});

const RADIUS_OPTIONS = [150, 200, 500, 1000, 2000];
const BD_CENTER: [number, number] = [23.8685, 90.3995];

// Instant One-Click Popular Bangladesh Routes
const POPULAR_ROUTES = [
  {
    id: "route-azampur-abdullahpur",
    title: "Azampur ➔ Abdullahpur",
    desc: "Uttara Highway Bus Route",
    fromName: "Azampur Bus Stand (Uttara)",
    fromCoords: [23.8685, 90.3995] as [number, number],
    toName: "Abdullahpur Bus Stand",
    toCoords: [23.8826, 90.3986] as [number, number],
    radius: 200,
  },
  {
    id: "route-uttara-motijheel",
    title: "Uttara North ➔ Motijheel",
    desc: "Dhaka Metro MRT Line 6",
    fromName: "Uttara North Metro Station",
    fromCoords: [23.8821, 90.3705] as [number, number],
    toName: "Motijheel Metro Station",
    toCoords: [23.7291, 90.4180] as [number, number],
    radius: 200,
  },
  {
    id: "route-dhanmondi-gulshan",
    title: "Dhanmondi 32 ➔ Gulshan 1",
    desc: "Central City Express",
    fromName: "Dhanmondi 32 Bus Stand",
    fromCoords: [23.7512, 90.3780] as [number, number],
    toName: "Gulshan 1 Circle",
    toCoords: [23.7788, 90.4168] as [number, number],
    radius: 300,
  }
];

type TransitMode = "bus" | "metro" | "train" | "car";

function TrackingContent() {
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const { 
    location, 
    error, 
    startTracking, 
    stopTracking, 
    isTracking, 
    isSimulating,
    simulationProgress,
    startSimulation, 
    stopSimulation 
  } = useGeolocation();
  
  const { triggerAlarm, stopAlarm, prepareAudio, playPreAlertChime, requestNotificationPermission } = useAlarm(settings);
  const { savedPlaces, recentPlaces, addRecent, savePlace, removeSaved } = useSavedPlaces();
  
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
  const [startName, setStartName] = useState<string | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [destinationName, setDestinationName] = useState<string | null>(null);
  const [alertRadius, setAlertRadius] = useState(200);
  const [transitMode, setTransitMode] = useState<TransitMode>("bus");
  
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [preAlertFired, setPreAlertFired] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(3);
  const [napMode, setNapMode] = useState(false);
  
  const [isNavMode, setIsNavMode] = useState(false);
  const [followUser, setFollowUser] = useState(true);
  const [sheetState, setSheetState] = useState<"compact" | "expanded">("compact");

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Screen WakeLock management during journey
  useEffect(() => {
    if (isNavMode && "wakeLock" in navigator) {
      navigator.wakeLock.request("screen").then(lock => {
        wakeLockRef.current = lock;
      }).catch(() => {});
    } else if (!isNavMode && wakeLockRef.current) {
      void wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
    return () => {
      if (wakeLockRef.current) {
        void wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [isNavMode]);

  // Auto-acquire current GPS on initial load for Pick-up point if not set
  useEffect(() => {
    let active = true;
    startTracking().then(loc => {
      if (active && loc && !startPoint) {
        setStartPoint([loc.latitude, loc.longitude]);
        setStartName("Current Location");
      }
    }).catch(() => {});
    return () => { active = false; };
  }, [startTracking]);

  // Distance calculation
  const distance = useMemo(() => {
    const target = destination;
    const source = location ? [location.latitude, location.longitude] : null;
    if (source && target) {
      return calculateDistance(source[0], source[1], target[0], target[1]);
    }
    return null;
  }, [location, destination]);

  // Live speed in km/h
  const liveSpeedKmh = useMemo(() => {
    if (!location?.speed) {
      return transitMode === "metro" ? 45 : transitMode === "train" ? 60 : 30;
    }
    return Math.round(location.speed * 3.6);
  }, [location?.speed, transitMode]);

  // ETA Calculation
  const etaMinutes = useMemo(() => {
    if (distance === null) return null;
    const speedMps = (location?.speed && location.speed > 0) ? location.speed : (liveSpeedKmh / 3.6);
    const seconds = distance / Math.max(1, speedMps);
    return Math.max(1, Math.round(seconds / 60));
  }, [distance, location?.speed, liveSpeedKmh]);

  // Two-Stage Alert System:
  // 1. Stage 1: Gentle Pre-Alert Chime at 1000m
  useEffect(() => {
    if (distance !== null && distance <= 1000 && distance > alertRadius && !preAlertFired && isTracking) {
      setPreAlertFired(true);
      playPreAlertChime();
    }
  }, [distance, alertRadius, preAlertFired, isTracking, playPreAlertChime]);

  // 2. Stage 2: Full Wake Up Alarm at <= alertRadius
  useEffect(() => {
    if (distance !== null && distance <= alertRadius && !isAlarmActive && isTracking) {
      const timer = setTimeout(() => {
        setIsAlarmActive(true);
        setNapMode(false); // Wake up from nap screen immediately
        triggerAlarm(`Approaching stop: ${destinationName || "Destination"} (${formatDistance(distance)} left)`);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [distance, alertRadius, isAlarmActive, triggerAlarm, isTracking, destinationName, settings.vibrate]);

  const handleStopAlarm = () => {
    setIsAlarmActive(false);
    setPreAlertFired(false);
    setNapMode(false);
    stopAlarm();
    stopTracking();
    stopSimulation();
    setIsNavMode(false);
    setFollowUser(false);
  };

  const handleStart = async () => {
    if (!destination || isStarting) return;
    setIsStarting(true);
    setPreAlertFired(false);
    prepareAudio();
    await requestNotificationPermission().catch(() => {});
    
    if (isSimulating) {
      setIsNavMode(true);
      setFollowUser(true);
      setIsStarting(false);
      return;
    }

    const initialLocation = await startTracking();
    if (!initialLocation) {
      setIsStarting(false);
      return;
    }
    setIsNavMode(true);
    setFollowUser(true);
    setStartPoint([initialLocation.latitude, initialLocation.longitude]);
    
    addRecent({
      name: destinationName || "Unknown Destination",
      address: "Recently visited",
      coords: destination,
      type: "other"
    });

    setIsStarting(false);
  };

  const handleLaunchRoute = (route: typeof POPULAR_ROUTES[0]) => {
    prepareAudio();
    setStartPoint(route.fromCoords);
    setStartName(route.fromName);
    setDestination(route.toCoords);
    setDestinationName(route.toName);
    setAlertRadius(route.radius);
    setIsNavMode(true);
    setFollowUser(true);
    startSimulation(route.fromCoords, route.toCoords, simSpeed);
  };

  const handleStartLiveSimulation = () => {
    if (!destination) return;
    prepareAudio();
    const start = location ? [location.latitude, location.longitude] as [number, number] : (startPoint || BD_CENTER);
    startSimulation(start, destination, simSpeed);
  };

  const selectPlace = (place: SavedPlace) => {
    setDestination(place.coords);
    setDestinationName(place.name);
    setFollowUser(false);
    setSheetState("compact");
  };

  // URL params auto-load
  useEffect(() => {
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const name = searchParams.get("name");
    
    if (lat && lon && name) {
      const timer = setTimeout(() => {
        setDestination([parseFloat(lat), parseFloat(lon)]);
        setDestinationName(name);
        setFollowUser(false);
        setSheetState("compact");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const mapCenter: [number, number] = useMemo(() => {
    if (followUser && location) return [location.latitude, location.longitude];
    if (destination) return destination;
    return BD_CENTER;
  }, [location, destination, followUser]);

  return (
    <div className="relative h-[100dvh] w-full bg-background text-foreground overflow-hidden select-none">
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
              setDestinationName(`Map Pin (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
              setFollowUser(false);
            }
          }}
        />
      </div>

      {/* Top Bar / Route Search Island (Non-Nav Mode) */}
      {!isNavMode && (
        <div className="absolute top-4 sm:top-8 left-0 right-0 z-40 px-3 sm:px-5 max-w-[420px] mx-auto pointer-events-none">
          <div className="pointer-events-auto space-y-2.5">
            
            {/* Transit Mode Chips (Bus, Metro, Train, Car) */}
            <div className="flex items-center justify-between bg-card/90 backdrop-blur-2xl p-1.5 rounded-2xl border border-primary/20 shadow-lg">
              {([
                { id: "bus", label: "Bus", icon: Bus, defRadius: 200 },
                { id: "metro", label: "Metro", icon: Train, defRadius: 150 },
                { id: "train", label: "Train", icon: Train, defRadius: 1000 },
                { id: "car", label: "Ride", icon: Car, defRadius: 300 }
              ] as const).map(mode => {
                const isSelected = transitMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setTransitMode(mode.id);
                      setAlertRadius(mode.defRadius);
                    }}
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active-tap",
                      isSelected ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <mode.icon size={13} />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Popular Route Fast-Launch Carousel */}
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
              {POPULAR_ROUTES.map(route => (
                <button
                  key={route.id}
                  onClick={() => handleLaunchRoute(route)}
                  className="px-3 py-2 rounded-2xl bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-600 hover:to-indigo-600 text-white shrink-0 shadow-lg border border-white/20 active-tap text-left flex items-center gap-2.5"
                >
                  <Sparkles size={14} className="text-amber-300 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider leading-none">{route.title}</p>
                    <p className="text-[8px] text-white/70 font-bold mt-0.5">{route.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <RouteSearch 
              fromName={startName || (location ? "Current Location" : "")}
              toName={destinationName || ""}
              currentLocation={location ? [location.latitude, location.longitude] : null}
              savedPlaces={savedPlaces}
              onSaveFixedPlace={savePlace}
              onDeleteFixedPlace={removeSaved}
              onMyLocationClick={() => {
                setFollowUser(true);
                if (location) {
                  setStartName("Current Location");
                  setStartPoint([location.latitude, location.longitude]);
                } else {
                  startTracking().then(loc => {
                    if (loc) {
                      setStartName("Current Location");
                      setStartPoint([loc.latitude, loc.longitude]);
                    }
                  });
                }
              }}
              onSelectFrom={(lat, lng, name) => { 
                if (lat !== 0 && lng !== 0) setStartPoint([lat, lng]); 
                setStartName(name); 
              }}
              onSelectTo={(lat, lng, name) => { 
                if (lat !== 0 && lng !== 0) setDestination([lat, lng]); 
                setDestinationName(name); 
                setFollowUser(false); 
              }}
            />
          </div>
        </div>
      )}

      {/* Live Navigation Mode HUD Overlay */}
      <AnimatePresence>
        {isNavMode && (
          <>
            {/* Top HUD Telemetry */}
            <motion.div 
              initial={{ y: -120, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: -120, opacity: 0 }}
              className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-2xl px-4 pt-11 pb-3.5 border-b border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="max-w-[420px] mx-auto space-y-3">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={handleStopAlarm}
                    className="p-2.5 bg-secondary hover:bg-secondary/80 rounded-2xl text-foreground shadow-sm active-tap"
                    title="Exit trip"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="text-center min-w-0 flex-1 px-2">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest mb-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      {isSimulating ? "Simulation Active" : "Live GPS Tracking"}
                    </div>
                    <h2 className="text-base font-black truncate text-foreground leading-tight">{destinationName}</h2>
                  </div>
                  
                  {/* OLED Nap Screen Toggle */}
                  <button
                    onClick={() => setNapMode(true)}
                    className="p-2.5 bg-secondary/80 hover:bg-secondary text-primary rounded-2xl flex items-center gap-1 shadow-sm active-tap"
                    title="OLED Nap Mode"
                  >
                    <Moon size={16} />
                  </button>
                </div>

                {/* HUD Telemetry Stats Bar */}
                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  <div className="p-2.5 bg-secondary/70 rounded-2xl border border-primary/10 flex flex-col items-center justify-center">
                    <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Remaining</span>
                    <span className="text-base font-black italic tracking-tight text-primary mt-0.5">
                      {distance !== null ? formatDistance(distance) : "--"}
                    </span>
                  </div>

                  <div className="p-2.5 bg-secondary/70 rounded-2xl border border-primary/10 flex flex-col items-center justify-center">
                    <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Wake Zone</span>
                    <span className="text-base font-black italic tracking-tight text-rose-500 mt-0.5">
                      ≤ {formatDistance(alertRadius)}
                    </span>
                  </div>

                  <div className="p-2.5 bg-secondary/70 rounded-2xl border border-primary/10 flex flex-col items-center justify-center">
                    <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Speed</span>
                    <span className="text-base font-black italic tracking-tight text-foreground mt-0.5">
                      {liveSpeedKmh} <span className="text-[9px] font-bold">km/h</span>
                    </span>
                  </div>

                  <div className="p-2.5 bg-secondary/70 rounded-2xl border border-primary/10 flex flex-col items-center justify-center">
                    <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">Est. ETA</span>
                    <span className="text-base font-black italic tracking-tight text-emerald-500 mt-0.5">
                      {etaMinutes !== null ? `${etaMinutes}m` : "--"}
                    </span>
                  </div>
                </div>

                {/* Two-stage alert status pill */}
                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-muted-foreground px-1">
                  <span>Pre-Alert: {preAlertFired ? "✅ 1km Warning Done" : "⏳ Active at 1km"}</span>
                  <span>Final Alarm: {alertRadius}m</span>
                </div>
              </div>
            </motion.div>

            {/* Bottom Floating Control Bar */}
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-6 sm:bottom-8 left-4 right-4 max-w-[390px] mx-auto z-[150] pointer-events-auto"
            >
              <div className="bg-card/98 backdrop-blur-3xl p-3 rounded-[28px] border-2 border-primary/20 shadow-[0_25px_80px_rgba(0,0,0,0.6)] flex items-center justify-between gap-2.5">
                {!isSimulating ? (
                  <button
                    onClick={handleStartLiveSimulation}
                    className="flex-1 h-13 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active-tap"
                  >
                    <FastForward size={16} />
                    <span>Simulate Run</span>
                  </button>
                ) : (
                  <div className="flex-1 flex items-center gap-1 bg-secondary/80 p-1 rounded-xl">
                    <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground px-1.5">Speed:</span>
                    {[1, 3, 6].map(spd => (
                      <button
                        key={spd}
                        onClick={() => {
                          setSimSpeed(spd);
                          if (destination) {
                            const start = location ? [location.latitude, location.longitude] as [number, number] : (startPoint || BD_CENTER);
                            startSimulation(start, destination, spd);
                          }
                        }}
                        className={cn(
                          "flex-1 h-9 rounded-lg text-[11px] font-black uppercase transition-all active-tap",
                          simSpeed === spd ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleStopAlarm}
                  className="px-5 h-13 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/25 active-tap shrink-0"
                >
                  <Square size={14} fill="white" />
                  <span>End Trip</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* OLED Nap Screen Mode (Super Battery Saver Screen) */}
      <AnimatePresence>
        {napMode && isNavMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-black text-white flex flex-col items-center justify-between p-8 text-center cursor-pointer select-none"
            onClick={() => setNapMode(false)}
          >
            <div className="pt-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest">
                <Moon size={12} />
                <span>OLED Nap Mode Active</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Approaching Stop</p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">{destinationName}</h1>
              <div className="text-6xl font-black italic tracking-tighter text-blue-400 animate-pulse">
                {distance !== null ? formatDistance(distance) : "--"}
              </div>
              <p className="text-xs font-bold text-white/60">Alarm armed for {formatDistance(alertRadius)}</p>
            </div>

            <div className="pb-8 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Tap anywhere to wake screen</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recenter GPS Button */}
      <div className="absolute right-4 bottom-[32dvh] z-30 flex flex-col gap-2.5">
        <button 
          onClick={() => {
            setFollowUser(!followUser);
            if (!location) startTracking();
          }}
          aria-label={followUser ? "Stop following location" : "Follow my location"}
          className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center shadow-2xl transition-all border active-tap",
            followUser ? "bg-primary text-white border-primary shadow-primary/30" : "bg-card text-foreground border-primary/20"
          )}
        >
          <LocateFixed size={18} className={followUser ? "animate-pulse" : ""} />
        </button>
      </div>

      {/* Bottom Sheet Drawer (Non-Nav Mode) */}
      {!isNavMode && (
        <motion.div 
          initial={{ y: "85%" }}
          animate={{ y: sheetState === "compact" ? "68%" : "15%" }}
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
          <div className="h-full bg-card/98 backdrop-blur-3xl border-t border-primary/20 rounded-t-[36px] shadow-[0_-25px_60px_rgba(0,0,0,0.4)] pointer-events-auto overflow-hidden flex flex-col">
            <div 
              className="w-full py-2.5 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing shrink-0" 
              onClick={() => setSheetState(sheetState === "compact" ? "expanded" : "compact")}
            >
              <div className="w-10 h-1.5 bg-muted rounded-full" />
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.25em] mt-0.5 italic">
                {sheetState === "compact" ? "▲ Swipe Up for Settings & Places" : "▼ Minimize"}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-36 scrollbar-hide">
              <div className="space-y-5 pt-1 max-w-[420px] mx-auto">
                
                {/* Radius Selector */}
                <section>
                  <div className="flex justify-between items-center mb-2.5 px-1">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground italic">Wake Alert Distance</h3>
                      <p className="text-[8px] text-muted-foreground/70">Alarm fires when you enter this circle</p>
                    </div>
                    <div className="px-2.5 py-0.5 bg-primary/10 rounded-lg">
                      <span className="text-primary font-black text-xs italic tracking-widest">{formatDistance(alertRadius)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {RADIUS_OPTIONS.map(r => (
                      <button 
                        key={r} onClick={() => setAlertRadius(r)}
                        className={cn(
                          "h-11 rounded-xl text-[10px] font-black transition-all border-2 uppercase tracking-wider active-tap",
                          alertRadius === r ? "bg-primary border-primary text-white shadow-md shadow-primary/20" : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        {formatDistance(r)}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Start Journey Button */}
                <div className="space-y-2">
                  <button 
                    onClick={handleStart} 
                    disabled={!destination || isStarting}
                    className="w-full h-15 bg-primary disabled:opacity-20 rounded-2xl flex items-center justify-center gap-3 text-base font-black text-white italic shadow-[0_15px_35px_rgba(37,99,235,0.3)] active:scale-95 transition-all uppercase tracking-tight"
                  >
                    {isStarting ? <Loader2 className="animate-spin" size={20} /> : <Play fill="white" size={20} />} 
                    {isStarting ? "Locating..." : destination ? `Start Trip to ${destinationName?.split(" ")[0]}` : "Pick Destination to Start"}
                  </button>

                  {startPoint && destination && (
                    <button
                      onClick={() => {
                        prepareAudio();
                        setIsNavMode(true);
                        setFollowUser(true);
                        startSimulation(startPoint, destination, simSpeed);
                      }}
                      className="w-full h-11 bg-secondary/80 hover:bg-secondary rounded-xl border border-primary/20 flex items-center justify-center gap-2 text-xs font-black text-primary uppercase tracking-wider active-tap"
                    >
                      <FastForward size={15} />
                      <span>Simulate Journey ({simSpeed}x Speed)</span>
                    </button>
                  )}
                </div>

                {/* Save Current Destination Buttons */}
                {destination && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => savePlace({ name: destinationName || "Home", address: "Saved Home Location", coords: destination, type: "home" })}
                      className="h-10 rounded-xl border border-primary/20 bg-secondary/60 text-[9px] font-black uppercase tracking-wider text-foreground flex items-center justify-center gap-1.5 active-tap"
                    >
                      <HomeIcon size={13} className="text-blue-500" />
                      <span>Save as Home</span>
                    </button>
                    <button
                      onClick={() => savePlace({ name: destinationName || "Office", address: "Saved Office Location", coords: destination, type: "office" })}
                      className="h-10 rounded-xl border border-primary/20 bg-secondary/60 text-[9px] font-black uppercase tracking-wider text-foreground flex items-center justify-center gap-1.5 active-tap"
                    >
                      <Briefcase size={13} className="text-purple-500" />
                      <span>Save as Office</span>
                    </button>
                  </div>
                )}

                {/* Fixed Locations List */}
                <section>
                  <div className="flex justify-between items-center mb-2 px-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground italic">Fixed Places</h3>
                    <span className="text-[8px] text-muted-foreground/60 font-bold uppercase">1-Tap Select</span>
                  </div>
                  <div className="space-y-2">
                    {savedPlaces.map((place) => (
                      <div
                        key={place.id}
                        className="w-full flex items-center justify-between p-3 bg-card border border-primary/10 rounded-2xl hover:border-primary/30 transition-all group shadow-sm"
                      >
                        <button
                          onClick={() => selectPlace(place)}
                          className="flex items-center gap-2.5 flex-1 min-w-0 text-left active-tap"
                        >
                          <div className="w-8 h-8 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                            {place.type === "home" ? (
                              <HomeIcon size={15} className="text-blue-500" />
                            ) : place.type === "office" ? (
                              <Briefcase size={15} className="text-purple-500" />
                            ) : (
                              <Star size={15} className="text-amber-500" fill="currentColor" fillOpacity={0.2} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black uppercase tracking-wider truncate text-foreground">{place.name}</p>
                            <p className="text-[8px] text-muted-foreground font-bold truncate mt-0.5">{place.address}</p>
                          </div>
                        </button>

                        <button
                          onClick={() => removeSaved(place.id)}
                          className="p-1.5 text-muted-foreground/40 hover:text-rose-500 transition-colors ml-1 active-tap"
                          title="Remove Location"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alarm Fullscreen Modal */}
      <AnimatePresence>
        {isAlarmActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }} 
            className="fixed inset-0 z-[300] bg-rose-600 flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 12, -12, 0] }} 
              transition={{ repeat: Infinity, duration: 0.4 }} 
              className="mb-6"
            >
              <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center text-rose-600 shadow-2xl border-4 border-white/40">
                <Bell size={54} fill="currentColor" />
              </div>
            </motion.div>

            <span className="px-3.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest mb-2.5">
              ⚡ Wake Up Alert ({formatDistance(alertRadius)} Zone)
            </span>

            <h1 className="text-5xl sm:text-6xl font-black text-white italic uppercase tracking-tighter mb-2.5 leading-none">
              Wake Up!
            </h1>
            
            <p className="text-lg sm:text-xl font-black text-white/90 mb-8 max-w-xs tracking-tight leading-snug">
              Approaching <span className="underline decoration-white/40">{destinationName}</span>!
            </p>

            <button 
              onClick={handleStopAlarm} 
              className="w-full max-w-xs h-16 bg-white text-rose-600 rounded-2xl font-black text-xl shadow-2xl active:scale-95 transition-all italic uppercase tracking-tight"
            >
              I Arrived / Stop Alarm
            </button>

            <motion.div 
              animate={{ opacity: [0.1, 0.3, 0.1] }} 
              transition={{ repeat: Infinity, duration: 0.6 }} 
              className="absolute inset-0 bg-white/10 pointer-events-none" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="absolute top-18 left-4 right-4 z-[60] bg-rose-500 text-white p-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 shadow-xl">
          <div className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
      <TrackingContent />
    </Suspense>
  );
}
