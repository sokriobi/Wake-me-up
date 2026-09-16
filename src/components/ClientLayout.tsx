"use client";

import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { usePathname } from "next/navigation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) {
      setTimeout(() => setTheme(savedTheme), 0);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTimeout(() => setTheme("dark"), 0);
    }
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

  return (
    <div className="flex flex-col min-h-[100dvh] relative">
      <main className="flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom,20px))]">
        {children}
      </main>
      <BottomNav theme={theme} onToggleTheme={toggleTheme} />
    </div>
  );
}
