"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarBlank,
  MapTrifold,
  CurrencyDollar,
  Scales,
  MagnifyingGlass,
  ArrowClockwise,
  Package,
  MapPin,
  Storefront,
  Truck,
  Star,
  Warning,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import PermissionGate from "@/components/PermissionGate";
import PreferredLanesPanel from "@/components/PreferredLanesPanel";

interface LoadAddress {
  city: string;
  state: string;
  address?: string;
}

interface BrokerInfo {
  orgName: string;
  rating?: number;
  riskScore?: number;
  initials?: string;
}

interface Load {
  _id: string;
  origin: LoadAddress;
  destination: LoadAddress;
  rate: number;
  rateType: string;
  pickupDate: string;
  deliveryDate: string;
  truckType: string;
  estimatedDistance: number;
  commodity: string;
  weight: number;
  specialRequirements: string | null;
  orgId: string;
  broker?: BrokerInfo;
}

interface Truck {
  _id: string;
  name: string;
  type: string;
  plate: string;
  status: string;
  assignedDriverId?: string | null;
}

const EQUIPMENT_TYPES = [
  "All",
  "Flatbed",
  "Dry Van",
  "Reefer",
  "Step Deck",
  "Lowboy",
  "Tanker",
];

const SORT_OPTIONS = [
  { label: "Sort: Rate ↓", value: "rate_desc" },
  { label: "Sort: Rate ↑", value: "rate_asc" },
  { label: "Sort: Date ↑", value: "date_asc" },
  { label: "Sort: Distance", value: "distance_asc" },
];

