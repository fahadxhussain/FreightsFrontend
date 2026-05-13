"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  X,
  TrashSimple,
  MapPin,
  CurrencyDollar,
  ArrowRight,
  CircleNotch,
  CheckCircle,
  MapTrifold,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";

interface PreferredLane {
  _id: string;
  originState: string;
  destinationState: string;
  minRatePerMile: number | null;
  minRatePerTrip: number | null;
  maxDistance: number | null;
  truckTypes: string[];
  alertEnabled: boolean;
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const EQUIPMENT_OPTIONS = [
  { value: "flatbed", label: "Flatbed" },
  { value: "dry_van", label: "Dry Van" },
  { value: "reefer", label: "Reefer" },
  { value: "step_deck", label: "Step Deck" },
  { value: "lowboy", label: "Lowboy" },
  { value: "tanker", label: "Tanker" },
];

export default function PreferredLanesPanel() {
  const user = useAppSelector((s) => s.auth.user);
  const [lanes, setLanes] = useState<PreferredLane[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [originState, setOriginState] = useState("");
  const [destState, setDestState] = useState("");
  const [minRatePerMile, setMinRatePerMile] = useState("");
  const [minRatePerTrip, setMinRatePerTrip] = useState("");
  const [maxDistance, setMaxDistance] = useState("");
  const [selectedTruckTypes, setSelectedTruckTypes] = useState<string[]>([]);

  const fetchLanes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/marketplace/lanes");
      setLanes(res.data?.data ?? []);
    } catch {
      toast.error("Failed to load preferred lanes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLanes();
  }, [fetchLanes]);

  const handleAddLane = async () => {
    if (!originState || !destState) {
      toast.error("Please select origin and destination states");
      return;
    }
    if (originState === destState) {
      toast.error("Origin and destination must be different");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        originState,
        destinationState: destState,
        alertEnabled: true,
      };
      if (minRatePerMile) payload.minRatePerMile = Number(minRatePerMile);
      if (minRatePerTrip) payload.minRatePerTrip = Number(minRatePerTrip);
      if (maxDistance) payload.maxDistance = Number(maxDistance);
      if (selectedTruckTypes.length > 0) payload.truckTypes = selectedTruckTypes;

      await api.post("/marketplace/lanes", payload);
      toast.success("Preferred lane added");
      setShowAddForm(false);
      setOriginState("");
      setDestState("");
      setMinRatePerMile("");
      setMinRatePerTrip("");
      setMaxDistance("");
      setSelectedTruckTypes([]);
      fetchLanes();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || "Failed to add lane";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLane = async (laneId: string) => {
    try {
      await api.delete(`/marketplace/lanes/${laneId}`);
      setLanes((prev) => prev.filter((l) => l._id !== laneId));
      toast.success("Lane removed");
    } catch {
      toast.error("Failed to delete lane");
    }
  };

  const toggleTruckType = (type: string) => {
    setSelectedTruckTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  return (
    <div className="rounded-xl border border-hairline bg-card">
      <div className="p-6 border-b border-hairline">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-soft text-ink">
              <MapTrifold size={20} weight="regular" />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight text-ink">My Preferred Lanes</h3>
              <p className="text-xs text-muted mt-0.5">
                Get alerts for loads matching your routes
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className={cn(
              "inline-flex items-center gap-2 h-10 px-5 text-xs font-semibold rounded-md transition-colors",
              showAddForm
                ? "border border-hairline bg-card text-ink hover:bg-surface-soft"
                : "bg-primary text-primary-foreground hover:bg-primary-active",
            )}
          >
            {showAddForm ? <X size={16} weight="regular" /> : <Plus size={16} weight="regular" />}
            {showAddForm ? "Cancel" : "Add Lane"}
          </button>
        </div>
      </div>

      {/* Add Lane Form */}
      {showAddForm && (
        <div className="p-6 border-b border-hairline bg-surface-soft/50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted">Origin State</label>
              <select
                value={originState}
                onChange={(e) => setOriginState(e.target.value)}
                className="h-10 w-full rounded-md border border-hairline bg-canvas px-3.5 py-2 text-sm text-ink outline-none focus:border-ink"
              >
                <option value="">Select...</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted">Destination State</label>
              <select
                value={destState}
                onChange={(e) => setDestState(e.target.value)}
                className="h-10 w-full rounded-md border border-hairline bg-canvas px-3.5 py-2 text-sm text-ink outline-none focus:border-ink"
              >
                <option value="">Select...</option>
                {US_STATES.filter((s) => s !== originState).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted">Min $/mile (optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">$</span>
                <input
                  type="number"
                  value={minRatePerMile}
                  onChange={(e) => setMinRatePerMile(e.target.value)}
                  placeholder="0.00"
                  className="h-10 w-full rounded-md border border-hairline bg-canvas pl-7 pr-3.5 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted">Min $/trip (optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">$</span>
                <input
                  type="number"
                  value={minRatePerTrip}
                  onChange={(e) => setMinRatePerTrip(e.target.value)}
                  placeholder="0"
                  className="h-10 w-full rounded-md border border-hairline bg-canvas pl-7 pr-3.5 py-2 text-sm text-ink outline-none focus:border-ink"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted">Max distance (mi)</label>
              <input
                type="number"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                placeholder="Any"
                className="h-10 w-full rounded-md border border-hairline bg-canvas px-3.5 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </div>
          </div>

          <div className="space-y-2 mb-5">
            <label className="text-xs font-medium text-muted">Equipment Types (optional)</label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((eq) => (
                <button
                  key={eq.value}
                  onClick={() => toggleTruckType(eq.value)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md border transition-colors",
                    selectedTruckTypes.includes(eq.value)
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-canvas border-hairline text-muted hover:border-hairline hover:text-ink",
                  )}
                >
                  {eq.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddLane}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center h-11 px-6 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary-active transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <CircleNotch size={16} weight="regular" className="animate-spin" /> : "Save Lane"}
          </button>
        </div>
      )}

      {/* Lanes List */}
      <div className="divide-y divide-hairline">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <CircleNotch size={24} weight="regular" className="animate-spin text-primary" />
          </div>
        ) : lanes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted px-6">
            <MapTrifold size={40} weight="thin" className="mb-3 opacity-20" />
            <p className="text-sm font-medium">No preferred lanes</p>
            <p className="text-xs mt-1 text-center text-muted-foreground">Add lanes to get notified when matching loads are posted</p>
          </div>
        ) : (
          lanes.map((lane) => (
            <div key={lane._id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-soft transition-colors group">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{lane.originState}</span>
                  <ArrowRight size={14} weight="regular" className="text-muted" />
                  <span className="text-sm font-semibold text-ink">{lane.destinationState}</span>
                </div>
                <div className="flex items-center gap-3">
                  {lane.minRatePerMile && (
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <CurrencyDollar size={12} weight="regular" /> {lane.minRatePerMile}/mi
                    </span>
                  )}
                  {lane.minRatePerTrip && (
                    <span className="flex items-center gap-1 text-xs text-muted">
                      Min ${lane.minRatePerTrip}
                    </span>
                  )}
                  {lane.maxDistance && (
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <MapPin size={12} weight="regular" /> &le;{lane.maxDistance} mi
                    </span>
                  )}
                  {lane.truckTypes.length > 0 && (
                    <div className="flex items-center gap-1">
                      {lane.truckTypes.slice(0, 2).map((t) => (
                        <span key={t} className="badge-pill badge-pill-default text-xs">{t}</span>
                      ))}
                      {lane.truckTypes.length > 2 && (
                        <span className="text-xs text-muted">+{lane.truckTypes.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {lane.alertEnabled && (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <CheckCircle size={12} weight="fill" /> Active
                  </span>
                )}
                <button
                  onClick={() => handleDeleteLane(lane._id)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-card hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                >
                  <TrashSimple size={16} weight="regular" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
