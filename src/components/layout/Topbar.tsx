"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MagnifyingGlass,
  BellSimple,
  BookmarkSimple,
} from "@phosphor-icons/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppSelector } from "@/store/hooks";

// TODO: Replace with real notifications API endpoint (e.g. GET /notifications/unread-count)
// when the backend notifications service is implemented.
function getNotificationCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const stored = localStorage.getItem("notificationCount");
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

export function Topbar() {
  const [notifCount, setNotifCount] = useState(0);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    // TODO: Replace with API call: api.get("/notifications/unread-count")
    setNotifCount(getNotificationCount());
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-8">
      <div className="relative flex w-full max-w-[420px] items-center rounded-2xl border border-border bg-input px-4 py-2.5 shadow-inner">
        <MagnifyingGlass size={18} weight="bold" className="text-muted" />
        <input
          placeholder="Search origin, destination, or load ID..."
          className="w-full bg-transparent text-[13px] font-medium text-foreground outline-none placeholder:text-muted"
        />
      </div>

      <div className="flex items-center gap-6">
        {(user?.role === "driver" ||
          user?.role === "independent_driver" ||
          user?.role === "company_driver") && (
          <Link
            href="/my-bookings"
            className="btn btn-secondary h-10 px-4 text-xs font-bold shadow-sm"
          >
            <BookmarkSimple size={18} weight="bold" />
            My Bookings
          </Link>
        )}

        <div className="flex items-center gap-4 border-l border-border pl-6">
          <ThemeToggle />

          <Link
            href="/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted transition-all hover:border-muted hover:text-foreground"
          >
            <BellSimple size={20} weight="bold" />
            {notifCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-black text-white shadow-sm">
                {notifCount > 99 ? "99+" : notifCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
