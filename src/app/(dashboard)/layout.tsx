"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAppSelector } from "@/store/hooks";

// Paths that are ONLY accessible to specific roles (ALLOW-list)
const ROLE_ALLOWED_PATHS: Record<string, string[]> = {
  "/loads": ["broker"], // Only brokers manage loads
  "/loads/create": ["broker"], // Only brokers create loads
  "/fleet": ["carrier", "independent_driver", "company_driver"], // Fleet management
  "/fleet/add": ["carrier", "independent_driver"], // Add vehicle
  "/team": ["carrier"], // Only carriers have teams
  "/team/roles": ["carrier"],
  "/team/invite": ["carrier"],
  "/admin": ["admin"], // Admin panel
  "/analytics": ["carrier"], // Carrier analytics
  "/payments": ["broker", "carrier"], // Payment dashboards
  "/my-bookings": ["broker", "carrier", "independent_driver", "company_driver"],
  "/documents": ["carrier", "independent_driver", "company_driver"],
  "/notifications": [
    "broker",
    "carrier",
    "independent_driver",
    "company_driver",
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!user?.role) return;

    // Check if current path is restricted — use ALLOW-list
    for (const [basePath, allowedRoles] of Object.entries(ROLE_ALLOWED_PATHS)) {
      if (pathname.startsWith(basePath) && !allowedRoles.includes(user.role)) {
        router.replace("/dashboard");
        return;
      }
    }
  }, [pathname, user?.role, router]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-[240px] flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
