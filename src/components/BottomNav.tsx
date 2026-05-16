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
    { icon: Settings, label: "Set", href: "/settings" },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md h-24 bg-card/90 backdrop-blur-3xl border border-primary/20/50 rounded-[44px] flex items-center justify-around px-4 shadow-[0_25px_80px_rgba(0,0,0,0.2)] z-[100] active-tap">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className="relative flex flex-col items-center justify-center w-20 h-20 group outline-none"
          >
            {isActive && (
              <motion.div 
                layoutId="nav-active"
                className="absolute inset-2 bg-primary/10 rounded-[28px] border border-primary/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className={cn(
              "relative transition-all duration-300 flex flex-col items-center gap-1",
              isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground"
            )}>
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} fillOpacity={0.15} />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">{item.label}</span>
            </div>
          </Link>
        );
      })}

      {/* Theme Toggle Integrated */}
      <button
        onClick={onToggleTheme}
        className="relative flex flex-col items-center justify-center w-20 h-20 group active:scale-90 transition-transform"
      >
        <div className="relative transition-all duration-300 flex flex-col items-center gap-1 text-muted-foreground group-hover:text-foreground">
          {theme === "dark" ? (
            <>
              <Sun size={24} strokeWidth={2} />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Light</span>
            </>
          ) : (
            <>
              <Moon size={24} strokeWidth={2} />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Dark</span>
            </>
          )}
        </div>
      </button>
    </nav>
  );
}



