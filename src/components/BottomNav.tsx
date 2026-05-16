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
  ];

  return (
    <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-24 bg-card/80 backdrop-blur-3xl border border-border rounded-[40px] flex items-center justify-around px-6 shadow-[0_25px_60px_rgba(0,0,0,0.1)] z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className="relative flex flex-col items-center justify-center w-20 h-20 group"
          >
            {isActive && (
              <motion.div 
                layoutId="nav-active"
                className="absolute inset-0 bg-primary/10 rounded-3xl border border-primary/20"
                transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
              />
            )}
            <div className={cn(
              "relative transition-all duration-300 flex flex-col items-center gap-1",
              isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )}>
              <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} fillOpacity={0.15} />
              <span className="text-[9px] font-black uppercase tracking-[0.15em]">{item.label}</span>
            </div>
          </Link>
        );
      })}

      {/* Theme Toggle Button */}
      <button
        onClick={onToggleTheme}
        className="relative flex flex-col items-center justify-center w-20 h-20 group"
      >
        <div className="relative transition-all duration-300 flex flex-col items-center gap-1 text-muted-foreground group-hover:text-foreground">
          {theme === "dark" ? (
            <>
              <Sun size={26} strokeWidth={2} />
              <span className="text-[9px] font-black uppercase tracking-[0.15em]">Light</span>
            </>
          ) : (
            <>
              <Moon size={26} strokeWidth={2} />
              <span className="text-[9px] font-black uppercase tracking-[0.15em]">Dark</span>
            </>
          )}
        </div>
      </button>

      <Link
        href="/settings"
        className="relative flex flex-col items-center justify-center w-20 h-20 group"
      >
        <div className={cn(
          "relative transition-all duration-300 flex flex-col items-center gap-1",
          pathname === "/settings" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}>
          <Settings size={26} strokeWidth={2} />
          <span className="text-[9px] font-black uppercase tracking-[0.15em]">Set</span>
        </div>
      </Link>
    </nav>
  );
}


