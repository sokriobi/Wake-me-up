"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Loader2, X, CircleDot, ArrowDown, Crosshair, Navigation, Plane, Train, Building2, Map as MapIcon } from "lucide-react";
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
      // Nominatim search with specific parameters for Bangladesh
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=bd&limit=10&addressdetails=1&featuretype=settlement,railway,aeroway,highway,amenity`
      );
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Priority sorting for Bangladesh context
        const sorted = data.sort((a, b) => {
          const nameA = a.display_name.toLowerCase();
          const nameB = b.display_name.toLowerCase();
          const term = q.toLowerCase();
          
          if (nameA.startsWith(term) && !nameB.startsWith(term)) return -1;
          if (!nameA.startsWith(term) && nameB.startsWith(term)) return 1;
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
      if (activeField) {
        fetchResults(query);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeField, fetchResults]);

  const getPlaceIcon = (item: SearchResult) => {
    const cls = (item.class || "").toLowerCase();
    const type = (item.type || "").toLowerCase();
    if (cls.includes("aeroway") || type.includes("airport")) return <Plane className="text-blue-500" size={16} />;
    if (cls.includes("railway") || type.includes("station")) return <Train className="text-orange-500" size={16} />;
    if (cls.includes("highway") || type.includes("bus")) return <MapIcon className="text-green-500" size={16} />;
    return <Building2 className="text-gray-400" size={16} />;
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
    <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-3xl p-4 shadow-2xl space-y-3 relative z-[300] border border-gray-200 dark:border-white/10">
      {/* From Field */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <CircleDot className="text-blue-600" size={18} />
        </div>
        <input
          type="text"
          placeholder="Starting point"
          className="w-full h-12 pl-12 pr-12 bg-gray-100 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/50 text-sm"
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
            "absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full",
            currentLocation ? "text-blue-600" : "text-gray-400 animate-pulse"
          )}
        >
          <Crosshair size={18} />
        </button>
      </div>

      <div className="flex justify-center -my-3 relative z-10">
        <div className="bg-white dark:bg-[#1a1a1a] p-1 rounded-full border border-gray-100 dark:border-white/10">
          <ArrowDown size={14} className="text-gray-400" />
        </div>
      </div>

      {/* To Field */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <MapPin className="text-red-600" size={18} />
        </div>
        <input
          type="text"
          placeholder="Destination"
          className="w-full h-12 pl-12 pr-12 bg-gray-100 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-red-500/50 text-sm"
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
            "absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full",
            currentLocation ? "text-red-600" : "text-gray-400 animate-pulse"
          )}
        >
          <Crosshair size={18} />
        </button>
      </div>

      {/* Results */}
      {activeField && (query.length > 0 || loading) && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#242424] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[301] max-h-72 overflow-y-auto"
        >
          {loading ? (
            <div className="p-8 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Searching...</span>
            </div>
          ) : (
            <div className="py-2">
              {results.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm italic">
                  No places found for "{query}"
                </div>
              ) : (
                results.map((r) => (
                  <button
                    key={r.place_id}
                    className="w-full px-5 py-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-white/5 text-left border-b border-gray-100 dark:border-white/5 last:border-0 group"
                    onClick={() => {
                      const name = r.display_name.split(",")[0];
                      if (activeField === "from") onSelectFrom(parseFloat(r.lat), parseFloat(r.lon), name);
                      else onSelectTo(parseFloat(r.lat), parseFloat(r.lon), name);
                      setActiveField(null);
                      setQuery("");
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      {getPlaceIcon(r)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{r.display_name.split(",")[0]}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5 uppercase tracking-tight">
                        {r.display_name.split(",").slice(1, 3).join(", ")}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
