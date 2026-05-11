"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import {
  Gauge,
  Package,
  Storefront,
  Truck,
  CurrencyDollar,
  FileText,
  ChartLine,
  Lifebuoy,
  Gear,
  BookmarkSimple,
  Bell,
} from "@phosphor-icons/react";

interface NavItem {
  href: string;
  label: string;
  Icon: React.ElementType;
  permission?: string;
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  admin: [
    { href: "/admin", label: "Admin Panel", Icon: Gauge },
    { href: "/admin/users", label: "Users", Icon: Lifebuoy },
    { href: "/admin/verification", label: "Verification", Icon: FileText },
    { href: "/admin/settings", label: "Platform Config", Icon: Gear },
  ],
  broker: [
    { href: "/dashboard", label: "Dashboard", Icon: Gauge },
    { href: "/loads", label: "My Loads", Icon: Package },
    { href: "/loads/create", label: "Create Load", Icon: Storefront },
    { href: "/marketplace", label: "Marketplace", Icon: Storefront },
    { href: "/my-bookings", label: "My Bookings", Icon: BookmarkSimple },
    { href: "/payments", label: "Payments", Icon: CurrencyDollar },
    { href: "/notifications", label: "Notifications", Icon: Bell },
    { href: "/settings", label: "Settings", Icon: Gear },
  ],
  carrier: [
    { href: "/dashboard", label: "Dashboard", Icon: Gauge },
    { href: "/marketplace", label: "Marketplace", Icon: Storefront },
    { href: "/my-bookings", label: "My Bookings", Icon: BookmarkSimple },
    { href: "/fleet", label: "Fleet", Icon: Truck, permission: "fleet.view" },
    { href: "/team", label: "Team", Icon: Lifebuoy, permission: "team.view" },
    {
      href: "/payments",
      label: "Payments",
      Icon: CurrencyDollar,
      permission: "payments.view",
    },
    {
      href: "/analytics",
      label: "Analytics",
      Icon: ChartLine,
      permission: "analytics.view",
    },
    {
      href: "/documents",
      label: "Documents",
      Icon: FileText,
      permission: "documents.view",
    },
    { href: "/notifications", label: "Notifications", Icon: Bell },
    { href: "/settings", label: "Settings", Icon: Gear },
  ],
  independent_driver: [
    { href: "/dashboard", label: "Dashboard", Icon: Gauge },
    { href: "/marketplace", label: "Load Board", Icon: Storefront },
    { href: "/my-bookings", label: "My Bookings", Icon: BookmarkSimple },
    { href: "/fleet", label: "My Truck", Icon: Truck },
    { href: "/documents", label: "Documents", Icon: FileText },
    { href: "/notifications", label: "Notifications", Icon: Bell },
    { href: "/settings", label: "Settings", Icon: Gear },
  ],
  company_driver: [
    { href: "/dashboard", label: "Dashboard", Icon: Gauge },
    { href: "/my-bookings", label: "My Loads", Icon: BookmarkSimple },
    { href: "/fleet", label: "My Truck", Icon: Truck },
    { href: "/documents", label: "Documents", Icon: FileText },
    { href: "/notifications", label: "Notifications", Icon: Bell },
    { href: "/settings", label: "Settings", Icon: Gear },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const userPermissions = useAppSelector((state) => state.auth.permissions);

  const role = user?.role || "broker";
  const navItems = NAV_BY_ROLE[role] || NAV_BY_ROLE.broker;

  // Filter nav items by permission:
  // - Carrier owners (role === 'carrier') see everything — skip permission checks
  // - Carrier team members see only what their permissions allow
  const visibleNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    // Carrier owner has implicit all-permissions
    if (role === "carrier" && userPermissions.length === 0) return true;
    return userPermissions.includes(item.permission);
  });

  return (
    <aside className="fixed top-0 left-0 bottom-0 z-50 flex w-[240px] flex-col border-r border-border bg-sidebar shadow-2xl transition-all duration-300">
      <div className="px-8 py-8">
        <Link
          href="/dashboard"
          className="text-2xl font-black tracking-tighter text-accent transition-all hover:scale-105 inline-block"
        >
          FLOW
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-4 py-2 scrollbar-hide">
        {visibleNavItems.map(({ href, label, Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-[12px] font-bold tracking-tight transition-all duration-300",
                isActive
                  ? "bg-accent text-white shadow-xl shadow-accent/20 translate-x-1"
                  : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground hover:translate-x-1",
              )}
            >
              <Icon
                size={22}
                weight={isActive ? "bold" : "regular"}
                className={cn(
                  isActive
                    ? "text-white"
                    : "text-muted group-hover:text-foreground",
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="rounded-2xl border border-border bg-card-hover p-3 shadow-xl transition-all hover:border-accent/30 hover:translate-y-[-2px] group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-black text-white shadow-xl shadow-accent/20 group-hover:rotate-12 transition-transform">
              {user?.firstName?.slice(0, 1)}
              {user?.lastName?.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-foreground">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">
                {user?.role}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
