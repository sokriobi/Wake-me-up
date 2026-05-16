"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Loader2, X, CircleDot, ArrowDown, Crosshair, Navigation, Plane, Train, Building2, Map as MapIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
}

interface RouteSearchProps {
  onSelectFrom: (lat: number, lon: number, name: string) => void;
  onSelectTo: (lat: number, lon: number, name: string) => void;
  onMyLocationClick: () => void;
  fromName?: string;
  toName?: string;
  currentLocation?: [number, number] | null;
}

export function RouteSearch({ 
  onSelectFrom, 
  onSelectTo, 
  onMyLocationClick,
  fromName, 
  toName, 
  currentLocation 
}: RouteSearchProps) {
  const [activeField, setActiveField] = useState<"from" | "to" | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      // Nominatim search with viewbox for Bangladesh for better accuracy
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=bd&limit=12&addressdetails=1&extratags=1`
      );
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Advanced sorting: prioritize results starting with the query, and landmarks like airports/stations
        const sorted = data.sort((a, b) => {
          const nameA = a.display_name.toLowerCase();
          const nameB = b.display_name.toLowerCase();
          const term = q.toLowerCase();
          
          const aStarts = nameA.startsWith(term);
          const bStarts = nameB.startsWith(term);
          
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          
          // Second priority: important transit places
          const aIsTransit = a.class === "railway" || a.type === "aeroway" || a.type === "bus_station";
          const bIsTransit = b.class === "railway" || b.type === "aeroway" || b.type === "bus_station";
          
          if (aIsTransit && !bIsTransit) return -1;
          if (!aIsTransit && bIsTransit) return 1;
          
          return 0;
        });
        setResults(sorted);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeField && query.length > 0) {
        fetchResults(query);
      }
    }, 200); // Further reduced to 200ms for "instant" feel
    return () => clearTimeout(timer);
  }, [query, activeField, fetchResults]);

  const getPlaceIcon = (item: SearchResult) => {
    const cls = (item.class || "").toLowerCase();
    const type = (item.type || "").toLowerCase();
    if (cls.includes("aeroway") || type.includes("airport")) return <Plane className="text-blue-500" size={20} />;
    if (cls.includes("railway") || type.includes("station")) return <Train className="text-orange-500" size={20} />;
    if (cls.includes("highway") || type.includes("bus")) return <MapIcon className="text-green-500" size={20} />;
    return <Building2 className="text-primary/60" size={20} />;
  };

  const handleMyLocation = (e: React.MouseEvent, field: "from" | "to") => {
    e.stopPropagation();
    if (!currentLocation) {
      onMyLocationClick();
    } else {
      const name = "Current Location";
      if (field === "from") onSelectFrom(currentLocation[0], currentLocation[1], name);
      else onSelectTo(currentLocation[0], currentLocation[1], name);
      setActiveField(null);
      setQuery("");
    }
  };

  return (
    <div className="w-full bg-card rounded-[36px] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.4)] border border-primary/20/60 space-y-5 relative z-[500]">
      {/* From Field */}
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
          <CircleDot className="text-blue-500 group-focus-within:text-blue-400" size={22} />
        </div>
        <input
          type="text"
          placeholder="Pick-up point"
          className="w-full h-16 pl-14 pr-12 bg-secondary border-2 border-transparent focus:border-blue-500/40 focus:bg-background rounded-2xl transition-all text-base font-black text-foreground placeholder:text-muted-foreground/50 shadow-inner"
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
        <button 
          onClick={(e) => handleMyLocation(e, "from")}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all",
            currentLocation ? "text-blue-500 bg-blue-500/10 shadow-sm" : "text-muted-foreground bg-secondary"
          )}
        >
          <Crosshair size={22} />
        </button>
      </div>

      <div className="flex justify-center -my-8 relative z-10 pointer-events-none">
        <div className="bg-background p-2 rounded-full border border-primary/20 shadow-lg">
          <ChevronDown size={16} className="text-muted-foreground" />
        </div>
      </div>

      {/* To Field */}
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
          <MapPin className="text-rose-500 group-focus-within:text-rose-400" size={22} />
        </div>
        <input
          type="text"
          placeholder="Where to?"
          className="w-full h-16 pl-14 pr-12 bg-secondary border-2 border-transparent focus:border-rose-500/40 focus:bg-background rounded-2xl transition-all text-base font-black text-foreground placeholder:text-muted-foreground/50 shadow-inner"
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
        <button 
          onClick={(e) => handleMyLocation(e, "to")}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all",
            currentLocation ? "text-rose-500 bg-rose-500/10 shadow-sm" : "text-muted-foreground bg-secondary"
          )}
        >
          <Crosshair size={22} />
        </button>
      </div>

      {/* Results Dropdown - High Contrast & Backdrop Blur */}
      {activeField && (query.length > 0 || loading) && (
        <div 
          ref={dropdownRef}
          className="absolute top-[105%] left-0 right-0 mt-3 bg-background/95 backdrop-blur-3xl border-4 border-primary rounded-[32px] overflow-hidden shadow-[0_50px_120px_rgba(0,0,0,0.6)] z-[1000] max-h-[400px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="sticky top-0 bg-primary px-8 py-3 border-b border-white/10 z-30 flex justify-between items-center">
             <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white italic">Search Results</span>
             <div className="flex gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
             </div>
          </div>
          
          {loading ? (
            <div className="p-12 flex flex-col items-center gap-4 bg-background">
              <Loader2 className="animate-spin text-primary" size={28} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Scanning Places</span>
            </div>
          ) : (
            <div className="py-2 bg-background">
              {results.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground font-black uppercase text-[10px] tracking-widest leading-loose">
                  No matches for<br/>
                  <span className="text-foreground text-sm italic">&quot;{query}&quot;</span>
                </div>
              ) : (
                results.map((r, i) => (
                  <button
                    key={r.place_id + i}
                    className="w-full px-6 py-5 flex items-start gap-5 hover:bg-primary/5 active:bg-primary/10 transition-all text-left border-b border-primary/20/50 last:border-0 group"
                    onClick={() => {
                      const name = r.display_name.split(",")[0];
                      if (activeField === "from") onSelectFrom(parseFloat(r.lat), parseFloat(r.lon), name);
                      else onSelectTo(parseFloat(r.lat), parseFloat(r.lon), name);
                      setActiveField(null);
                      setQuery("");
                    }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      {getPlaceIcon(r)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-black truncate text-foreground group-hover:text-primary transition-colors">{r.display_name.split(",")[0]}</p>
                      <p className="text-[10px] text-muted-foreground font-bold truncate mt-1 leading-relaxed">
                        {r.display_name.split(",").slice(1).join(", ")}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
          <div className="sticky bottom-0 bg-secondary/50 backdrop-blur-md px-6 py-3 border-t border-primary/20 text-[9px] font-black text-center text-muted-foreground uppercase tracking-widest">
            Showing results in Bangladesh
          </div>
        </div>
      )}
    </div>
  );
}


