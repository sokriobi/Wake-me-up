"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchProps {
  onSelect: (lat: number, lon: number, name: string) => void;
}

export function LocationSearch({ onSelect }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          // Nominatim API with Bangladesh restriction
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              query
            )}&countrycodes=bd&limit=5`
          );
          const data = await response.json();
          setResults(data);
          setShowResults(true);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-4 text-muted-foreground" size={20} />
        <input
          type="text"
          placeholder="Search location in Bangladesh..."
          className="w-full h-14 pl-12 pr-12 bg-secondary/80 backdrop-blur-md border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 2 && setShowResults(true)}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 p-1 hover:bg-white/10 rounded-full"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {showResults && (results.length > 0 || loading) && (
        <div className="absolute top-16 left-0 right-0 bg-secondary/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-[100] shadow-2xl">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.place_id}
                  className="w-full p-4 flex items-start gap-3 hover:bg-primary/20 transition-colors text-left border-b border-white/5 last:border-0"
                  onClick={() => {
                    onSelect(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
                    setQuery("");
                    setShowResults(false);
                  }}
                >
                  <MapPin className="mt-1 text-primary shrink-0" size={18} />
                  <div>
                    <p className="text-sm font-medium text-white line-clamp-1">
                      {result.display_name.split(",")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {result.display_name.split(",").slice(1).join(",")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
