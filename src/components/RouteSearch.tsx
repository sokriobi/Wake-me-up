"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  MapPin, 
  Loader2, 
  CircleDot, 
  Crosshair, 
  Plane, 
  Train, 
  Building2, 
  Map as MapIcon, 
  ArrowUpDown, 
  X, 
  Home as HomeIcon, 
  Briefcase, 
  Plus, 
  Trash2, 
  Star,
  Sparkles,
  Navigation2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { searchLocalPlaces, CuratedPlace } from "@/lib/bangladeshPlaces";
import { SavedPlace } from "@/hooks/useSavedPlaces";

export interface UnifiedPlace {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lon: number;
  category: string;
  isCurated?: boolean;
}

interface RouteSearchProps {
  onSelectFrom: (lat: number, lon: number, name: string) => void;
  onSelectTo: (lat: number, lon: number, name: string) => void;
  onMyLocationClick: () => void;
  fromName?: string;
  toName?: string;
  currentLocation?: [number, number] | null;
  savedPlaces?: SavedPlace[];
  onSaveFixedPlace?: (place: Omit<SavedPlace, "id">) => void;
  onDeleteFixedPlace?: (id: string) => void;
}

export function RouteSearch({ 
  onSelectFrom, 
  onSelectTo, 
  onMyLocationClick,
  fromName, 
  toName, 
  currentLocation,
  savedPlaces = [],
  onSaveFixedPlace,
  onDeleteFixedPlace
}: RouteSearchProps) {
  const [activeField, setActiveField] = useState<"from" | "to" | null>(null);
  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState<UnifiedPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newPlaceType, setNewPlaceType] = useState<"home" | "office" | "custom">("custom");
  const [newPlaceQuery, setNewPlaceQuery] = useState("");
  const [newPlaceCoords, setNewPlaceCoords] = useState<[number, number] | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputFromRef = useRef<HTMLInputElement>(null);
  const inputToRef = useRef<HTMLInputElement>(null);

  // 1. Instant 0ms local curated results
  const localResults: UnifiedPlace[] = useMemo(() => {
    if (!query.trim()) return [];
    const matched = searchLocalPlaces(query);
    return matched.map(p => ({
      id: p.id,
      name: p.name,
      subtitle: `${p.area}, ${p.city}${p.bnName ? ` • ${p.bnName}` : ""}`,
      lat: p.lat,
      lon: p.lon,
      category: p.category,
      isCurated: true
    }));
  }, [query]);

  // 2. Query Nominatim in background
  const fetchRemoteResults = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setRemoteResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&countrycodes=bd&limit=8&addressdetails=1`
      );
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const mapped: UnifiedPlace[] = data.map((item) => {
          const parts = (item.display_name || "").split(",");
          const name = parts[0] || item.display_name;
          const subtitle = parts.slice(1, 4).join(", ").trim();
          
          let cat = "area";
          const cls = (item.class || "").toLowerCase();
          const type = (item.type || "").toLowerCase();
          if (cls.includes("aeroway") || type.includes("airport")) cat = "airport";
          else if (cls.includes("railway") || type.includes("station")) cat = "railway";
          else if (cls.includes("highway") || type.includes("bus")) cat = "bus_terminal";
          else if (type.includes("commercial") || type.includes("mall")) cat = "commercial";

          return {
            id: `nom-${item.place_id}`,
            name,
            subtitle: subtitle || "Bangladesh",
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            category: cat,
            isCurated: false
          };
        });
        setRemoteResults(mapped);
      } else {
        setRemoteResults([]);
      }
    } catch {
      setRemoteResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeField || !query.trim()) {
      setRemoteResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetchRemoteResults(query);
    }, 280);
    return () => clearTimeout(timer);
  }, [query, activeField, fetchRemoteResults]);

  // Combine local and remote without duplicates
  const combinedResults = useMemo(() => {
    const list: UnifiedPlace[] = [...localResults];
    const seen = new Set(list.map(p => `${p.lat.toFixed(3)},${p.lon.toFixed(3)}`));
    
    for (const r of remoteResults) {
      const key = `${r.lat.toFixed(3)},${r.lon.toFixed(3)}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(r);
      }
    }
    return list;
  }, [localResults, remoteResults]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveField(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (place: UnifiedPlace | SavedPlace) => {
    const lat = "coords" in place ? place.coords[0] : place.lat;
    const lon = "coords" in place ? place.coords[1] : place.lon;
    const name = place.name;

    if (activeField === "from") {
      onSelectFrom(lat, lon, name);
    } else {
      onSelectTo(lat, lon, name);
    }
    setActiveField(null);
    setQuery("");
  };

  const handleUseCurrentLocation = (field: "from" | "to") => {
    onMyLocationClick();
    if (currentLocation) {
      if (field === "from") {
        onSelectFrom(currentLocation[0], currentLocation[1], "Current Location");
      } else {
        onSelectTo(currentLocation[0], currentLocation[1], "Current Location");
      }
      setActiveField(null);
      setQuery("");
    }
  };

  const handleSwap = () => {
    if (fromName || toName) {
      // Swapping values
      const prevFrom = fromName;
      const prevTo = toName;
      if (prevTo) onSelectFrom(0, 0, prevTo); // coordinates will be preserved or re-queried
      if (prevFrom) onSelectTo(0, 0, prevFrom);
    }
  };

  const renderIcon = (cat: string) => {
    switch (cat) {
      case "metro_station":
        return <Train className="text-emerald-500" size={18} />;
      case "railway":
        return <Train className="text-amber-500" size={18} />;
      case "airport":
        return <Plane className="text-sky-500" size={18} />;
      case "bus_terminal":
        return <MapIcon className="text-rose-500" size={18} />;
      case "home":
        return <HomeIcon className="text-blue-500" size={18} />;
      case "office":
        return <Briefcase className="text-purple-500" size={18} />;
      case "commercial":
        return <Building2 className="text-indigo-500" size={18} />;
      default:
        return <MapPin className="text-primary" size={18} />;
    }
  };

  // Helper to highlight query matches
  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text;
    const index = text.toLowerCase().indexOf(q.toLowerCase());
    if (index === -1) return text;
    return (
      <>
        {text.slice(0, index)}
        <span className="text-primary font-black bg-primary/10 px-0.5 rounded">{text.slice(index, index + q.length)}</span>
        {text.slice(index + q.length)}
      </>
    );
  };

  return (
    <div className="w-full bg-card/95 backdrop-blur-2xl rounded-[36px] p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.5)] border border-primary/20 space-y-4 relative z-[500]">
      
      {/* Top Quick Fixed Chips (Home, Office, Custom) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground shrink-0 mr-1 flex items-center gap-1">
          <Sparkles size={11} className="text-amber-400" /> Quick:
        </span>

        {/* Current Location Chip */}
        <button
          onClick={() => handleUseCurrentLocation(activeField || "from")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all text-[10px] font-black uppercase tracking-wider shrink-0 border border-blue-500/20 active-tap"
        >
          <Navigation2 size={12} className={currentLocation ? "animate-pulse" : ""} />
          <span>My GPS</span>
        </button>

        {/* Home Chip */}
        {savedPlaces.filter(p => p.type === "home").map((p) => (
          <div key={p.id} className="relative group shrink-0 flex items-center">
            <button
              onClick={() => handleSelect(p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/80 hover:bg-primary/10 text-foreground transition-all text-[10px] font-black uppercase tracking-wider border border-primary/10 active-tap"
            >
              <HomeIcon size={12} className="text-blue-500" />
              <span>{p.name}</span>
            </button>
            {onDeleteFixedPlace && p.id !== "default-home" && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteFixedPlace(p.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-rose-400 hover:text-rose-600 p-0.5"
                title="Remove Home"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        ))}

        {/* Office Chip */}
        {savedPlaces.filter(p => p.type === "office").map((p) => (
          <div key={p.id} className="relative group shrink-0 flex items-center">
            <button
              onClick={() => handleSelect(p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/80 hover:bg-primary/10 text-foreground transition-all text-[10px] font-black uppercase tracking-wider border border-primary/10 active-tap"
            >
              <Briefcase size={12} className="text-purple-500" />
              <span>{p.name}</span>
            </button>
            {onDeleteFixedPlace && p.id !== "default-office" && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteFixedPlace(p.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-rose-400 hover:text-rose-600 p-0.5"
                title="Remove Office"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        ))}

        {/* Custom Saved Chips */}
        {savedPlaces.filter(p => p.type === "custom" || p.type === "other").map((p) => (
          <div key={p.id} className="relative group shrink-0 flex items-center">
            <button
              onClick={() => handleSelect(p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/80 hover:bg-primary/10 text-foreground transition-all text-[10px] font-black uppercase tracking-wider border border-primary/10 active-tap"
            >
              <Star size={12} className="text-amber-500" fill="currentColor" fillOpacity={0.2} />
              <span>{p.name}</span>
            </button>
            {onDeleteFixedPlace && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteFixedPlace(p.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-rose-400 hover:text-rose-600 p-0.5"
                title="Remove place"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        ))}

        {/* Add / Manage Button */}
        <button
          onClick={() => setShowManageModal(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-[10px] font-black uppercase tracking-wider shrink-0 active-tap"
        >
          <Plus size={12} />
          <span>Add</span>
        </button>
      </div>

      {/* From Input Field */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <CircleDot className="text-blue-500 group-focus-within:text-blue-400 transition-colors" size={20} />
        </div>
        <input
          ref={inputFromRef}
          type="text"
          placeholder="Pick-up point (e.g. Current Location, Abdullahpur)"
          className="w-full h-15 pl-12 pr-20 bg-secondary/80 focus:bg-background border-2 border-transparent focus:border-blue-500/40 rounded-2xl transition-all text-sm font-black text-foreground placeholder:text-muted-foreground/50 shadow-inner"
          value={activeField === "from" ? query : fromName || ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveField("from");
          }}
          onFocus={() => {
            setActiveField("from");
            setQuery(fromName === "Current Location" ? "" : fromName || "");
          }}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {fromName && (
            <button
              onClick={() => { onSelectFrom(0, 0, ""); setQuery(""); }}
              className="p-1.5 text-muted-foreground/60 hover:text-foreground rounded-lg transition-colors"
            >
              <X size={15} />
            </button>
          )}
          <button 
            onClick={() => handleUseCurrentLocation("from")}
            title="Use Current GPS Location"
            className={cn(
              "p-2 rounded-xl transition-all active-tap",
              currentLocation ? "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20" : "text-muted-foreground bg-secondary"
            )}
          >
            <Crosshair size={18} className={currentLocation ? "animate-pulse" : ""} />
          </button>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-6 relative z-10 pointer-events-none">
        <button
          onClick={handleSwap}
          type="button"
          className="pointer-events-auto bg-background p-2 rounded-full border border-primary/20 shadow-md hover:scale-110 active:scale-95 transition-transform text-muted-foreground hover:text-primary"
          title="Swap Pick-up and Destination"
        >
          <ArrowUpDown size={14} />
        </button>
      </div>

      {/* To Input Field */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <MapPin className="text-rose-500 group-focus-within:text-rose-400 transition-colors" size={20} />
        </div>
        <input
          ref={inputToRef}
          type="text"
          placeholder="Where to? (e.g. Office, Abdullahpur, Agargaon)"
          className="w-full h-15 pl-12 pr-20 bg-secondary/80 focus:bg-background border-2 border-transparent focus:border-rose-500/40 rounded-2xl transition-all text-sm font-black text-foreground placeholder:text-muted-foreground/50 shadow-inner"
          value={activeField === "to" ? query : toName || ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveField("to");
          }}
          onFocus={() => {
            setActiveField("to");
            setQuery(toName === "Current Location" ? "" : toName || "");
          }}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {toName && (
            <button
              onClick={() => { onSelectTo(0, 0, ""); setQuery(""); }}
              className="p-1.5 text-muted-foreground/60 hover:text-foreground rounded-lg transition-colors"
            >
              <X size={15} />
            </button>
          )}
          <button 
            onClick={() => handleUseCurrentLocation("to")}
            title="Use Current GPS Location"
            className={cn(
              "p-2 rounded-xl transition-all active-tap",
              currentLocation ? "text-rose-500 bg-rose-500/10 hover:bg-rose-500/20" : "text-muted-foreground bg-secondary"
            )}
          >
            <Crosshair size={18} />
          </button>
        </div>
      </div>

      {/* Instant Dynamic Suggestion Dropdown */}
      {activeField && (query.trim().length > 0 || loading || savedPlaces.length > 0) && (
        <div 
          ref={dropdownRef}
          className="absolute top-[102%] left-0 right-0 mt-2 bg-background/98 backdrop-blur-3xl border-2 border-primary/30 rounded-[28px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)] z-[1000] max-h-[380px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="sticky top-0 bg-primary/95 backdrop-blur-md px-5 py-2.5 border-b border-white/10 z-30 flex justify-between items-center text-white">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">
              {query.trim().length === 0 ? "Quick Suggestions" : `Locations for "${query}"`}
            </span>
            {loading && <Loader2 className="animate-spin" size={14} />}
          </div>

          <div className="py-1 bg-background divide-y divide-border/20">
            {/* If query is empty, show saved places & recent */}
            {query.trim().length === 0 && (
              <>
                <div className="p-3 bg-secondary/30 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  Saved & Fixed Locations
                </div>
                {savedPlaces.map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => handleSelect(sp)}
                    className="w-full px-5 py-3.5 flex items-center gap-3.5 hover:bg-primary/5 active:bg-primary/10 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                      {renderIcon(sp.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black truncate text-foreground group-hover:text-primary transition-colors">{sp.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold truncate mt-0.5">{sp.address}</p>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* Matching Results */}
            {query.trim().length > 0 && combinedResults.length === 0 && !loading && (
              <div className="p-8 text-center text-muted-foreground font-black uppercase text-[10px] tracking-widest leading-loose">
                No matching places found for<br />
                <span className="text-foreground text-sm italic">&quot;{query}&quot;</span>
              </div>
            )}

            {combinedResults.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full px-5 py-3.5 flex items-start gap-3.5 hover:bg-primary/5 active:bg-primary/10 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all mt-0.5">
                  {renderIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black truncate text-foreground group-hover:text-primary transition-colors">
                      {highlightMatch(item.name, query)}
                    </p>
                    {item.isCurated && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 shrink-0">
                        Fast Match
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-bold truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="sticky bottom-0 bg-secondary/80 backdrop-blur-md px-4 py-2 border-t border-border/30 text-[8px] font-black text-center text-muted-foreground uppercase tracking-widest">
            Instant Search Powered by Bangladesh Transit Index
          </div>
        </div>
      )}

      {/* Add / Manage Fixed Location Modal */}
      {showManageModal && (
        <div className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-primary/20 rounded-[32px] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black uppercase italic tracking-tight text-foreground">Set Fixed Location</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Save Office, Home, or Favorite Stop</p>
              </div>
              <button 
                onClick={() => setShowManageModal(false)}
                className="p-2 bg-secondary rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2">
              {(["office", "home", "custom"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setNewPlaceType(t);
                    if (t === "office") setNewPlaceName("Office");
                    else if (t === "home") setNewPlaceName("Home");
                    else setNewPlaceName("");
                  }}
                  className={cn(
                    "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all active-tap",
                    newPlaceType === t ? "bg-primary text-white border-primary" : "bg-secondary text-foreground border-transparent"
                  )}
                >
                  {t === "office" ? "🏢 Office" : t === "home" ? "🏠 Home" : "⭐ Custom"}
                </button>
              ))}
            </div>

            {/* Label Input */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground mb-1 block">Place Name / Label</label>
              <input
                type="text"
                placeholder={newPlaceType === "office" ? "Office" : newPlaceType === "home" ? "Home" : "e.g. My Gym, University"}
                className="w-full h-12 px-4 bg-secondary rounded-xl border border-primary/10 text-sm font-bold text-foreground focus:outline-none focus:border-primary"
                value={newPlaceName}
                onChange={(e) => setNewPlaceName(e.target.value)}
              />
            </div>

            {/* Location Search Input */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground mb-1 block">Search Address or LandMark</label>
              <input
                type="text"
                placeholder="Type location (e.g. Abdullahpur, Banani, Motijheel)..."
                className="w-full h-12 px-4 bg-secondary rounded-xl border border-primary/10 text-sm font-bold text-foreground focus:outline-none focus:border-primary"
                value={newPlaceQuery}
                onChange={(e) => setNewPlaceQuery(e.target.value)}
              />
            </div>

            {/* Quick Suggestions for Modal */}
            {newPlaceQuery.trim().length > 0 && (
              <div className="max-h-40 overflow-y-auto bg-background rounded-xl border border-primary/10 divide-y divide-border/20">
                {searchLocalPlaces(newPlaceQuery).slice(0, 5).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setNewPlaceCoords([p.lat, p.lon]);
                      setNewPlaceQuery(p.name);
                    }}
                    className={cn(
                      "w-full p-2.5 text-left text-xs font-bold flex items-center justify-between hover:bg-primary/10 transition-colors",
                      newPlaceCoords && newPlaceCoords[0] === p.lat && newPlaceCoords[1] === p.lon ? "bg-primary/20 text-primary" : "text-foreground"
                    )}
                  >
                    <span>{p.name} ({p.area})</span>
                    {newPlaceCoords && newPlaceCoords[0] === p.lat && newPlaceCoords[1] === p.lon && (
                      <span className="text-[9px] font-black uppercase text-primary">Selected</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Use Current GPS as Location button */}
            {currentLocation && (
              <button
                type="button"
                onClick={() => {
                  setNewPlaceCoords(currentLocation);
                  setNewPlaceQuery("Current Location Coordinates");
                }}
                className="w-full py-2.5 rounded-xl bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 border border-blue-500/20 active-tap"
              >
                <Crosshair size={14} />
                <span>Use My Current Location</span>
              </button>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="flex-1 h-12 rounded-xl bg-secondary text-foreground text-xs font-black uppercase tracking-wider active-tap"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newPlaceName.trim() || !newPlaceCoords}
                onClick={() => {
                  if (onSaveFixedPlace && newPlaceCoords) {
                    onSaveFixedPlace({
                      name: newPlaceName.trim(),
                      address: newPlaceQuery || "Saved Location",
                      coords: newPlaceCoords,
                      type: newPlaceType
                    });
                  }
                  setShowManageModal(false);
                  setNewPlaceName("");
                  setNewPlaceQuery("");
                  setNewPlaceCoords(null);
                }}
                className="flex-1 h-12 rounded-xl bg-primary disabled:opacity-30 text-white text-xs font-black uppercase tracking-wider active-tap shadow-lg shadow-primary/20"
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
