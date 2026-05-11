"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BellSimple,
  BookmarkSimple,
  CurrencyDollar,
  MapPin,
  ChatTeardrop,
  Warning,
  Check,
  ArrowRight,
  CircleNotch,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NotificationType =
  | "booking"
  | "payment"
  | "tracking"
  | "message"
  | "support";

interface Notification {
  _id: string;
  title: string;
  description: string;
  timeAgo: string;
  type: NotificationType;
  unread: boolean;
  createdAt: string;
  link?: string;
}

// ---------------------------------------------------------------------------
// Icon + colour mapping
// ---------------------------------------------------------------------------

const NOTIFICATION_META: Record<
  NotificationType,
  { icon: typeof BookmarkSimple; color: string }
> = {
  booking: { icon: BookmarkSimple, color: "indigo" },
  payment: { icon: CurrencyDollar, color: "success" },
  tracking: { icon: MapPin, color: "amber" },
  message: { icon: ChatTeardrop, color: "accent" },
  support: { icon: Warning, color: "danger" },
};

const TABS = [
  "All",
  "Booking",
  "Payment",
  "Tracking",
  "Messages",
  "System",
] as const;

const TAB_TYPE_MAP: Record<string, NotificationType[]> = {
  All: ["booking", "payment", "tracking", "message", "support"],
  Booking: ["booking"],
  Payment: ["payment"],
  Tracking: ["tracking"],
  Messages: ["message"],
  System: ["support"],
};

function getLink(notif: Notification): string | null {
  if (notif.link) return notif.link;

  // Derive link from type if no explicit link
  const loadIdMatch = notif.description.match(/FL-(\w+)/i);
  const loadId = loadIdMatch ? loadIdMatch[1] : null;

  switch (notif.type) {
    case "booking":
      return loadId ? `/loads/${loadId}` : "/my-bookings";
    case "payment":
      return "/payments";
    case "tracking":
      return loadId ? `/tracking/${loadId}` : null;
    case "message":
      return "/messaging";
    case "support":
      return "/support";
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function NotificationsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>("All");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  // -----------------------------------------------------------------------
  // Fetch notifications
  // -----------------------------------------------------------------------

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/notifications");
      const data: Notification[] =
        res.data?.data?.notifications ?? res.data?.data ?? [];
      setNotifications(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || "Failed to load notifications";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // -----------------------------------------------------------------------
  // Mark all as read
  // -----------------------------------------------------------------------

  const handleMarkAllRead = async () => {
    setMarkingAllRead(true);
    try {
      await api.put("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      toast.success("All notifications marked as read");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || "Failed to mark all as read";
      toast.error(msg);
    } finally {
      setMarkingAllRead(false);
    }
  };

  // -----------------------------------------------------------------------
  // Derived
  // -----------------------------------------------------------------------

  const allowedTypes = TAB_TYPE_MAP[activeTab] || TAB_TYPE_MAP["All"];
  const filteredNotifications = notifications.filter((n) =>
    allowedTypes.includes(n.type),
  );

  const unreadCount = notifications.filter((n) => n.unread).length;

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  const renderIcon = (type: NotificationType) => {
    const meta = NOTIFICATION_META[type];
    const Icon = meta.icon;
    const colorClass =
      meta.color === "success"
        ? "bg-success text-white shadow-success/20"
        : meta.color === "indigo"
          ? "bg-indigo text-white shadow-indigo/20"
          : meta.color === "amber"
            ? "bg-amber-500 text-white shadow-amber-500/20"
            : meta.color === "danger"
              ? "bg-danger text-white shadow-danger/20"
              : "bg-accent text-white shadow-accent/20";

    return (
      <div
        className={cn(
          "h-16 w-16 flex items-center justify-center rounded-2xl shadow-lg flex-shrink-0 transition-transform group-hover:scale-110",
          colorClass,
        )}
      >
        <Icon size={28} weight="bold" />
      </div>
    );
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="text-sm font-bold text-muted uppercase tracking-widest mt-1">
            Stay updated with your latest logistics activity
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || markingAllRead}
          className={cn(
            "btn h-12 px-6 text-[11px] font-black uppercase tracking-widest shadow-sm transition-all",
            unreadCount === 0
              ? "btn-secondary opacity-50 cursor-not-allowed"
              : "btn-secondary",
          )}
        >
          {markingAllRead ? (
            <CircleNotch size={14} weight="bold" className="animate-spin" />
          ) : (
            <>
              <Check size={14} weight="bold" className="mr-1" />
              Mark all as read
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "whitespace-nowrap px-6 py-3 text-[11px] font-black uppercase tracking-wider rounded-2xl border transition-all",
              activeTab === tab
                ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                : "bg-card border-border text-muted hover:border-muted hover:text-foreground",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="rounded-3xl border border-border bg-card shadow-2xl overflow-hidden divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 flex items-center gap-6 animate-pulse">
              <div className="h-16 w-16 rounded-2xl bg-muted/20 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-40 bg-muted/20 rounded-lg" />
                <div className="h-4 w-64 bg-muted/20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted">
          <Warning size={48} weight="thin" className="mb-4 opacity-20" />
          <p className="font-bold uppercase tracking-widest text-xs">{error}</p>
          <button
            onClick={fetchNotifications}
            className="btn btn-secondary mt-4 text-[10px] font-black"
          >
            Retry
          </button>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted">
          <BellSimple size={48} weight="thin" className="mb-4 opacity-20" />
          <p className="font-bold uppercase tracking-widest text-xs">
            No notifications yet
          </p>
          <p className="text-[10px] text-muted mt-1">
            {activeTab === "All"
              ? "You're all caught up — new notifications will appear here"
              : `No ${activeTab.toLowerCase()} notifications`}
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card shadow-2xl overflow-hidden divide-y divide-border">
          {filteredNotifications.map((notif) => {
            const link = getLink(notif);

            return (
              <div
                key={notif._id}
                onClick={() => {
                  if (link) router.push(link);
                }}
                className={cn(
                  "p-6 flex items-center gap-6 transition-all relative group",
                  link ? "cursor-pointer" : "cursor-default",
                  notif.unread ? "bg-accent-light/30" : "hover:bg-card-hover",
                )}
              >
                {/* Unread indicator */}
                {notif.unread && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                )}

                {renderIcon(notif.type)}

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4
                      className={cn(
                        "text-lg font-black tracking-tight",
                        notif.unread ? "text-foreground" : "text-foreground/80",
                      )}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest">
                      {notif.timeAgo}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-sm font-bold leading-relaxed",
                      notif.unread ? "text-muted-foreground" : "text-muted",
                    )}
                  >
                    {notif.description}
                  </p>
                </div>

                {link && (
                  <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <ArrowRight
                      size={20}
                      weight="bold"
                      className="text-accent"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