function formatDate(d: string, fmt: "short" | "full" = "short") {
  const date = new Date(d);
  if (fmt === "short") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(d: string) {
  const date = new Date(d);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function equipmentBadge(truckType: string) {
  const t = truckType.toLowerCase();
  if (t === "flatbed") return "badge-pill badge-pill-default";
  if (t === "reefer") return "badge-pill badge-pill-violet";
  if (t === "dry_van" || t === "dry van") return "badge-pill badge-pill-emerald";
  if (t === "step_deck" || t === "step deck") return "badge-pill badge-pill-orange";
  return "badge-pill badge-pill-default";
}

function sortToParams(sort: string) {
  if (sort === "rate_desc") return { sort: "rate", sortDir: "desc" };
  if (sort === "rate_asc") return { sort: "rate", sortDir: "asc" };
  if (sort === "date_asc") return { sort: "pickupDate", sortDir: "asc" };
  if (sort === "distance_asc") return { sort: "distance", sortDir: "asc" };
  return { sort: "postedAt", sortDir: "desc" };
}

export default function MarketplacePage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);

  const [activeTab, setActiveTab] = useState<"browse" | "lanes">("browse");

  const [loads, setLoads] = useState<Load[]>([]);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [trucks, setTrucks] = useState<Truck[]>([]);

  const [searchOrigin, setSearchOrigin] = useState("");
  const [searchDest, setSearchDest] = useState("");
  const [searchLoadId, setSearchLoadId] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("All");
  const [sort, setSort] = useState("rate_desc");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoadId, setBookingLoadId] = useState<string | null>(null);

  const fetchLoads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {};

      if (searchOrigin) params.originCity = searchOrigin;
      if (searchDest) params.destCity = searchDest;
      if (equipmentFilter !== "All") params.truckType = equipmentFilter;
      if (minRate) params.minRate = Number(minRate);
      if (maxRate) params.maxRate = Number(maxRate);
      if (minWeight) params.minWeight = Number(minWeight);
      if (maxWeight) params.maxWeight = Number(maxWeight);

      const sortParams = sortToParams(sort);
      params.sort = sortParams.sort;
      params.sortDir = sortParams.sortDir;

      params.limit = 100;

      const response = await api.get("/marketplace/loads", { params });
      const fetchedLoads: Load[] = response.data?.data?.loads ?? [];
      setLoads(fetchedLoads);

      if (fetchedLoads.length > 0) {
        setSelectedLoad((prev) => {
          if (prev && fetchedLoads.find((l) => l._id === prev._id)) return prev;
          return fetchedLoads[0];
        });
      } else {
        setSelectedLoad(null);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || "Failed to fetch loads";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [
    searchOrigin,
    searchDest,
    equipmentFilter,
    sort,
    minRate,
    maxRate,
    minWeight,
    maxWeight,
  ]);

  const fetchTrucks = useCallback(async () => {
    try {
      const response = await api.get("/fleet");
      const fleetData =
        response.data?.data?.vehicles ?? response.data?.data ?? [];
      setTrucks(Array.isArray(fleetData) ? fleetData : []);
    } catch {
      // trucks are non-critical
    }
  }, []);

  const didFetchRef = React.useRef(false);
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchLoads();
    fetchTrucks();
  }, [fetchLoads, fetchTrucks]);

  const handlePlaceBid = async () => {
    if (!selectedLoad) return;

    let availableTrucks = trucks;
    if (availableTrucks.length === 0) {
      try {
        const response = await api.get("/fleet");
        const fleetData =
          response.data?.data?.vehicles ?? response.data?.data ?? [];
        availableTrucks = Array.isArray(fleetData) ? fleetData : [];
        setTrucks(availableTrucks);
      } catch {
        // fall through to error
      }
    }

    if (availableTrucks.length === 0) {
      toast.error("You need to add a vehicle first");
      return;
    }

    const truck =
      availableTrucks.find((t: Truck) => t.status === "available") ??
      availableTrucks[0];

    const driverId = truck.assignedDriverId || user?.id || undefined;

    setBookingLoadId(selectedLoad._id);
    try {
      await api.post(`/loads/${selectedLoad._id}/booking-request`, {
        truckId: truck._id,
        driverId,
        proposedRate: selectedLoad.rate,
      });
      toast.success("Booking request submitted successfully!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ||
        "Failed to submit booking request";
      toast.error(msg);
    } finally {
      setBookingLoadId(null);
    }
  };

  const filteredBySearch = searchLoadId
    ? loads.filter((l) =>
        l._id.toLowerCase().includes(searchLoadId.toLowerCase()),
      )
    : loads;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* LEFT PANEL */}
      <div className="flex-1 flex flex-col border-r border-hairline bg-canvas min-w-0">
        {/* Header */}
        <div className="p-5 pb-3 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-ink flex items-center gap-2">
                <Storefront size={22} weight="regular" className="text-ink" />
                {activeTab === "lanes" ? "My Preferred Lanes" : "Available Loads"}
              </h2>
              {activeTab === "browse" && (
                <p className="text-xs text-muted mt-1">
                  {filteredBySearch.length} loads found
                </p>
              )}
            </div>
            <button
              onClick={fetchLoads}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-card text-muted hover:text-ink hover:border-hairline transition-colors"
              title="Refresh"
            >
              <ArrowClockwise
                size={18}
                weight="regular"
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
          </div>

          {/* Tab switcher */}
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={() => setActiveTab("browse")}
              className={cn(
                "px-4 py-2 text-xs font-medium rounded-md border transition-colors",
                activeTab === "browse"
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-card border-hairline text-muted hover:border-hairline hover:text-ink",
              )}
            >
              Browse Loads
            </button>
            <PermissionGate roles={["carrier", "independent_driver"]}>
              <button
                onClick={() => setActiveTab("lanes")}
                className={cn(
                  "px-4 py-2 text-xs font-medium rounded-md border transition-colors",
                  activeTab === "lanes"
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-hairline text-muted hover:border-hairline hover:text-ink",
                )}
              >
                My Lanes
              </button>
            </PermissionGate>
          </div>

          {/* Browse tab filters */}
          {activeTab === "browse" && (
            <>
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 rounded-md border border-hairline bg-surface-soft px-3 py-2 transition-colors focus-within:border-ink focus-within:ring-1 focus-within:ring-ink">
                    <MapPin size={16} weight="regular" className="text-muted shrink-0" />
                    <input
                      placeholder="Pickup location..."
                      value={searchOrigin}
                      onChange={(e) => setSearchOrigin(e.target.value)}
                      className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground min-w-0"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-2 rounded-md border border-hairline bg-surface-soft px-3 py-2 transition-colors focus-within:border-ink focus-within:ring-1 focus-within:ring-ink">
                    <MapPin size={16} weight="regular" className="text-muted shrink-0" />
                    <input
                      placeholder="Delivery location..."
                      value={searchDest}
                      onChange={(e) => setSearchDest(e.target.value)}
                      className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground min-w-0"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-hairline bg-surface-soft px-3 py-2 transition-colors focus-within:border-ink focus-within:ring-1 focus-within:ring-ink">
                  <MagnifyingGlass size={16} weight="regular" className="text-muted shrink-0" />
                  <input
                    placeholder="Search by Load ID..."
                    value={searchLoadId}
                    onChange={(e) => setSearchLoadId(e.target.value)}
                    className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Equipment filter chips */}
              <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                {EQUIPMENT_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setEquipmentFilter(t)}
                    className={cn(
                      "whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md border transition-colors",
                      equipmentFilter === t
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-card border-hairline text-muted hover:border-hairline hover:text-ink",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Rate filter + Sort */}
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="number"
                  placeholder="Min rate"
                  value={minRate}
                  onChange={(e) => setMinRate(e.target.value)}
                  className="w-24 rounded-md border border-hairline bg-surface-soft px-2.5 py-1.5 text-xs outline-none focus:border-ink"
                />
                <span className="text-xs text-muted">—</span>
                <input
                  type="number"
                  placeholder="Max rate"
                  value={maxRate}
                  onChange={(e) => setMaxRate(e.target.value)}
                  className="w-24 rounded-md border border-hairline bg-surface-soft px-2.5 py-1.5 text-xs outline-none focus:border-ink"
                />
                <input
                  type="number"
                  placeholder="Min wt"
                  value={minWeight}
                  onChange={(e) => setMinWeight(e.target.value)}
                  className="w-20 rounded-md border border-hairline bg-surface-soft px-2.5 py-1.5 text-xs outline-none focus:border-ink"
                />
                <span className="text-xs text-muted">—</span>
                <input
                  type="number"
                  placeholder="Max wt"
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(e.target.value)}
                  className="w-20 rounded-md border border-hairline bg-surface-soft px-2.5 py-1.5 text-xs outline-none focus:border-ink"
                />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="ml-auto h-9 rounded-md border border-hairline bg-card px-3 text-xs font-medium text-ink outline-none cursor-pointer appearance-none hover:border-hairline transition-colors"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Browse loads list */}
        {activeTab === "browse" && (
          <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2.5">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl border border-hairline bg-card animate-pulse" />
              ))
            ) : error && loads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted">
                <Warning size={48} weight="thin" className="mb-4 opacity-20" />
                <p className="text-sm font-medium">{error}</p>
                <button onClick={fetchLoads} className="mt-4 inline-flex items-center gap-2 h-9 px-4 text-xs font-medium rounded-md border border-hairline bg-card text-ink hover:bg-surface-soft transition-colors">
                  Retry
                </button>
              </div>
            ) : filteredBySearch.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted">
                <Package size={48} weight="thin" className="mb-4 opacity-20" />
                <p className="text-sm font-medium">No loads found</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              filteredBySearch.map((load) => {
                const isSelected = selectedLoad?._id === load._id;
                return (
                  <div
                    key={load._id}
                    onClick={() => setSelectedLoad(load)}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border p-4 transition-colors cursor-pointer",
                      isSelected
                        ? "bg-surface-soft border-ink ring-1 ring-ink"
                        : "bg-card border-hairline hover:border-hairline hover:bg-surface-soft",
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-ink text-sm truncate">
                          {load.origin.city}, {load.origin.state}
                        </span>
                        <ArrowRight size={14} weight="regular" className="text-muted shrink-0" />
                        <span className="font-semibold text-ink text-sm truncate">
                          {load.destination.city}, {load.destination.state}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-ink tracking-tight shrink-0 ml-2">
                        ${load.rate.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5 items-center">
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <CalendarBlank size={14} weight="regular" className="text-muted" />
                        {formatDate(load.pickupDate)}
                      </div>
                      <span className={cn("badge-pill text-xs px-2 py-0.5", equipmentBadge(load.truckType))}>
                        {load.truckType}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <MapPin size={14} weight="regular" />
                        {load.estimatedDistance || 0} mi
                      </div>
                      {load.commodity && (
                        <div className="text-xs text-muted border-l border-hairline pl-2.5 truncate">
                          {load.commodity}
                        </div>
                      )}
                    </div>
                    {load.broker?.riskScore !== undefined && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-semibold",
                            load.broker.riskScore >= 80
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : load.broker.riskScore >= 50
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                : "bg-red-500/10 text-red-600 border border-red-500/20",
                          )}
                        >
                          {load.broker.riskScore}
                        </span>
                        <span className="text-xs text-muted">{load.broker.orgName}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Preferred lanes panel */}
        {activeTab === "lanes" && (
          <div className="flex-1 overflow-y-auto px-5 pb-5">
            <PreferredLanesPanel />
          </div>
        )}
      </div>

      {/* RIGHT PANEL — Load Detail */}
      <div className="w-[400px] overflow-y-auto bg-card shrink-0">
        {selectedLoad ? (
          <div className="p-5 space-y-6 animate-in fade-in duration-300">
            <div>
              <div className="text-xs font-medium text-muted mb-1.5">Load Details</div>
              <h3 className="text-lg font-semibold tracking-tight text-ink leading-tight">
                {selectedLoad.origin.city}, {selectedLoad.origin.state}
                <span className="text-muted inline-flex items-center gap-1.5 mx-2">
                  <ArrowRight size={16} weight="regular" />
                </span>
                {selectedLoad.destination.city}, {selectedLoad.destination.state}
              </h3>
            </div>

            <div className="aspect-[16/10] w-full rounded-xl bg-surface-soft border border-dashed border-hairline flex items-center justify-center text-muted hover:border-ink/30 transition-colors cursor-pointer group">
              <div className="text-center group-hover:scale-105 transition-transform">
                <MapTrifold size={40} weight="duotone" className="mx-auto mb-2 opacity-20" />
                <p className="text-xs font-medium">Route Map</p>
                <p className="text-xs text-muted mt-0.5">{selectedLoad.estimatedDistance || 0} miles</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <div className="text-xs font-medium text-muted mb-1">Rate</div>
                <div className="text-xl font-semibold text-ink tracking-tight">${selectedLoad.rate.toLocaleString()}</div>
                <div className="text-xs text-muted capitalize mt-0.5">{selectedLoad.rateType?.replace(/_/g, " ") || "flat rate"}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted mb-1">Equipment</div>
                <span className={cn("badge-pill text-xs", equipmentBadge(selectedLoad.truckType))}>{selectedLoad.truckType}</span>
              </div>
              <div>
                <div className="text-xs font-medium text-muted mb-1">Weight</div>
                <div className="flex items-center gap-1.5 text-sm font-medium"><Scales size={16} weight="regular" className="text-muted" />{selectedLoad.weight?.toLocaleString() || "—"} lbs</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted mb-1">Distance</div>
                <div className="flex items-center gap-1.5 text-sm font-medium"><Truck size={16} weight="regular" className="text-muted" />{selectedLoad.estimatedDistance || 0} mi</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted mb-1">Pickup</div>
                <div className="text-sm font-medium text-ink">{formatDate(selectedLoad.pickupDate, "full")}</div>
                <div className="text-xs text-muted">{formatTime(selectedLoad.pickupDate)}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted mb-1">Delivery</div>
                <div className="text-sm font-medium text-ink">{formatDate(selectedLoad.deliveryDate, "full")}</div>
                <div className="text-xs text-muted">{formatTime(selectedLoad.deliveryDate)}</div>
              </div>
            </div>

            <div className="rounded-xl bg-surface-soft p-4 border border-hairline">
              <div className="text-xs font-medium text-muted mb-3">Commodity</div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground"><Package size={18} weight="regular" /></div>
                <div className="text-sm font-medium text-ink">{selectedLoad.commodity || "General Freight"}</div>
              </div>
            </div>

            {selectedLoad.specialRequirements && (
              <div className="rounded-xl bg-surface-soft p-4 border border-hairline">
                <div className="text-xs font-medium text-muted mb-2">Requirements</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLoad.specialRequirements.split(",").map((r) => (
                    <span key={r.trim()} className="badge-pill badge-pill-orange text-xs px-2 py-0.5">{r.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <PermissionGate roles={["carrier", "independent_driver"]}>
                <button
                  onClick={handlePlaceBid}
                  disabled={bookingLoadId === selectedLoad._id}
                  className="w-full h-11 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary-active transition-colors disabled:opacity-50"
                >
                  <CurrencyDollar size={18} weight="regular" className="inline mr-2" />
                  {bookingLoadId === selectedLoad._id ? "Submitting..." : "Place Bid / Book Load"}
                </button>
              </PermissionGate>
              <button
                onClick={() => router.push(`/loads/${selectedLoad._id}`)}
                className="w-full h-10 text-xs font-medium rounded-md border border-hairline bg-card text-ink hover:bg-surface-soft transition-colors"
              >
                View Full Details
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <div className="text-center p-8">
              <MagnifyingGlass size={48} weight="thin" className="mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium">Select a load to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
