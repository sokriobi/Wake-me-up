"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Volume2, Battery, MessageSquare, ShieldCheck, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [voiceAlerts, setVoiceAlerts] = useState(true);
  const [batterySaver, setBatterySaver] = useState(false);
  const [volume, setVolume] = useState(80);

  const SettingItem = ({ icon: Icon, label, description, children }: any) => (
    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-white/5 mb-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-medium">{label}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="px-6 pt-12 max-w-md mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your experience</p>
      </header>

      <section className="mb-8">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 ml-2">Preferences</h2>
        
        <SettingItem icon={Moon} label="Dark Mode" description="Saves battery on OLED screens">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={cn(
              "w-12 h-6 rounded-full relative transition-colors",
              darkMode ? "bg-primary" : "bg-muted"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
              darkMode ? "left-7" : "left-1"
            )} />
          </button>
        </SettingItem>

        <SettingItem icon={MessageSquare} label="Voice Alerts" description="Announce when stop is near">
           <button 
            onClick={() => setVoiceAlerts(!voiceAlerts)}
            className={cn(
              "w-12 h-6 rounded-full relative transition-colors",
              voiceAlerts ? "bg-primary" : "bg-muted"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
              voiceAlerts ? "left-7" : "left-1"
            )} />
          </button>
        </SettingItem>

        <SettingItem icon={Battery} label="Battery Saver" description="Reduced tracking frequency">
           <button 
            onClick={() => setBatterySaver(!batterySaver)}
            className={cn(
              "w-12 h-6 rounded-full relative transition-colors",
              batterySaver ? "bg-primary" : "bg-muted"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
              batterySaver ? "left-7" : "left-1"
            )} />
          </button>
        </SettingItem>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 ml-2">Audio</h2>
        <div className="p-4 bg-secondary/30 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Volume2 size={20} className="text-primary" />
              <span className="font-medium">Alarm Volume</span>
            </div>
            <span className="text-sm font-bold text-primary">{volume}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" 
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 ml-2">App Info</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-xl hover:bg-secondary/20 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-green-500" />
              <span className="text-sm">Privacy Policy</span>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-xl hover:bg-secondary/20 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Info size={18} className="text-blue-500" />
              <span className="text-sm">Version 1.0.0</span>
            </div>
            <span className="text-xs text-muted-foreground">Up to date</span>
          </div>
        </div>
      </section>

      <div className="text-center pb-8">
        <p className="text-xs text-muted-foreground">Made with ❤️ for commuters</p>
      </div>
    </div>
  );
}
