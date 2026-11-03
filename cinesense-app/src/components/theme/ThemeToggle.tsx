"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 opacity-50" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to white/light mode" : "Switch to dark mode"}
      className="relative flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 shadow-sm transition-all cursor-pointer active:scale-95"
    >
      {isDark ? (
        <Sun size={16} className="text-amber-400 animate-in spin-in-180 duration-200" />
      ) : (
        <Moon size={16} className="text-[#6332c9] animate-in spin-in-180 duration-200" />
      )}
    </button>
  );
}

