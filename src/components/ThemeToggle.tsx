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
    return <div className="h-9 w-9" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-canvas text-muted transition-colors hover:border-hairline hover:text-ink overflow-hidden",
      )}
      aria-label="Toggle theme"
    >
      <div className="relative h-5 w-5">
        <Sun 
          size={20} 
          weight="regular"
          className={cn(
            "absolute inset-0 transition-all duration-300",
            isDark ? "opacity-100" : "opacity-0"
          )} 
        />
        <Moon 
          size={20} 
          weight="regular"
          className={cn(
            "absolute inset-0 transition-all duration-300",
            isDark ? "opacity-0" : "opacity-100"
          )} 
        />
      </div>
    </button>
  );
}
