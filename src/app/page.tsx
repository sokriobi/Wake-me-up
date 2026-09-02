"use client";

import { useState } from "react";
import { Search, MapPin, Star, Bell, Navigation, Zap, ShieldCheck, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSavedPlaces } from "@/hooks/useSavedPlaces";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Home() {
  const [search, setSearch] = useState("");
  const { savedPlaces, recentPlaces } = useSavedPlaces();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"saved" | "recent" | null>(null);

  const handleSelectPlace = (lat: number, lon: number, name: string) => {
    router.push(`/tracking?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}`);
  };

  const currentList = (activeTab === "saved" ? savedPlaces : recentPlaces).filter((place) =>
    place.name.toLowerCase().includes(search.toLowerCase()) ||
    place.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[100dvh] bg-background text-foreground transition-colors duration-500">
      <div className="max-w-md mx-auto px-6 pt-16 pb-32">
        <header className="flex justify-between items-start mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-primary to-primary/40 bg-clip-text text-transparent italic uppercase">
              WakeMe
            </h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.2em] mt-1">Transit Intelligence</p>
          </motion.div>
          <Link
            href="/settings"
            aria-label="Open settings"
            className="w-12 h-12 rounded-2xl bg-secondary border border-primary/20 flex items-center justify-center relative shadow-sm active-tap"
          >
            <Bell size={20} className="text-foreground" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-background"></span>
          </Link>
        </header>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-10 group"
        >
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="text-muted-foreground group-focus-within:text-primary transition-colors" size={22} />
          </div>
          <input
            type="text"
            placeholder="Search saved destinations..."
            aria-label="Search saved destinations"
            className="w-full h-16 pl-14 pr-4 bg-secondary/80 backdrop-blur-md border-2 border-transparent focus:border-primary/20 rounded-[28px] focus:outline-none transition-all text-lg font-bold text-foreground placeholder:text-muted-foreground/40 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        {/* Hero Actions */}
        <section className="grid grid-cols-2 gap-5 mb-12">
          <Link href="/tracking" className="relative overflow-hidden group" aria-label="Start live tracking">
            <motion.div 
              whileHover={{ scale: 0.98 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-start justify-between p-7 bg-primary rounded-[40px] aspect-square shadow-[0_20px_40px_rgba(37,99,235,0.2)]"
            >
              <div className="w-14 h-14 bg-white/20 rounded-[22px] flex items-center justify-center">
                <Navigation size={28} className="text-white" fill="currentColor" />
              </div>
              <div>
                <span className="block text-2xl font-black text-white leading-tight italic">LIVE<br/>TRACKING</span>
                <span className="text-[10px] font-black text-white/60 mt-2 block uppercase tracking-[0.2em]">Start Journey</span>
              </div>
              <Zap className="absolute -right-6 -top-6 w-32 h-32 text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </motion.div>
          </Link>
          
          <div className="grid grid-rows-2 gap-5">
            <button 
              onClick={() => setActiveTab(activeTab === "saved" ? null : "saved")}
              className={cn(
                "flex items-center gap-4 p-5 rounded-[28px] transition-all group shadow-sm active-tap border-2",
                activeTab === "saved" ? "bg-primary border-primary" : "bg-secondary/80 border-transparent"
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform", activeTab === "saved" ? "bg-white/20" : "bg-yellow-500/10")}>
                <Star size={20} className={activeTab === "saved" ? "text-white" : "text-yellow-600"} fill="currentColor" />
              </div>
              <span className={cn("font-black text-[10px] uppercase tracking-widest", activeTab === "saved" ? "text-white" : "text-foreground")}>Saved</span>
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === "recent" ? null : "recent")}
              className={cn(
                "flex items-center gap-4 p-5 rounded-[28px] transition-all group shadow-sm active-tap border-2",
                activeTab === "recent" ? "bg-primary border-primary" : "bg-secondary/80 border-transparent"
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform", activeTab === "recent" ? "bg-white/20" : "bg-blue-500/10")}>
                <Clock size={20} className={activeTab === "recent" ? "text-white" : "text-blue-600"} />
              </div>
              <span className={cn("font-black text-[10px] uppercase tracking-widest", activeTab === "recent" ? "text-white" : "text-foreground")}>Recent</span>
            </button>
          </div>
        </section>

        {/* Dynamic List Section */}
        <AnimatePresence mode="wait">
          {activeTab && (
            <motion.section
              key={activeTab}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
                  {activeTab === "saved" ? "Your Favorites" : "Recent Trips"}
                </h2>
                <div className="h-[2px] flex-1 bg-primary/10 mx-4"></div>
              </div>
              
              <div className="space-y-4">
                {currentList.length === 0 ? (
                  <div className="text-center py-12 bg-secondary/30 rounded-[40px] border-2 border-dashed border-primary/10">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-loose">
                        No matching {activeTab} places found.<br/>
                      <span className="text-primary italic">Start a journey to add some!</span>
                    </p>
                  </div>
                ) : (
                  currentList.map((place, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={place.id}
                      onClick={() => handleSelectPlace(place.coords[0], place.coords[1], place.name)}
                      className="flex items-center p-6 bg-card border border-primary/20 rounded-[32px] hover:border-primary transition-all cursor-pointer group shadow-sm active-tap"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mr-5 group-hover:bg-primary group-hover:text-white transition-all">
                        {activeTab === "saved" ? <Star size={20} className="text-yellow-500" fill="currentColor" /> : <Clock size={20} className="text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-foreground truncate text-lg tracking-tight uppercase">{place.name}</h3>
                        <p className="text-[10px] text-muted-foreground font-bold truncate mt-1 tracking-widest">{place.address}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Recent Destinations */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Recent Destinations
            </h2>
            <div className="h-[1px] flex-1 bg-border mx-4"></div>
            <button className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
              Edit
            </button>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {recentPlaces.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-secondary/30 rounded-[40px] border border-dashed border-primary/20/10"
                >
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">No trip history found</p>
                </motion.div>
              ) : (
                recentPlaces.map((dest, i) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={dest.id}
                    onClick={() => handleSelectPlace(dest.coords[0], dest.coords[1], dest.name)}
                    className="flex items-center p-6 bg-secondary/50 border border-primary/20/50 rounded-[32px] hover:bg-secondary hover:border-primary/20 transition-all cursor-pointer group shadow-sm active-tap"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center mr-5 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                      <MapPin size={22} className="text-muted-foreground group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-foreground truncate text-lg tracking-tight">{dest.name}</h3>
                      <p className="text-xs text-muted-foreground font-bold truncate mt-0.5">{dest.address}</p>
                    </div>
                    <Star size={18} className="text-muted-foreground/30 hover:text-yellow-500 transition-colors ml-4" />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Premium Banner */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-8 bg-foreground text-background rounded-[40px] flex flex-col gap-6 relative overflow-hidden shadow-2xl"
        >
          <div className="flex gap-5 items-center relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-background/20 backdrop-blur-md flex-shrink-0 flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-background" size={28} />
            </div>
            <div>
              <h4 className="font-black text-lg italic uppercase leading-none">Smart Alarm</h4>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">Background Intelligence active</p>
            </div>
          </div>
          <p className="text-xs font-bold leading-relaxed opacity-80 relative z-10">
            We track your location in real-time and alert you exactly when you need to wake up.
          </p>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-background/5 rounded-full blur-3xl"></div>
        </motion.div>
      </div>
    </div>
  );
}


