"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Navigation, Settings, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BottomNavProps {
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export function BottomNav({ theme, onToggleTheme }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Navigation, label: "Track", href: "/tracking" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <nav 
      aria-label="Main navigation" 
      className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,16px))] left-1/2 -translate-x-1/2 w-[calc(100%-1.75rem)] max-w-[390px] h-18 bg-card/90 backdrop-blur-2xl border border-primary/20 rounded-[32px] flex items-center justify-around px-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] z-[100]"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className="relative flex flex-col items-center justify-center flex-1 h-14 group outline-none select-none active-tap"
          >
            {isActive && (
              <motion.div 
                layoutId="nav-active"
                className="absolute inset-1 bg-primary/15 rounded-2xl border border-primary/25"
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              />
            )}
            <div className={cn(
              "relative transition-all duration-200 flex flex-col items-center gap-0.5",
              isActive ? "text-primary scale-105" : "text-muted-foreground group-hover:text-foreground"
            )}>
              <item.icon size={21} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} fillOpacity={0.15} />
              <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
            </div>
          </Link>
        );
      })}

      {/* Theme Toggle Button */}
      <button
        onClick={onToggleTheme}
        aria-label="Toggle dark/light theme"
        className="relative flex flex-col items-center justify-center flex-1 h-14 group outline-none select-none active-tap"
      >
        <div className="relative transition-all duration-200 flex flex-col items-center gap-0.5 text-muted-foreground group-hover:text-foreground">
          {theme === "dark" ? (
            <>
              <Sun size={21} strokeWidth={2} />
              <span className="text-[9px] font-black uppercase tracking-wider">Light</span>
            </>
          ) : (
            <>
              <Moon size={21} strokeWidth={2} />
              <span className="text-[9px] font-black uppercase tracking-wider">Dark</span>
            </>
          )}
        </div>
      </button>
    </nav>
  );
}
