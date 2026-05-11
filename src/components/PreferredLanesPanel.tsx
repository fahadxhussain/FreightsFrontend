"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  X,
  TrashSimple,
  MapPin,
  CurrencyDollar,
  Truck,
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

  // Form state
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
    <div className="rounded-[2rem] border border-border bg-card shadow-xl">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light text-accent shadow-lg shadow-accent/10">
              <MapTrifold size={20} weight="bold" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-foreground">My Preferred Lanes</h3>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                Get alerts for loads matching your routes
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className={cn(
              "btn h-10 px-5 text-[10px] font-black uppercase tracking-widest shadow-lg",
              showAddForm ? "btn-secondary" : "btn-primary",
            )}
          >
            {showAddForm ? <X size={16} weight="bold" /> : <Plus size={16} weight="bold" />}
            {showAddForm ? "Cancel" : "Add Lane"}
          </button>
        </div>
      </div>

      {/* Add Lane Form */}
      {showAddForm && (
        <div className="p-6 border-b border-border bg-input/30 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">Origin State</label>
              <select
                value={originState}
                onChange={(e) => setOriginState(e.target.value)}
                className="w-full rounded-2xl border border-border bg-input px-4 py-3 text-sm font-black outline-none focus:border-accent"
              >
                <option value="">Select...</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">Destination State</label>
              <select
                value={destState}
                onChange={(e) => setDestState(e.target.value)}
                className="w-full rounded-2xl border border-border bg-input px-4 py-3 text-sm font-black outline-none focus:border-accent"
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
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">Min $/mile (optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-bold">$</span>
                <input
                  type="number"
                  value={minRatePerMile}
                  onChange={(e) => setMinRatePerMile(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-2xl border border-border bg-input pl-7 pr-4 py-3 text-sm font-black outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">Min $/trip (optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-bold">$</span>
                <input
                  type="number"
                  value={minRatePerTrip}
                  onChange={(e) => setMinRatePerTrip(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-2xl border border-border bg-input pl-7 pr-4 py-3 text-sm font-black outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">Max distance (mi)</label>
              <input
                type="number"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                placeholder="Any"
                className="w-full rounded-2xl border border-border bg-input px-4 py-3 text-sm font-black outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-2 mb-5">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">Equipment Types (optional)</label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((eq) => (
                <button
                  key={eq.value}
                  onClick={() => toggleTruckType(eq.value)}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all",
                    selectedTruckTypes.includes(eq.value)
                      ? "bg-accent border-accent text-white"
                      : "bg-input border-border text-muted hover:border-muted",
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
            className="btn btn-primary h-12 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent/20 disabled:opacity-60"
          >
            {isSubmitting ? <CircleNotch size={16} weight="bold" className="animate-spin" /> : "Save Lane"}
          </button>
        </div>
      )}

      {/* Lanes List */}
      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <CircleNotch size={24} weight="bold" className="animate-spin text-accent" />
          </div>
        ) : lanes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted px-6">
            <MapTrifold size={40} weight="thin" className="mb-3 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest">No preferred lanes</p>
            <p className="text-[10px] mt-1 text-center">Add lanes to get notified when matching loads are posted</p>
          </div>
        ) : (
          lanes.map((lane) => (
            <div key={lane._id} className="flex items-center justify-between px-6 py-4 hover:bg-card-hover transition-colors group">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-foreground">{lane.originState}</span>
                  <ArrowRight size={14} weight="bold" className="text-muted" />
                  <span className="text-sm font-black text-foreground">{lane.destinationState}</span>
                </div>
                <div className="flex items-center gap-3">
                  {lane.minRatePerMile && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-muted">
                      <CurrencyDollar size={12} weight="bold" /> {lane.minRatePerMile}/mi
                    </span>
                  )}
                  {lane.minRatePerTrip && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-muted">
                      Min ${lane.minRatePerTrip}
                    </span>
                  )}
                  {lane.maxDistance && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-muted">
                      <MapPin size={12} weight="bold" /> ≤{lane.maxDistance} mi
                    </span>
                  )}
                  {lane.truckTypes.length > 0 && (
                    <div className="flex items-center gap-1">
                      {lane.truckTypes.slice(0, 2).map((t) => (
                        <span key={t} className="badge badge-gray text-[9px] h-5">{t}</span>
                      ))}
                      {lane.truckTypes.length > 2 && (
                        <span className="text-[9px] text-muted font-bold">+{lane.truckTypes.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {lane.alertEnabled && (
                  <span className="flex items-center gap-1 text-[9px] font-black text-success uppercase tracking-widest">
                    <CheckCircle size={12} weight="fill" /> Active
                  </span>
                )}
                <button
                  onClick={() => handleDeleteLane(lane._id)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:bg-danger-light hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                >
                  <TrashSimple size={16} weight="bold" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}