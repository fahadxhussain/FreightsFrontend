'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-10 w-10" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted transition-all duration-300 hover:border-accent hover:text-accent group overflow-hidden",
        isDark ? "shadow-inner" : "shadow-sm"
      )}
      aria-label="Toggle theme"
    >
      <div className="relative h-6 w-6">
        <Sun 
          size={22} 
          weight="bold"
          className={cn(
            "absolute inset-0 transition-all duration-500 transform",
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
          )} 
        />
        <Moon 
          size={22} 
          weight="bold"
          className={cn(
            "absolute inset-0 transition-all duration-500 transform",
            isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          )} 
        />
      </div>
      <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
