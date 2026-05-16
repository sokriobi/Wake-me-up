"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Navigation, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Navigation, label: "Track", href: "/tracking" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-20 bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] flex items-center justify-around px-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className="relative flex flex-col items-center justify-center w-16 h-16 group"
          >
            {isActive && (
              <motion.div 
                layoutId="nav-active"
                className="absolute inset-0 bg-blue-600/10 rounded-2xl border border-blue-500/20"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              />
            )}
            <div className={cn(
              "relative transition-all duration-300 flex flex-col items-center gap-1",
              isActive ? "text-blue-500" : "text-gray-500 group-hover:text-gray-300"
            )}>
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} fillOpacity={0.1} />
              <span className="text-[10px] font-black uppercase tracking-[0.1em]">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

