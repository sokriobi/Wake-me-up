"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, Shield, Moon, Volume2, Info, ChevronRight, ArrowLeft, Sun, Smartphone, Music, Check, Share2, Star } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

const ALARM_SOUNDS = [
  { id: "transit_alert", name: "Transit Alert", desc: "Balanced & clear" },
  { id: "extreme_buzz", name: "Extreme Buzz", desc: "For heavy sleepers" },
  { id: "soft_chime", name: "Soft Chime", desc: "Gentle wake up" },
  { id: "radar", name: "Radar Pulse", desc: "High frequency" },
];

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="min-h-screen bg-background p-6 pt-16 pb-40">
      <div className="max-w-lg mx-auto space-y-12">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <Link href="/tracking" className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm active:scale-90 transition-transform">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Settings</h1>
          </div>
          <button className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary active:scale-90 transition-transform">
            <Share2 size={22} />
          </button>
        </header>

        {/* Alarm Customization */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Music size={18} className="text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">Alarm Configuration</h2>
          </div>
          
          <div className="grid gap-3">
            {ALARM_SOUNDS.map((sound) => (
              <button
                key={sound.id}
                onClick={() => updateSettings({ alarmSound: sound.id })}
                className={cn(
                  "p-5 rounded-[28px] border-2 transition-all text-left flex items-center justify-between group",
                  settings.alarmSound === sound.id 
                    ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                    : "bg-card border-primary/20 hover:border-primary/40"
                )}
              >
                <div>
                  <p className={cn("text-sm font-black uppercase tracking-widest", settings.alarmSound === sound.id ? "text-primary" : "text-foreground")}>
                    {sound.name}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                    {sound.desc}
                  </p>
                </div>
                {settings.alarmSound === sound.id && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                    <Check size={16} strokeWidth={4} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Haptic & Volume */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Smartphone size={18} className="text-emerald-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">System Preferences</h2>
          </div>
          
          <div className="bg-card border border-primary/20 rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-6 flex items-center justify-between border-b border-primary/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Smartphone size={20} />
                </div>
                <p className="text-xs font-black uppercase tracking-widest">Vibration Alert</p>
              </div>
              <button 
                onClick={() => updateSettings({ vibrate: !settings.vibrate })}
                className={cn(
                  "w-14 h-8 rounded-full transition-all relative p-1",
                  settings.vibrate ? "bg-primary" : "bg-muted"
                )}
              >
                <div className={cn(
                  "w-6 h-6 bg-white rounded-full shadow-sm transition-all",
                  settings.vibrate ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Volume2 size={20} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest">Alert Volume</p>
                </div>
                <span className="text-[10px] font-black text-primary">{settings.volume}%</span>
              </div>
              <input 
                type="range" 
                value={settings.volume}
                onChange={(e) => updateSettings({ volume: parseInt(e.target.value) })}
                className="w-full h-2 bg-secondary rounded-full appearance-none accent-primary cursor-pointer"
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Info size={18} className="text-amber-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">App Information</h2>
          </div>
          <div className="p-8 bg-foreground text-background rounded-[40px] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-2xl font-black italic tracking-tighter leading-none uppercase mb-2">WakeMe Premium</p>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest leading-relaxed">
                Enjoy ad-free tracking and custom sounds.
              </p>
              <button className="mt-6 px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                Upgrade Now
              </button>
            </div>
            <Star className="absolute -right-8 -bottom-8 w-40 h-40 text-background/5 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </section>
      </div>
    </div>
  );
}
