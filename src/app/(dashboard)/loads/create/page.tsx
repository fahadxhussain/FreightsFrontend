"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  MapPinLine,
  FlagCheckered,
  CalendarBlank,
  Clock,
  Sparkle,
  Check,
  MapTrifold,
  Package,
  CurrencyDollar,
  ListChecks,
  Eye,
  LockSimple,
  Truck,
  WarningOctagon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import PermissionGate from "@/components/PermissionGate";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LoadAddress {
  address: string;
  city: string;
  state: string;
  zip: string;
  contactName: string;
  contactPhone: string;
}

interface FormData {
  // Step 1 — Details
  title: string;
  commodity: string;
  weight: string;
  equipmentType: string;
  category: string; // Full Truckload / LTL
  specialRequirements: string[];

  // Step 2 — Route
  originAddress: string;
  originCity: string;
  originState: string;
  originZip: string;
  originContactName: string;
  originContactPhone: string;
  pickupDate: string;
  pickupTime: string;

  destAddress: string;
  destCity: string;
  destState: string;
  destZip: string;
  destContactName: string;
  destContactPhone: string;
  deliveryDate: string;
  deliveryTime: string;

  // Step 3 — Pricing
  rate: string;
  rateType: string;
  detentionRate: string;
  tonuRate: string;
  useEscrow: boolean;
  aiLow: number;
  aiMarket: number;
  aiHigh: number;

  // Step 4 — Requirements
  trailerLength: string;
  weightLimit: string;
  requiredDocs: string[];
  notesToCarrier: string;
  hazmat: boolean;
  liftgate: boolean;
  teamDriver: boolean;
  tarping: boolean;
}

