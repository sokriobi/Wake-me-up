"use client";

import { useState } from "react";
import { 
  Search, 
  MapPin, 
  Star, 
  Bell, 
  Navigation, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Home as HomeIcon, 
  Briefcase, 
  Trash2,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Train,
  Bus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSavedPlaces } from "@/hooks/useSavedPlaces";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { searchLocalPlaces } from "@/lib/bangladeshPlaces";

export default function Home() {
  const [search, setSearch] = useState("");
  const { savedPlaces, recentPlaces, homePlace, officePlace, removeSaved, removeRecent } = useSavedPlaces();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"saved" | "recent" | null>(null);

  const handleSelectPlace = (lat: number, lon: number, name: string) => {
    router.push(`/tracking?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}`);
  };

  const handleCommuteTrip = (fromType: "home" | "office", toType: "home" | "office") => {
    const target = toType === "office" ? officePlace : homePlace;
    if (target && target.coords) {
      handleSelectPlace(target.coords[0], target.coords[1], target.name);
    } else {
      router.push("/tracking");
    }
  };

  const searchResults = search.trim() ? searchLocalPlaces(search) : [];

  const currentList = (activeTab === "saved" ? savedPlaces : recentPlaces).filter((place) =>
    place.name.toLowerCase().includes(search.toLowerCase()) ||
    place.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[100dvh] bg-background text-foreground transition-colors duration-500 pt-[max(1rem,env(safe-area-inset-top,44px))]">
      <div className="max-w-[420px] mx-auto px-5 pb-32 space-y-6">
        
        {/* iOS Native Header */}
        <header className="flex justify-between items-center pt-2">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">GPS Transit Guard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-br from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent italic uppercase leading-none">
              WakeMe
            </h1>
          </motion.div>
          <Link
            href="/settings"
            aria-label="Open settings"
            className="w-11 h-11 rounded-2xl bg-secondary/80 border border-primary/20 flex items-center justify-center relative shadow-sm active-tap"
          >
            <Bell size={18} className="text-foreground" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-background"></span>
          </Link>
        </header>

        {/* Daily Smart Commute Card (Morning / Evening Routine) */}
        <div className="bg-gradient-to-br from-card to-secondary/60 p-4 rounded-[28px] border border-primary/20 shadow-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
              <Sun size={13} className="text-amber-400" /> Daily Commute Routine
            </span>
            <span className="text-[8px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              1-Tap Wake
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Morning: Go to Office */}
            <button
              onClick={() => handleCommuteTrip("home", "office")}
              className="p-3 bg-secondary/70 hover:bg-secondary rounded-2xl border border-primary/10 flex flex-col items-start gap-1 text-left transition-all active-tap group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Briefcase size={14} />
                </div>
                <ArrowRight size={13} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="text-xs font-black text-foreground uppercase">To Office</p>
                <p className="text-[8px] text-muted-foreground font-bold truncate">
                  {officePlace ? officePlace.name : "Set in Settings"}
                </p>
              </div>
            </button>

            {/* Evening: Go Home */}
            <button
              onClick={() => handleCommuteTrip("office", "home")}
              className="p-3 bg-secondary/70 hover:bg-secondary rounded-2xl border border-primary/10 flex flex-col items-start gap-1 text-left transition-all active-tap group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <HomeIcon size={14} />
                </div>
                <ArrowRight size={13} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="text-xs font-black text-foreground uppercase">To Home</p>
                <p className="text-[8px] text-muted-foreground font-bold truncate">
                  {homePlace ? homePlace.name : "Set in Settings"}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Search Bar with Instant Local Matching */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative group"
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search stops (e.g. Azampur, Abdullahpur)..."
            aria-label="Search destinations"
            className="w-full h-14 pl-12 pr-4 bg-secondary/80 backdrop-blur-md border-2 border-transparent focus:border-primary/30 rounded-2xl focus:outline-none transition-all text-base font-bold text-foreground placeholder:text-muted-foreground/40 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Instant Search Dropdown */}
          {search.trim().length > 0 && (
            <div className="absolute top-[105%] left-0 right-0 bg-background/98 backdrop-blur-3xl border border-primary/25 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 ios-scroll">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground font-bold">
                  No transit matches for &quot;{search}&quot;
                </div>
              ) : (
                searchResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPlace(p.lat, p.lon, p.name)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-primary/10 transition-colors border-b border-border/20 last:border-0 active-tap"
                  >
                    <MapPin size={16} className="text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{p.area}, {p.city}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </motion.div>

        {/* Hero Actions Grid */}
        <section className="grid grid-cols-2 gap-3.5">
          <Link href="/tracking" className="relative overflow-hidden group" aria-label="Start live tracking">
            <motion.div 
              whileHover={{ scale: 0.98 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-start justify-between p-5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[30px] aspect-square shadow-[0_15px_35px_rgba(37,99,235,0.3)]"
            >
              <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
                <Navigation size={22} className="text-white" fill="currentColor" />
              </div>
              <div>
                <span className="block text-xl font-black text-white leading-tight italic uppercase">LIVE<br/>TRACKING</span>
                <span className="text-[9px] font-black text-white/70 mt-1 block uppercase tracking-wider">Start Journey</span>
              </div>
              <Zap className="absolute -right-5 -top-5 w-24 h-24 text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            </motion.div>
          </Link>
          
          <div className="grid grid-rows-2 gap-3">
            <button 
              onClick={() => setActiveTab(activeTab === "saved" ? null : "saved")}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-2xl transition-all group shadow-sm active-tap border-2 text-left",
                activeTab === "saved" ? "bg-primary border-primary" : "bg-secondary/80 border-transparent"
              )}
            >
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-transform shrink-0", activeTab === "saved" ? "bg-white/20" : "bg-yellow-500/10")}>
                <Star size={16} className={activeTab === "saved" ? "text-white" : "text-yellow-600"} fill="currentColor" />
              </div>
              <div>
                <span className={cn("font-black text-[10px] uppercase tracking-wider block", activeTab === "saved" ? "text-white" : "text-foreground")}>Fixed</span>
                <span className={cn("text-[8px] font-bold block", activeTab === "saved" ? "text-white/70" : "text-muted-foreground")}>{savedPlaces.length} places</span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === "recent" ? null : "recent")}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-2xl transition-all group shadow-sm active-tap border-2 text-left",
                activeTab === "recent" ? "bg-primary border-primary" : "bg-secondary/80 border-transparent"
              )}
            >
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-transform shrink-0", activeTab === "recent" ? "bg-white/20" : "bg-blue-500/10")}>
                <Clock size={16} className={activeTab === "recent" ? "text-white" : "text-blue-600"} />
              </div>
              <div>
                <span className={cn("font-black text-[10px] uppercase tracking-wider block", activeTab === "recent" ? "text-white" : "text-foreground")}>Recent</span>
                <span className={cn("text-[8px] font-bold block", activeTab === "recent" ? "text-white/70" : "text-muted-foreground")}>{recentPlaces.length} trips</span>
              </div>
            </button>
          </div>
        </section>

        {/* Dynamic Tab List Section */}
        <AnimatePresence mode="wait">
          {activeTab && (
            <motion.section
              key={activeTab}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary italic">
                  {activeTab === "saved" ? "Fixed Locations" : "Recent Trips"}
                </h2>
                <div className="h-[1px] flex-1 bg-primary/10 mx-3"></div>
              </div>
              
              <div className="space-y-2.5">
                {currentList.length === 0 ? (
                  <div className="text-center py-8 bg-secondary/30 rounded-2xl border border-dashed border-primary/15">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                      No {activeTab} locations found
                    </p>
                  </div>
                ) : (
                  currentList.map((place, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      key={place.id}
                      className="flex items-center justify-between p-3.5 bg-card border border-primary/15 rounded-2xl hover:border-primary transition-all group shadow-sm"
                    >
                      <button
                        onClick={() => handleSelectPlace(place.coords[0], place.coords[1], place.name)}
                        className="flex items-center flex-1 min-w-0 text-left active-tap"
                      >
                        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center mr-3 shrink-0">
                          {place.type === "home" ? (
                            <HomeIcon size={16} className="text-blue-500" />
                          ) : place.type === "office" ? (
                            <Briefcase size={16} className="text-purple-500" />
                          ) : activeTab === "saved" ? (
                            <Star size={16} className="text-yellow-500" fill="currentColor" />
                          ) : (
                            <Clock size={16} className="text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-foreground truncate text-xs uppercase">{place.name}</h3>
                          <p className="text-[9px] text-muted-foreground font-bold truncate mt-0.5">{place.address}</p>
                        </div>
                      </button>

                      <button
                        onClick={() => activeTab === "saved" ? removeSaved(place.id) : removeRecent(place.id)}
                        className="p-2 text-muted-foreground/40 hover:text-rose-500 transition-colors ml-1 active-tap"
                        title="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 bg-card border border-primary/15 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Bus size={16} />
            </div>
            <div>
              <p className="text-[11px] font-black text-foreground uppercase">Bus & Metro</p>
              <p className="text-[8px] text-muted-foreground font-bold">Bangladesh Lines</p>
            </div>
          </div>

          <div className="p-3.5 bg-card border border-primary/15 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-[11px] font-black text-foreground uppercase">100% Offline</p>
              <p className="text-[8px] text-muted-foreground font-bold">Web Audio Synth</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
