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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
  if (t === "flatbed") return "badge-blue";
  if (t === "reefer") return "badge-indigo";
  if (t === "dry_van" || t === "dry van") return "badge-green";
  if (t === "step_deck" || t === "step deck") return "badge-amber";
  return "badge-gray";
}

function sortToParams(sort: string) {
  if (sort === "rate_desc") return { sort: "rate", sortDir: "desc" };
  if (sort === "rate_asc") return { sort: "rate", sortDir: "asc" };
  if (sort === "date_asc") return { sort: "pickupDate", sortDir: "asc" };
  if (sort === "distance_asc") return { sort: "distance", sortDir: "asc" };
  return { sort: "postedAt", sortDir: "desc" };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function MarketplacePage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);

  // data
  const [loads, setLoads] = useState<Load[]>([]);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [trucks, setTrucks] = useState<Truck[]>([]);

  // filters
  const [searchOrigin, setSearchOrigin] = useState("");
  const [searchDest, setSearchDest] = useState("");
  const [searchLoadId, setSearchLoadId] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("All");
  const [sort, setSort] = useState("rate_desc");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");

  // state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoadId, setBookingLoadId] = useState<string | null>(null);

  // -----------------------------------------------------------------------
  // Fetch loads
  // -----------------------------------------------------------------------

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
        // retain selection if still in list
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

  // also fetch available trucks
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

  // -----------------------------------------------------------------------
  // Place bid / book load
  // -----------------------------------------------------------------------

  const handlePlaceBid = async () => {
    if (!selectedLoad) return;

    // Fetch fresh vehicle list to ensure we have up-to-date data
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

    // Find first available vehicle (status === "available")
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

  // -----------------------------------------------------------------------
  // Derived
  // -----------------------------------------------------------------------

  const filteredBySearch = searchLoadId
    ? loads.filter((l) =>
        l._id.toLowerCase().includes(searchLoadId.toLowerCase()),
      )
    : loads;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="flex h-[calc(100vh-72px)] overflow-hidden">
      {/* ================================================================= */}
      {/* LEFT PANEL — Load List                                          */}
      {/* ================================================================= */}
      <div className="flex-1 flex flex-col border-r border-border bg-background min-w-0">
        {/* Header */}
        <div className="p-5 pb-3 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                <Storefront size={24} weight="bold" className="text-accent" />
                Available Loads
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-0.5">
                {filteredBySearch.length} loads found
              </p>
            </div>
            <button
              onClick={fetchLoads}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted hover:text-accent hover:border-accent transition-all"
              title="Refresh"
            >
              <ArrowClockwise
                size={18}
                weight="bold"
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
          </div>

          {/* Search bar */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-xl border border-border bg-input px-3 py-2 transition-all focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10">
                <MapPin
                  size={16}
                  weight="bold"
                  className="text-muted shrink-0"
                />
                <input
                  placeholder="Pickup location..."
                  value={searchOrigin}
                  onChange={(e) => setSearchOrigin(e.target.value)}
                  className="w-full bg-transparent text-[12px] font-medium text-foreground outline-none placeholder:text-muted min-w-0"
                />
              </div>
              <div className="flex-1 flex items-center gap-2 rounded-xl border border-border bg-input px-3 py-2 transition-all focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10">
                <MapPin
                  size={16}
                  weight="bold"
                  className="text-muted shrink-0"
                />
                <input
                  placeholder="Delivery location..."
                  value={searchDest}
                  onChange={(e) => setSearchDest(e.target.value)}
                  className="w-full bg-transparent text-[12px] font-medium text-foreground outline-none placeholder:text-muted min-w-0"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-input px-3 py-2 transition-all focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10">
              <MagnifyingGlass
                size={16}
                weight="bold"
                className="text-muted shrink-0"
              />
              <input
                placeholder="Search by Load ID..."
                value={searchLoadId}
                onChange={(e) => setSearchLoadId(e.target.value)}
                className="w-full bg-transparent text-[12px] font-medium text-foreground outline-none placeholder:text-muted"
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
                  "whitespace-nowrap px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all",
                  equipmentFilter === t
                    ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                    : "bg-card border-border text-muted hover:border-muted hover:text-foreground",
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
              className="w-24 rounded-lg border border-border bg-input px-2.5 py-1.5 text-[11px] font-bold outline-none focus:border-accent"
            />
            <span className="text-[10px] text-muted font-bold">—</span>
            <input
              type="number"
              placeholder="Max rate"
              value={maxRate}
              onChange={(e) => setMaxRate(e.target.value)}
              className="w-24 rounded-lg border border-border bg-input px-2.5 py-1.5 text-[11px] font-bold outline-none focus:border-accent"
            />
            <input
              type="number"
              placeholder="Min wt"
              value={minWeight}
              onChange={(e) => setMinWeight(e.target.value)}
              className="w-20 rounded-lg border border-border bg-input px-2.5 py-1.5 text-[11px] font-bold outline-none focus:border-accent"
            />
            <span className="text-[10px] text-muted font-bold">—</span>
            <input
              type="number"
              placeholder="Max wt"
              value={maxWeight}
              onChange={(e) => setMaxWeight(e.target.value)}
              className="w-20 rounded-lg border border-border bg-input px-2.5 py-1.5 text-[11px] font-bold outline-none focus:border-accent"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="ml-auto h-9 rounded-xl border border-border bg-card px-3 text-[10px] font-black uppercase tracking-wider text-foreground outline-none cursor-pointer appearance-none hover:border-muted transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scrollable load cards */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2.5">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-border bg-card animate-pulse"
              />
            ))
          ) : error && loads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted">
              <Warning size={48} weight="thin" className="mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-xs">
                {error}
              </p>
              <button
                onClick={fetchLoads}
                className="btn btn-secondary mt-4 text-[10px] font-black"
              >
                Retry
              </button>
            </div>
          ) : filteredBySearch.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted">
              <Package size={48} weight="thin" className="mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-xs">
                No loads found
              </p>
              <p className="text-[10px] text-muted mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            filteredBySearch.map((load) => {
              const isSelected = selectedLoad?._id === load._id;
              return (
                <div
                  key={load._id}
                  onClick={() => setSelectedLoad(load)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border p-4 transition-all cursor-pointer active:scale-[0.98]",
                    isSelected
                      ? "bg-accent-light border-accent/30 shadow-md ring-1 ring-accent/10"
                      : "bg-card border-border hover:border-muted hover:bg-card-hover",
                  )}
                >
                  {/* Selection accent bar */}
                  {isSelected && (
                    <div className="absolute top-0 right-0 h-1 w-16 bg-accent rounded-bl-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-black text-foreground tracking-tight text-sm truncate">
                        {load.origin.city}, {load.origin.state}
                      </span>
                      <ArrowRight
                        size={12}
                        weight="bold"
                        className="text-muted shrink-0"
                      />
                      <span className="font-black text-foreground tracking-tight text-sm truncate">
                        {load.destination.city}, {load.destination.state}
                      </span>
                    </div>
                    <div className="text-lg font-black text-success tracking-tight shrink-0 ml-2">
                      ${load.rate.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 items-center">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted">
                      <CalendarBlank
                        size={14}
                        weight="bold"
                        className="text-accent"
                      />
                      {formatDate(load.pickupDate)}
                    </div>
                    <span
                      className={cn(
                        "badge text-[9px] px-2 py-0.5",
                        equipmentBadge(load.truckType),
                      )}
                    >
                      {load.truckType}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted">
                      <MapPin size={14} weight="bold" />
                      {load.estimatedDistance || 0} mi
                    </div>
                    {load.commodity && (
                      <div className="text-[10px] font-bold text-muted border-l border-border pl-2.5 truncate">
                        {load.commodity}
                      </div>
                    )}
                  </div>

                  {/* Risk / broker preview */}
                  {load.broker?.riskScore !== undefined && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center h-6 w-6 rounded-full text-[9px] font-black",
                          load.broker.riskScore >= 80
                            ? "bg-success-light text-success border border-success/30"
                            : load.broker.riskScore >= 50
                              ? "bg-warning-light text-warning border border-warning/30"
                              : "bg-danger-light text-danger border border-danger/30",
                        )}
                      >
                        {load.broker.riskScore}
                      </span>
                      <span className="text-[10px] font-bold text-muted">
                        {load.broker.orgName}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* RIGHT PANEL — Load Detail                                       */}
      {/* ================================================================= */}
      <div className="w-[400px] overflow-y-auto bg-card shrink-0">
        {selectedLoad ? (
          <div className="p-5 space-y-6 animate-in fade-in duration-300">
            {/* Title */}
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted mb-1.5">
                Load Details
              </div>
              <h3 className="text-lg font-black tracking-tight text-foreground leading-tight">
                {selectedLoad.origin.city}, {selectedLoad.origin.state}
                <span className="text-muted inline-flex items-center gap-1.5 mx-2">
                  <ArrowRight size={16} weight="bold" />
                </span>
                {selectedLoad.destination.city},{" "}
                {selectedLoad.destination.state}
              </h3>
            </div>

            {/* Map placeholder */}
            <div className="aspect-[16/10] w-full rounded-2xl bg-input border-2 border-dashed border-border flex items-center justify-center text-muted hover:border-accent/30 transition-colors cursor-pointer group">
              <div className="text-center group-hover:scale-105 transition-transform">
                <MapTrifold
                  size={40}
                  weight="duotone"
                  className="mx-auto mb-2 opacity-20"
                />
                <p className="text-[9px] font-black uppercase tracking-widest">
                  Route Map
                </p>
                <p className="text-[10px] font-bold text-muted/60 mt-0.5">
                  {selectedLoad.estimatedDistance || 0} miles
                </p>
              </div>
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">
                  Rate
                </div>
                <div className="text-xl font-black text-success tracking-tight">
                  ${selectedLoad.rate.toLocaleString()}
                </div>
                <div className="text-[9px] text-muted font-bold capitalize mt-0.5">
                  {selectedLoad.rateType?.replace(/_/g, " ") || "flat rate"}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">
                  Equipment
                </div>
                <span
                  className={cn(
                    "badge h-6 px-2.5 text-[10px]",
                    equipmentBadge(selectedLoad.truckType),
                  )}
                >
                  {selectedLoad.truckType}
                </span>
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">
                  Weight
                </div>
                <div className="flex items-center gap-1.5 text-[13px] font-black">
                  <Scales size={16} weight="bold" className="text-muted" />
                  {selectedLoad.weight?.toLocaleString() || "—"} lbs
                </div>
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">
                  Distance
                </div>
                <div className="flex items-center gap-1.5 text-[13px] font-black">
                  <Truck size={16} weight="bold" className="text-muted" />
                  {selectedLoad.estimatedDistance || 0} mi
                </div>
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">
                  Pickup
                </div>
                <div className="text-[12px] font-black text-foreground">
                  {formatDate(selectedLoad.pickupDate, "full")}
                </div>
                <div className="text-[10px] font-bold text-muted">
                  {formatTime(selectedLoad.pickupDate)}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">
                  Delivery
                </div>
                <div className="text-[12px] font-black text-foreground">
                  {formatDate(selectedLoad.deliveryDate, "full")}
                </div>
                <div className="text-[10px] font-bold text-muted">
                  {formatTime(selectedLoad.deliveryDate)}
                </div>
              </div>
            </div>

            {/* Commodity / Load Info */}
            <div className="rounded-2xl bg-input p-4 border border-border">
              <div className="text-[9px] font-black uppercase tracking-widest text-muted mb-3">
                Commodity
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-[11px] font-black text-white shadow-lg shadow-accent/20">
                  <Package size={18} weight="bold" />
                </div>
                <div className="text-[13px] font-black text-foreground">
                  {selectedLoad.commodity || "General Freight"}
                </div>
              </div>
            </div>

            {/* Special requirements */}
            {selectedLoad.specialRequirements && (
              <div className="rounded-2xl bg-input p-4 border border-border">
                <div className="text-[9px] font-black uppercase tracking-widest text-muted mb-2">
                  Requirements
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLoad.specialRequirements.split(",").map((r) => (
                    <span
                      key={r.trim()}
                      className="badge badge-amber text-[9px] px-2 py-0.5"
                    >
                      {r.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-3 pt-2">
              <PermissionGate roles={["carrier", "independent_driver"]}>
                <button
                  onClick={handlePlaceBid}
                  disabled={bookingLoadId === selectedLoad._id}
                  className="btn btn-primary w-full h-13 text-[12px] font-black uppercase tracking-widest shadow-xl shadow-accent/20"
                >
                  <CurrencyDollar size={20} weight="bold" />
                  {bookingLoadId === selectedLoad._id
                    ? "Submitting..."
                    : "Place Bid / Book Load"}
                </button>
              </PermissionGate>
              <button
                onClick={() => router.push(`/loads/${selectedLoad._id}`)}
                className="btn btn-secondary w-full h-11 text-[10px] font-black uppercase tracking-widest"
              >
                View Full Details
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <div className="text-center p-8">
              <MagnifyingGlass
                size={48}
                weight="thin"
                className="mx-auto mb-4 opacity-20"
              />
              <p className="font-bold uppercase tracking-widest text-xs">
                Select a load to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