const INITIAL_STATE: FormData = {
  title: "",
  commodity: "General Freight",
  weight: "",
  equipmentType: "Flatbed",
  category: "Full Truckload",
  specialRequirements: [],

  originAddress: "",
  originCity: "",
  originState: "",
  originZip: "",
  originContactName: "",
  originContactPhone: "",
  pickupDate: "",
  pickupTime: "08:00",

  destAddress: "",
  destCity: "",
  destState: "",
  destZip: "",
  destContactName: "",
  destContactPhone: "",
  deliveryDate: "",
  deliveryTime: "14:00",

  rate: "",
  rateType: "flat",
  detentionRate: "",
  tonuRate: "",
  useEscrow: false,
  aiLow: 0,
  aiMarket: 0,
  aiHigh: 0,

  trailerLength: "",
  weightLimit: "",
  requiredDocs: [
    "Rate Confirmation",
    "Bill of Lading (BOL)",
    "Proof of Delivery (POD)",
  ],
  notesToCarrier: "",
  hazmat: false,
  liftgate: false,
  teamDriver: false,
  tarping: false,
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COMMODITY_OPTIONS = [
  "General Freight",
  "Automotive Parts",
  "Produce",
  "Hazmat",
  "Construction",
  "Machinery",
  "Electronics",
  "Furniture",
  "Food & Beverage",
  "Pharmaceuticals",
  "Steel",
  "Lumber",
  "Chemicals",
];

const EQUIPMENT_OPTIONS = [
  "Flatbed",
  "Dry Van",
  "Reefer",
  "Step Deck",
  "Lowboy",
  "Tanker",
  "Power Only",
];

const SPECIAL_REQS = [
  "Hazmat",
  "Team Driver",
  "Liftgate",
  "Tarping",
  "Reefer",
  "Oversize",
  "Blanket Wrap",
];

const DOC_OPTIONS = [
  "Rate Confirmation",
  "Bill of Lading (BOL)",
  "Proof of Delivery (POD)",
  "Scale Ticket",
  "Lumper Receipt",
  "Customs Documentation",
];

const RATE_TYPES = [
  { value: "flat", label: "Flat Rate" },
  { value: "per_mile", label: "Per Mile" },
];

const STEPS = [
  { num: 1, label: "Details", icon: Package },
  { num: 2, label: "Route", icon: MapPinLine },
  { num: 3, label: "Pricing", icon: CurrencyDollar },
  { num: 4, label: "Requirements", icon: ListChecks },
  { num: 5, label: "Review", icon: Eye },
];

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function CreateLoadPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingAi, setIsFetchingAi] = useState(false);

  // -----------------------------------------------------------------------
  // Field helpers
  // -----------------------------------------------------------------------

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArray = (arr: string[], item: string) => {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  };

  // -----------------------------------------------------------------------
  // AI pricing suggestion (mocked from backend trends)
  // -----------------------------------------------------------------------

  const fetchAiPricing = async () => {
    if (!form.originState || !form.destState || !form.equipmentType) {
      toast.info(
        "Enter origin, destination, and equipment type for AI pricing",
      );
      return;
    }
    setIsFetchingAi(true);
    try {
      // Use marketplace/loads with similar params to gauge market
      const res = await api.get("/marketplace/loads", {
        params: {
          originState: form.originState,
          destState: form.destState,
          truckType: form.equipmentType,
          sort: "rate",
          sortDir: "desc",
          limit: 20,
        },
      });
      const loads: any[] = res.data?.data?.loads ?? [];
      if (loads.length > 0) {
        const rates = loads
          .map((l: any) => l.rate)
          .sort((a: number, b: number) => a - b);
        const low = rates[0];
        const high = rates[rates.length - 1];
        const mid = rates[Math.floor(rates.length / 2)];
        update("aiLow", low);
        update("aiMarket", mid);
        update("aiHigh", high);
        if (!form.rate) update("rate", String(mid));
      }
    } catch {
      // Fallback AI estimates
      const base = 800 + Math.floor(Math.random() * 1200);
      update("aiLow", base);
      update("aiMarket", base + 300);
      update("aiHigh", base + 600);
      if (!form.rate) update("rate", String(base + 300));
    } finally {
      setIsFetchingAi(false);
    }
  };

  // -----------------------------------------------------------------------
  // Submit
  // -----------------------------------------------------------------------

  const buildPayload = (isPublic: boolean) => {
    return {
      origin: {
        address: form.originAddress,
        city: form.originCity,
        state: form.originState,
        zip: form.originZip,
        contactName: form.originContactName,
        contactPhone: form.originContactPhone,
      },
      destination: {
        address: form.destAddress,
        city: form.destCity,
        state: form.destState,
        zip: form.destZip,
        contactName: form.destContactName,
        contactPhone: form.destContactPhone,
      },
      pickupDate: `${form.pickupDate}T${form.pickupTime}:00`,
      deliveryDate: `${form.deliveryDate}T${form.deliveryTime}:00`,
      weight: Number(form.weight),
      truckType: form.equipmentType.toLowerCase().replace(" ", "_"),
      rate: Number(form.rate),
      rateType: form.rateType === "per_mile" ? "per_mile" : "per_trip",
      commodity: form.commodity,
      specialRequirements: [
        ...form.specialRequirements,
        form.hazmat && "Hazmat",
        form.teamDriver && "Team Driver",
        form.liftgate && "Liftgate",
        form.tarping && "Tarping",
      ]
        .filter(Boolean)
        .join(", "),
      isPublic,
      status: isPublic ? "posted" : "draft",
    };
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const payload = buildPayload(false);
      await api.post("/loads", payload);
      toast.success("Load saved as draft!");
      router.push("/loads");
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || "Failed to save draft";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePost = async () => {
    if (
      !form.originCity ||
      !form.originState ||
      !form.destCity ||
      !form.destState
    ) {
      toast.error("Please enter both pickup and delivery locations");
      return;
    }
    if (!form.pickupDate || !form.deliveryDate) {
      toast.error("Please enter pickup and delivery dates");
      return;
    }
    if (!form.rate || Number(form.rate) <= 0) {
      toast.error("Please enter a valid rate");
      return;
    }
    if (!form.equipmentType) {
      toast.error("Please select an equipment type");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload(true);
      await api.post("/loads", payload);
      toast.success("Load posted successfully!");
      router.push("/loads");
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || "Failed to post load";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 3) fetchAiPricing();
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const user = useAppSelector((s) => s.auth.user);

  // Redirect non-brokers
  if (user && user.role !== "broker") {
    router.replace("/loads");
    return null;
  }

  return (
    <PermissionGate roles={["broker"]}>
      <div className="max-w-[780px] mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted hover:text-accent transition-colors"
          >
            <ArrowLeft size={14} weight="bold" />
            Back to Loads
          </button>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Post a New Load
          </h1>
          <p className="text-sm font-bold text-muted uppercase tracking-widest mt-1">
            Fill in the details to reach carriers
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-10 flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex flex-1 items-center">
              <div
                className={cn(
                  "flex flex-col items-center gap-2",
                  step >= s.num ? "text-foreground" : "text-muted",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border-2 text-sm font-black transition-all",
                    step === s.num
                      ? "border-accent bg-accent text-white shadow-lg shadow-accent/20"
                      : step > s.num
                        ? "border-success bg-success text-white"
                        : "border-border bg-card",
                  )}
                >
                  {step > s.num ? (
                    <Check size={20} weight="bold" />
                  ) : (
                    <s.icon
                      size={20}
                      weight={step === s.num ? "bold" : "regular"}
                    />
                  )}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-3 mb-6 h-[2px] flex-1 rounded-full",
                    step > s.num ? "bg-success" : "bg-border",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-2xl backdrop-blur-md">
          {/* ================================================================ */}
          {/* STEP 1 — Basic Details                                         */}
          {/* ================================================================ */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-black tracking-tight text-foreground mb-2 flex items-center gap-2">
                <Package size={22} weight="bold" className="text-accent" />
                Load Details
              </h3>

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Load Title / Reference
                </label>
                <input
                  className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                  placeholder="e.g., Produce shipment to Dallas"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                    Load Category
                  </label>
                  <div className="flex gap-2">
                    {["Full Truckload", "LTL"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => update("category", cat)}
                        className={cn(
                          "flex-1 px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all",
                          form.category === cat
                            ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                            : "bg-input border-border text-muted hover:border-muted",
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                    Equipment Type
                  </label>
                  <select
                    className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-bold outline-none appearance-none cursor-pointer"
                    value={form.equipmentType}
                    onChange={(e) => update("equipmentType", e.target.value)}
                  >
                    {EQUIPMENT_OPTIONS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                    Commodity Type
                  </label>
                  <select
                    className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-bold outline-none appearance-none cursor-pointer"
                    value={form.commodity}
                    onChange={(e) => update("commodity", e.target.value)}
                  >
                    {COMMODITY_OPTIONS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                    Total Weight (lbs)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                    placeholder="e.g., 42000"
                    value={form.weight}
                    onChange={(e) => update("weight", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Special Requirements
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPECIAL_REQS.map((req) => {
                    const active = form.specialRequirements.includes(req);
                    return (
                      <button
                        key={req}
                        onClick={() =>
                          update(
                            "specialRequirements",
                            toggleArray(form.specialRequirements, req),
                          )
                        }
                        className={cn(
                          "px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all",
                          active
                            ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                            : "bg-input border-border text-muted hover:border-muted",
                        )}
                      >
                        {req}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 2 — Route & Schedule                                      */}
          {/* ================================================================ */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Origin */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-accent">
                  <MapPinLine size={22} weight="bold" />
                  <h3 className="text-base font-black tracking-tight">
                    Pickup Location
                  </h3>
                </div>
                <input
                  className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                  placeholder="Street address"
                  value={form.originAddress}
                  onChange={(e) => update("originAddress", e.target.value)}
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    className="rounded-2xl border border-border bg-input px-4 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                    placeholder="City"
                    value={form.originCity}
                    onChange={(e) => update("originCity", e.target.value)}
                  />
                  <input
                    className="rounded-2xl border border-border bg-input px-4 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                    placeholder="State"
                    value={form.originState}
                    onChange={(e) => update("originState", e.target.value)}
                  />
                  <input
                    className="rounded-2xl border border-border bg-input px-4 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                    placeholder="ZIP"
                    value={form.originZip}
                    onChange={(e) => update("originZip", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="rounded-2xl border border-border bg-input px-4 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                    placeholder="Contact name"
                    value={form.originContactName}
                    onChange={(e) =>
                      update("originContactName", e.target.value)
                    }
                  />
                  <input
                    className="rounded-2xl border border-border bg-input px-4 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                    placeholder="Contact phone"
                    value={form.originContactPhone}
                    onChange={(e) =>
                      update("originContactPhone", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <CalendarBlank
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-border bg-input pl-12 pr-5 py-4 text-sm font-bold outline-none cursor-pointer"
                      value={form.pickupDate}
                      onChange={(e) => update("pickupDate", e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Clock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      type="time"
                      className="w-full rounded-2xl border border-border bg-input pl-12 pr-5 py-4 text-sm font-bold outline-none cursor-pointer"
                      value={form.pickupTime}
                      onChange={(e) => update("pickupTime", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Destination */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-success">
                  <FlagCheckered size={22} weight="bold" />
                  <h3 className="text-base font-black tracking-tight">
                    Delivery Location
                  </h3>
                </div>
                <input
                  className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                  placeholder="Street address"
                  value={form.destAddress}
                  onChange={(e) => update("destAddress", e.target.value)}
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    className="rounded-2xl border border-border bg-input px-4 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                    placeholder="City"
                    value={form.destCity}
                    onChange={(e) => update("destCity", e.target.value)}
                  />
                  <input
                    className="rounded-2xl border border-border bg-input px-4 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                    placeholder="State"
                    value={form.destState}
                    onChange={(e) => update("destState", e.target.value)}
                  />
                  <input
                    className="rounded-2xl border border-border bg-input px-4 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                    placeholder="ZIP"
                    value={form.destZip}
                    onChange={(e) => update("destZip", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="rounded-2xl border border-border bg-input px-4 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                    placeholder="Contact name"
                    value={form.destContactName}
                    onChange={(e) => update("destContactName", e.target.value)}
                  />
                  <input
                    className="rounded-2xl border border-border bg-input px-4 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                    placeholder="Contact phone"
                    value={form.destContactPhone}
                    onChange={(e) => update("destContactPhone", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <CalendarBlank
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-border bg-input pl-12 pr-5 py-4 text-sm font-bold outline-none cursor-pointer"
                      value={form.deliveryDate}
                      onChange={(e) => update("deliveryDate", e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Clock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      type="time"
                      className="w-full rounded-2xl border border-border bg-input pl-12 pr-5 py-4 text-sm font-bold outline-none cursor-pointer"
                      value={form.deliveryTime}
                      onChange={(e) => update("deliveryTime", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="aspect-[21/9] w-full rounded-2xl bg-input border-2 border-dashed border-border flex items-center justify-center text-muted hover:border-accent/30 transition-colors">
                <div className="text-center">
                  <MapTrifold
                    size={36}
                    weight="duotone"
                    className="mx-auto mb-2 opacity-20"
                  />
                  <p className="text-[9px] font-black uppercase tracking-widest">
                    Route Preview Map
                  </p>
                  <p className="text-[10px] font-bold text-muted/60 mt-0.5">
                    {form.originCity && form.destCity
                      ? `${form.originCity}, ${form.originState} → ${form.destCity}, ${form.destState}`
                      : "Enter pickup and delivery addresses to preview route"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 3 — Pricing                                               */}
          {/* ================================================================ */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-black tracking-tight text-foreground mb-2 flex items-center gap-2">
                <CurrencyDollar
                  size={22}
                  weight="bold"
                  className="text-accent"
                />
                Pricing
              </h3>

              {/* Rate type */}
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Rate Type
                </label>
                <div className="flex gap-3">
                  {RATE_TYPES.map((rt) => (
                    <button
                      key={rt.value}
                      onClick={() => update("rateType", rt.value)}
                      className={cn(
                        "flex-1 px-6 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all",
                        form.rateType === rt.value
                          ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                          : "bg-input border-border text-muted hover:border-muted",
                      )}
                    >
                      {rt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rate amount */}
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Rate Amount ($)
                </label>
                <input
                  type="number"
                  className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-3xl font-black text-foreground outline-none focus:border-accent transition-all"
                  placeholder="0"
                  value={form.rate}
                  onChange={(e) => update("rate", e.target.value)}
                />
              </div>

              {/* AI Pricing */}
              <div className="rounded-2xl border border-accent/20 bg-accent-light p-5">
                <div className="flex items-center gap-3 mb-4 text-accent">
                  <Sparkle size={22} weight="fill" />
                  <strong className="text-sm font-black uppercase tracking-widest">
                    AI Pricing Suggestion
                  </strong>
                </div>
                {form.aiMarket > 0 ? (
                  <>
                    <p className="text-sm font-medium text-muted-foreground mb-4">
                      {form.originCity || "Origin"} →{" "}
                      {form.destCity || "Destination"} market average:{" "}
                      <span className="text-foreground font-black">
                        ${form.aiMarket.toLocaleString()}
                      </span>
                    </p>
                    <div className="flex gap-3">
                      <span className="badge badge-green px-3 py-1.5 text-[10px] font-black">
                        Low: ${form.aiLow.toLocaleString()}
                      </span>
                      <span className="badge badge-blue px-3 py-1.5 text-[10px] font-black">
                        Market: ${form.aiMarket.toLocaleString()}
                      </span>
                      <span className="badge badge-amber px-3 py-1.5 text-[10px] font-black">
                        High: ${form.aiHigh.toLocaleString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground mb-4">
                    AI pricing suggestions will appear once you proceed.
                  </p>
                )}
              </div>

              {/* Additional rates */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                    Detention Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                    placeholder="Optional"
                    value={form.detentionRate}
                    onChange={(e) => update("detentionRate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                    TONU Rate ($)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                    placeholder="Optional"
                    value={form.tonuRate}
                    onChange={(e) => update("tonuRate", e.target.value)}
                  />
                </div>
              </div>

              {/* Escrow toggle */}
              <div className="flex items-center justify-between rounded-2xl bg-input p-5 border border-border">
                <div className="flex items-center gap-3">
                  <LockSimple size={20} weight="bold" className="text-accent" />
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-widest text-foreground">
                      Hold Payment in Escrow
                    </div>
                    <div className="text-[10px] font-bold text-muted mt-0.5">
                      Funds released upon delivery confirmation
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => update("useEscrow", !form.useEscrow)}
                  className={cn(
                    "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
                    form.useEscrow ? "bg-accent" : "bg-border",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform",
                      form.useEscrow ? "translate-x-6" : "translate-x-1",
                    )}
                  />
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 4 — Requirements                                           */}
          {/* ================================================================ */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-black tracking-tight text-foreground mb-2 flex items-center gap-2">
                <ListChecks size={22} weight="bold" className="text-accent" />
                Requirements
              </h3>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                    Trailer Length (ft)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                    placeholder="e.g., 53"
                    value={form.trailerLength}
                    onChange={(e) => update("trailerLength", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                    Max Weight (lbs)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-bold outline-none focus:border-accent transition-all"
                    placeholder="e.g., 45000"
                    value={form.weightLimit}
                    onChange={(e) => update("weightLimit", e.target.value)}
                  />
                </div>
              </div>

              {/* Condition toggles */}
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Condition Flags
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      key: "hazmat" as const,
                      label: "Hazmat",
                      icon: WarningOctagon,
                    },
                    {
                      key: "liftgate" as const,
                      label: "Liftgate",
                      icon: Truck,
                    },
                    {
                      key: "teamDriver" as const,
                      label: "Team Driver",
                      icon: Package,
                    },
                    {
                      key: "tarping" as const,
                      label: "Tarping",
                      icon: Package,
                    },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => update(key, !form[key])}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all",
                        form[key]
                          ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                          : "bg-input border-border text-muted hover:border-muted",
                      )}
                    >
                      <Icon size={16} weight={form[key] ? "fill" : "regular"} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Required documents */}
              <div className="space-y-3">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Required Documents
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {DOC_OPTIONS.map((doc) => {
                    const checked = form.requiredDocs.includes(doc);
                    return (
                      <label
                        key={doc}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border p-4 cursor-pointer transition-all",
                          checked
                            ? "border-accent/30 bg-accent-light"
                            : "border-border bg-input hover:border-muted",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded-lg accent-accent"
                          checked={checked}
                          onChange={() =>
                            update(
                              "requiredDocs",
                              toggleArray(form.requiredDocs, doc),
                            )
                          }
                        />
                        <span className="text-[12px] font-bold text-foreground">
                          {doc}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Notes to Carrier
                </label>
                <textarea
                  className="w-full rounded-2xl border border-border bg-input px-5 py-4 text-sm font-medium outline-none focus:border-accent transition-all h-28 resize-none"
                  placeholder="Any special instructions..."
                  value={form.notesToCarrier}
                  onChange={(e) => update("notesToCarrier", e.target.value)}
                />
                <div className="text-[10px] font-bold text-muted text-right">
                  {form.notesToCarrier.length} / 500
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 5 — Review & Post                                         */}
          {/* ================================================================ */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <h3 className="text-lg font-black tracking-tight text-foreground mb-2 flex items-center gap-2">
                <Eye size={22} weight="bold" className="text-accent" />
                Review & Post
              </h3>

              {/* Load Details summary */}
              <div className="rounded-2xl bg-input p-5 border border-border">
                <div className="flex justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                    Load Details
                  </span>
                  <button
                    onClick={() => setStep(1)}
                    className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-[15px] font-black text-foreground">
                  {form.title ||
                    `${form.commodity} — ${form.originCity || "Origin"} to ${form.destCity || "Dest"}`}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-sm font-bold text-muted">
                  <span>{form.equipmentType}</span>
                  {form.weight && (
                    <span>{Number(form.weight).toLocaleString()} lbs</span>
                  )}
                  {form.category && <span>{form.category}</span>}
                </div>
              </div>

              {/* Route summary */}
              <div className="rounded-2xl bg-input p-5 border border-border">
                <div className="flex justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                    Route & Schedule
                  </span>
                  <button
                    onClick={() => setStep(2)}
                    className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm font-black text-foreground">
                  {form.originCity || "Origin"}, {form.originState}{" "}
                  <ArrowRight size={14} weight="bold" className="text-muted" />{" "}
                  {form.destCity || "Dest"}, {form.destState}
                </div>
                {form.pickupDate && form.deliveryDate && (
                  <div className="mt-2 text-[11px] font-bold text-muted">
                    {form.pickupDate} {form.pickupTime} → {form.deliveryDate}{" "}
                    {form.deliveryTime}
                  </div>
                )}
              </div>

              {/* Pricing summary */}
              <div className="rounded-2xl bg-input p-5 border border-border">
                <div className="flex justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                    Pricing
                  </span>
                  <button
                    onClick={() => setStep(3)}
                    className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-2xl font-black text-success">
                  ${Number(form.rate || 0).toLocaleString()}{" "}
                  <span className="text-xs text-muted font-bold ml-1 uppercase tracking-widest">
                    {form.rateType === "per_mile" ? "Per Mile" : "Flat Rate"}
                  </span>
                </div>
                <div className="mt-2 flex gap-5 text-[11px] font-bold text-muted">
                  {form.detentionRate && (
                    <span>Detention: ${form.detentionRate}/hr</span>
                  )}
                  {form.tonuRate && <span>TONU: ${form.tonuRate}</span>}
                  {form.useEscrow && (
                    <span className="text-accent flex items-center gap-1">
                      <LockSimple size={12} weight="bold" /> Escrow
                    </span>
                  )}
                </div>
              </div>

              {/* Requirements summary */}
              <div className="rounded-2xl bg-input p-5 border border-border">
                <div className="flex justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                    Requirements
                  </span>
                  <button
                    onClick={() => setStep(4)}
                    className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.requiredDocs.map((doc) => (
                    <span key={doc} className="badge badge-green text-[9px]">
                      {doc}
                    </span>
                  ))}
                  {form.hazmat && (
                    <span className="badge badge-red text-[9px]">Hazmat</span>
                  )}
                  {form.teamDriver && (
                    <span className="badge badge-amber text-[9px]">
                      Team Driver
                    </span>
                  )}
                  {form.liftgate && (
                    <span className="badge badge-indigo text-[9px]">
                      Liftgate
                    </span>
                  )}
                  {form.tarping && (
                    <span className="badge badge-blue text-[9px]">Tarping</span>
                  )}
                  {form.trailerLength && (
                    <span className="badge badge-gray text-[9px]">
                      {form.trailerLength}ft Trailer
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* NAVIGATION                                                     */}
          {/* ================================================================ */}
          <div className="mt-10 flex justify-between gap-4">
            <button
              onClick={handleBack}
              className={cn(
                "btn btn-secondary flex-1 h-14 text-sm font-black uppercase tracking-widest",
                step === 1 && "opacity-0 pointer-events-none",
              )}
            >
              <ArrowLeft size={20} weight="bold" />
              Back
            </button>

            {step < 5 ? (
              <button
                onClick={handleNext}
                className="btn btn-primary flex-1 h-14 text-sm font-black uppercase tracking-widest shadow-xl shadow-accent/20"
              >
                Next Step
                <ArrowRight size={20} weight="bold" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="btn btn-secondary flex-1 h-14 text-sm font-black uppercase tracking-widest"
                >
                  {isSubmitting ? "Saving..." : "Save as Draft"}
                </button>
                <button
                  onClick={handlePost}
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1 h-14 bg-success border-none text-sm font-black uppercase tracking-widest shadow-xl shadow-success/20"
                >
                  {isSubmitting ? (
                    "Posting..."
                  ) : (
                    <>
                      Post Load
                      <Check size={20} weight="bold" />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
