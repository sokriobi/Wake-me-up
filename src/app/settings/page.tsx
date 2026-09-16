"use client";

import { useState } from "react";
import { Volume2, Info, ArrowLeft, Smartphone, Music, Check, Share2, Star, Play, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/hooks/useSettings";
import { useAlarm } from "@/hooks/useAlarm";
import { cn } from "@/lib/utils";

const ALARM_SOUNDS = [
  { id: "transit_alert", name: "Transit Alert", desc: "Balanced, dual-tone chime" },
  { id: "extreme_buzz", name: "Extreme Buzz", desc: "Loud pulse for heavy sleepers" },
  { id: "soft_chime", name: "Soft Chime", desc: "Gentle ascending melody" },
  { id: "radar", name: "Radar Pulse", desc: "High frequency ping" },
];

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { previewSound } = useAlarm(settings);
  const [copied, setCopied] = useState(false);

  const handleSoundSelect = (soundId: string) => {
    updateSettings({ alarmSound: soundId });
    previewSound(soundId, settings.volume);
  };

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "WakeMe - Smart Transit Alarm",
            text: "Never miss your bus or metro stop in Bangladesh again with WakeMe!",
            url: window.location.origin
          });
          return;
        } catch {}
      }
      try {
        await navigator.clipboard.writeText(window.location.origin);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {}
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background p-5 pt-[max(1rem,env(safe-area-inset-top,44px))] pb-32">
      <div className="max-w-[420px] mx-auto space-y-8">
        {/* iOS Header */}
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <Link href="/tracking" className="w-11 h-11 bg-card rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm active-tap">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black italic tracking-tight uppercase leading-none">Settings</h1>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Preferences & Audio</p>
            </div>
          </div>
          <button 
            onClick={handleShare}
            className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center text-primary active-tap relative"
            title="Share WakeMe"
          >
            {copied ? <CheckCheck size={18} className="text-emerald-500" /> : <Share2 size={18} />}
            {copied && (
              <span className="absolute -bottom-6 right-0 text-[8px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg">
                Link Copied!
              </span>
            )}
          </button>
        </header>

        {/* Alarm Melody Selection */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Music size={15} className="text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground italic">Alarm Melody</h2>
            </div>
            <span className="text-[8px] font-bold text-muted-foreground/60 uppercase">Tap to Preview</span>
          </div>
          
          <div className="grid gap-2">
            {ALARM_SOUNDS.map((sound) => {
              const isSelected = settings.alarmSound === sound.id;
              return (
                <button
                  key={sound.id}
                  onClick={() => handleSoundSelect(sound.id)}
                  className={cn(
                    "p-3.5 rounded-2xl border-2 transition-all text-left flex items-center justify-between group active-tap",
                    isSelected 
                      ? "bg-primary/10 border-primary shadow-sm" 
                      : "bg-card border-primary/10 hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                      isSelected ? "bg-primary text-white" : "bg-secondary text-muted-foreground group-hover:text-foreground"
                    )}>
                      <Play size={14} fill="currentColor" />
                    </div>
                    <div>
                      <p className={cn("text-xs font-black uppercase tracking-wider", isSelected ? "text-primary" : "text-foreground")}>
                        {sound.name}
                      </p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5 opacity-70">
                        {sound.desc}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-sm">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Vibration & Volume Controls */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Smartphone size={15} className="text-emerald-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground italic">Alert Controls</h2>
          </div>
          
          <div className="bg-card border border-primary/15 rounded-2xl overflow-hidden shadow-sm divide-y divide-border/20">
            {/* Vibration Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Smartphone size={16} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-foreground">Haptic Vibration</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Vibrate on arrival</p>
                </div>
              </div>
              <button 
                onClick={() => updateSettings({ vibrate: !settings.vibrate })}
                aria-label="Toggle vibration"
                className={cn(
                  "w-12 h-7 rounded-full transition-all relative p-1 active-tap",
                  settings.vibrate ? "bg-primary" : "bg-secondary"
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full shadow-md transition-all",
                  settings.vibrate ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>
            
            {/* Volume Slider */}
            <div className="p-4 space-y-2.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Volume2 size={16} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-wider text-foreground">Alarm Volume</p>
                </div>
                <span className="text-xs font-black text-primary italic">{settings.volume}%</span>
              </div>
              <input 
                type="range" 
                min="10"
                max="100"
                value={settings.volume}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  updateSettings({ volume: val });
                }}
                onMouseUp={() => previewSound(settings.alarmSound, settings.volume)}
                onTouchEnd={() => previewSound(settings.alarmSound, settings.volume)}
                aria-label="Adjust alarm volume"
                className="w-full h-2 bg-secondary rounded-full appearance-none accent-primary cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* App Info Card */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Info size={15} className="text-amber-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground italic">About WakeMe</h2>
          </div>
          <div className="p-6 bg-foreground text-background rounded-3xl shadow-xl relative overflow-hidden group">
            <div className="relative z-10 space-y-1.5">
              <p className="text-xl font-black italic tracking-tight leading-none uppercase">WakeMe iOS Edition</p>
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest leading-relaxed">
                Optimized for iPhone 13 Pro • Web Audio API • Bangladesh Transit Index.
              </p>
              <div className="pt-2">
                <span className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-background/20 text-background">
                  v1.2.5 • iOS Ready
                </span>
              </div>
            </div>
            <Star className="absolute -right-8 -bottom-8 w-32 h-32 text-background/5 -rotate-12 group-hover:scale-105 transition-transform duration-500" />
          </div>
        </section>
      </div>
    </div>
  );
}
