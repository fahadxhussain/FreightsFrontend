"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  ClipboardText,
  CurrencyDollar,
  MapPin,
  Plus,
  Sparkle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import api from "@/lib/axios";

interface LoadRecord {
  _id: string;
  status?: string;
  origin?: { city?: string; state?: string };
  destination?: { city?: string; state?: string };
  truckType?: string;
  rate?: number;
  pickupDate?: string;
}

interface LoadSummary {
  active: number;
  posted: number;
  booked: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const isBroker = user?.role === "broker";
  const [summary, setSummary] = useState<LoadSummary>({
    active: 0,
    posted: 0,
    booked: 0,
    inTransit: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [recentLoads, setRecentLoads] = useState<LoadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get("/loads?limit=50");
        const rawData = res?.data?.data;
        const loads: LoadRecord[] = Array.isArray(rawData?.loads)
          ? rawData.loads
          : Array.isArray(rawData)
            ? rawData
            : [];

        const counts: LoadSummary = {
          active: 0,
          posted: 0,
          booked: 0,
          inTransit: 0,
          delivered: 0,
          cancelled: 0,
        };

        for (const l of loads) {
          const status = l?.status;
          if (!status) continue;
          switch (status) {
            case "posted":
            case "active":
              counts.posted++;
              break;
            case "booked":
              counts.booked++;
              break;
            case "in_transit":
            case "in-transit":
              counts.inTransit++;
              break;
            case "delivered":
              counts.delivered++;
              break;
            case "cancelled":
              counts.cancelled++;
              break;
          }
        }
        counts.active = counts.posted + counts.booked + counts.inTransit;
        setSummary(counts);
        setRecentLoads(loads.slice(0, 8));
      } catch {
        // defaults — keep all zeros
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const colorMap: Record<string, string> = {
    accent: "bg-accent-light text-accent",
    amber: "bg-warning-light text-warning",
    green: "bg-success-light text-success",
    indigo: "bg-indigo-light text-indigo",
  };

  const statusBadge: Record<string, string> = {
    posted: "bg-accent-light text-accent",
    booked: "bg-indigo-light text-indigo",
    in_transit: "bg-warning-light text-warning",
    delivered: "bg-success-light text-success",
    cancelled: "bg-danger-light text-danger",
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted">Welcome back, {user?.firstName}</p>
        </div>
        {isBroker && (
          <button
            onClick={() => router.push("/loads/create")}
            className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            <Plus size={18} /> Post New Load
          </button>
        )}
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          {
            value: summary.active,
            label: "Active Loads",
            Icon: Truck,
            color: "accent",
          },
          {
            value: summary.booked,
            label: "Booked",
            Icon: ClipboardText,
            color: "amber",
          },
          {
            value: summary.inTransit,
            label: "In Transit",
            Icon: MapPin,
            color: "indigo",
          },
          {
            value: summary.delivered,
            label: "Delivered",
            Icon: CurrencyDollar,
            color: "green",
          },
        ].map(({ value, label, Icon, color }) => (
          <div
            key={label}
            className="flex items-start gap-3.5 rounded-xl border border-border bg-card p-5"
            style={{
              borderLeftWidth: "3px",
              borderLeftColor: `var(--${color})`,
            }}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                colorMap[color],
              )}
            >
              <Icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-foreground">
                {value}
              </div>
              <div className="text-xs text-muted">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-5">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-base font-semibold text-foreground">
              Recent Loads
            </h3>
            <button
              onClick={() => router.push("/loads")}
              className="text-sm text-accent hover:underline"
            >
              View All →
            </button>
          </div>
          {recentLoads.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-muted">
              No loads yet.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase text-muted">
                  <th className="px-5 py-3">Route</th>
                  <th className="px-5 py-3">Equipment</th>
                  <th className="px-5 py-3">Rate</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLoads.map((load: LoadRecord) => (
                  <tr
                    key={load._id}
                    className="border-t border-border hover:bg-card-hover cursor-pointer"
                    onClick={() => router.push(`/loads/${load._id}`)}
                  >
                    <td className="px-5 py-3 text-sm text-muted">
                      {load.origin?.city} → {load.destination?.city}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-medium text-accent">
                        {load.truckType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-foreground">
                      ${load.rate?.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium",
                          load.status ? statusBadge[load.status] || "" : "",
                        )}
                      >
                        {load.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Quick Stats
            </h3>
            <div className="space-y-3">
              {[
                { label: "Posted", value: summary.posted, color: "bg-accent" },
                { label: "Booked", value: summary.booked, color: "bg-indigo" },
                {
                  label: "In Transit",
                  value: summary.inTransit,
                  color: "bg-warning",
                },
                {
                  label: "Delivered",
                  value: summary.delivered,
                  color: "bg-success",
                },
                {
                  label: "Cancelled",
                  value: summary.cancelled,
                  color: "bg-danger",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg bg-input px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("h-3 w-3 rounded-full", color)} />
                    <span className="text-sm text-foreground">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-accent/30 bg-accent-light p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkle size={18} className="text-accent" />
              <h3 className="text-base font-semibold text-foreground">
                AI Insights
              </h3>
            </div>
            <p className="text-sm text-muted">
              Post more loads to get AI-powered carrier matching and lane
              pricing insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
