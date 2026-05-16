"use client";

import { motion } from "framer-motion";
import { Bell, Shield, Moon, Volume2, Info, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const settingsGroups = [
    {
      title: "App Settings",
      items: [
        { icon: Bell, label: "Alarm Sound", value: "Transit Alert", color: "text-blue-500" },
        { icon: Volume2, label: "Volume", value: "80%", color: "text-emerald-500" },
        { icon: Moon, label: "Dark Mode", value: "System", color: "text-purple-500" },
      ]
    },
    {
      title: "Security & Privacy",
      items: [
        { icon: Shield, label: "Location Privacy", value: "Always On", color: "text-rose-500" },
        { icon: Info, label: "About WakeMe", value: "v1.2.4", color: "text-amber-500" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6 pt-16 pb-40">
      <div className="max-w-lg mx-auto space-y-10">
        <header className="flex items-center gap-6 mb-12">
          <Link href="/tracking" className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center border border-border shadow-sm active:scale-90 transition-transform">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Settings</h1>
        </header>

        {settingsGroups.map((group) => (
          <section key={group.title} className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground italic px-2">
              {group.title}
            </h2>
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[32px] overflow-hidden shadow-sm">
              {group.items.map((item, idx) => (
                <button
                  key={item.label}
                  className={`w-full p-6 flex items-center justify-between hover:bg-secondary/50 transition-all active:bg-secondary ${idx !== group.items.length - 1 ? "border-b border-border/50" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border/50 shadow-inner ${item.color}`}>
                      <item.icon size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black uppercase tracking-widest">{item.label}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{item.value}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </section>
        ))}

        <div className="p-8 bg-primary rounded-[40px] text-white flex flex-col gap-4 relative overflow-hidden shadow-2xl shadow-primary/20">
          <p className="text-2xl font-black italic tracking-tighter leading-none uppercase">Go Premium</p>
          <p className="text-xs font-bold opacity-80 uppercase tracking-widest leading-relaxed">
            Unlock more alarm sounds and unlimited saved places.
          </p>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
