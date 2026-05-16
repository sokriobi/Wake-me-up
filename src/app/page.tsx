"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Star, History, Bell, Navigation, Zap, ShieldCheck, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Home() {
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<{id: number, name: string, address: string}[]>([]);
  const [recentStops, setRecentStops] = useState<{id: number, name: string, address: string}[]>([]);

  useEffect(() => {
    const savedFavs = localStorage.getItem("favorites");
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    
    const savedRecents = localStorage.getItem("recent_destinations");
    if (savedRecents) setRecentStops(JSON.parse(savedRecents));
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      <div className="max-w-md mx-auto px-6 pt-16 pb-32">
        <header className="flex justify-between items-start mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-white via-white to-white/20 bg-clip-text text-transparent italic">
              WAKE ME
            </h1>
            <p className="text-gray-500 font-medium mt-1">Smart Transit Alarm</p>
          </motion.div>
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative"
          >
            <Bell size={20} className="text-gray-400" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0a0a0a]"></span>
          </motion.button>
        </header>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-10 group"
        >
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="text-gray-500 group-focus-within:text-blue-500 transition-colors" size={22} />
          </div>
          <input
            type="text"
            placeholder="Search destination..."
            className="w-full h-16 pl-14 pr-4 bg-white/5 border border-white/5 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-lg font-medium placeholder:text-gray-600 focus:bg-white/10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        {/* Hero Actions */}
        <section className="grid grid-cols-2 gap-4 mb-12">
          <Link href="/tracking" className="relative overflow-hidden group">
            <motion.div 
              whileHover={{ scale: 0.98 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-start justify-between p-6 bg-blue-600 rounded-[32px] aspect-square shadow-2xl shadow-blue-600/20"
            >
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Navigation size={24} className="text-white" fill="currentColor" />
              </div>
              <div>
                <span className="block text-xl font-black text-white leading-tight">LIVE<br/>TRACKING</span>
                <span className="text-xs font-bold text-blue-100/60 mt-2 block uppercase tracking-widest">Start Trip</span>
              </div>
              <Zap className="absolute -right-4 -top-4 w-32 h-32 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            </motion.div>
          </Link>
          
          <div className="grid grid-rows-2 gap-4">
            <button className="flex items-center gap-4 p-5 bg-white/5 border border-white/5 rounded-[24px] hover:bg-white/10 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star size={20} className="text-yellow-500" fill="currentColor" />
              </div>
              <span className="font-bold text-sm tracking-tight text-gray-300">Favorites</span>
            </button>
            <button className="flex items-center gap-4 p-5 bg-white/5 border border-white/5 rounded-[24px] hover:bg-white/10 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock size={20} className="text-blue-400" />
              </div>
              <span className="font-bold text-sm tracking-tight text-gray-300">History</span>
            </button>
          </div>
        </section>

        {/* Recent Destinations */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
              Recent Stops
            </h2>
            <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full">
              See All
            </button>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {recentStops.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-white/[0.02] rounded-[32px] border border-dashed border-white/5"
                >
                  <p className="text-sm text-gray-600 font-medium">No recent trips yet.</p>
                </motion.div>
              ) : (
                recentStops.map((dest, i) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={dest.id}
                    className="flex items-center p-5 bg-white/5 border border-white/5 rounded-[28px] hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mr-4 group-hover:bg-blue-600/20 transition-colors">
                      <MapPin size={22} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-200 truncate">{dest.name}</h3>
                      <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{dest.address}</p>
                    </div>
                    <Star size={18} className="text-gray-700 hover:text-yellow-500 transition-colors ml-4" />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Safety Tip */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/10 rounded-[32px] flex gap-5 items-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex-shrink-0 flex items-center justify-center shadow-inner">
            <ShieldCheck className="text-blue-500" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-blue-200">Safety First</h4>
            <p className="text-xs text-blue-100/40 leading-relaxed mt-1 font-medium">
              We'll notify you even when the app is in background. Sleep tight!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

