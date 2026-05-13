"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  ShieldCheck,
  Plug,
  Bell,
  Briefcase,
  WarningCircle,
  ArrowRight,
  CreditCard,
  LockSimple,
  DeviceMobile,
  PencilSimple,
  Spinner,
  Buildings,
  IdentificationBadge,
  Truck,
  MapPin,
  Phone,
  Globe,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/store/slices/authSlice";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";

// ── Types ───────────────────────────────────────────────────────────────────
/** Frontend UI state: event-keyed for easy toggling */
interface NotificationUIState {
  bookings?: { email?: boolean; push?: boolean; inapp?: boolean };
  payments?: { email?: boolean; push?: boolean; inapp?: boolean };
  messages?: { email?: boolean; push?: boolean; inapp?: boolean };
  load_updates?: { email?: boolean; push?: boolean; inapp?: boolean };
  disputes?: { email?: boolean; push?: boolean; inapp?: boolean };
}

/** Backend shape: channel-keyed */
interface NotificationPreferencesDTO {
  email?: { enabled?: boolean; events?: string[] };
  push?: { enabled?: boolean; events?: string[] };
  inapp?: { enabled?: boolean; events?: string[] };
}

type NotificationKey = keyof NotificationUIState;

const ALL_NOTIFICATION_KEYS: NotificationKey[] = [
  "bookings",
  "payments",
  "messages",
  "load_updates",
  "disputes",
];

/** Convert backend channel-keyed shape → frontend event-keyed UI state */
function toUIState(
  dto: NotificationPreferencesDTO | null | undefined,
): NotificationUIState {
  if (!dto) {
    return {
      bookings: { email: true, push: true, inapp: true },
      payments: { email: true, push: true, inapp: true },
      messages: { email: true, push: true, inapp: true },
      load_updates: { email: true, push: true, inapp: true },
      disputes: { email: true, push: false, inapp: false },
    };
  }
  const result: NotificationUIState = {};
  for (const key of ALL_NOTIFICATION_KEYS) {
    result[key] = {
      email: dto.email?.events?.includes(key) ?? true,
      push: dto.push?.events?.includes(key) ?? true,
      inapp: dto.inapp?.events?.includes(key) ?? true,
    };
  }
  return result;
}

/** Convert frontend event-keyed UI state → backend channel-keyed DTO */
function toBackendDTO(ui: NotificationUIState): NotificationPreferencesDTO {
  const dto: NotificationPreferencesDTO = {
    email: { enabled: true, events: [] },
    push: { enabled: true, events: [] },
    inapp: { enabled: true, events: [] },
  };
  for (const key of ALL_NOTIFICATION_KEYS) {
    const channels = ui[key];
    if (!channels) continue;
    if (channels.email) dto.email!.events!.push(key);
    if (channels.push) dto.push!.events!.push(key);
    if (channels.inapp) dto.inapp!.events!.push(key);
  }
  return dto;
}

// ── Validation Schemas ──────────────────────────────────────────────────────
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  phone: z.string().optional(),
  timezone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const businessSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(100),
  mcNumber: z.string().optional(),
  dotNumber: z.string().optional(),
  address: z
    .object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
    })
    .optional(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

const deleteSchema = z.object({
  password: z.string().min(1, "Enter your password to confirm"),
});

type DeleteFormData = z.infer<typeof deleteSchema>;

// ── Constants ───────────────────────────────────────────────────────────────
const TIMEZONES = Intl.supportedValuesOf
  ? Intl.supportedValuesOf("timeZone")
  : [
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
    ];

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security & Password", icon: ShieldCheck },
  { id: "accounts", label: "Connected Accounts", icon: Plug },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "business", label: "Business Profile", icon: Briefcase },
  {
    id: "danger",
    label: "Danger Zone",
    icon: WarningCircle,
    color: "text-danger",
  },
];

const NOTIFICATION_EVENTS: {
  key: NotificationKey;
  title: string;
  desc: string;
}[] = [
  {
    key: "bookings",
    title: "New Booking Requests",
    desc: "Get notified when carriers bid on your loads",
  },
  {
    key: "payments",
    title: "Payment Events",
    desc: "Escrow charges, releases, and refunds",
  },
  {
    key: "messages",
    title: "New Messages",
    desc: "Direct messages and system notifications",
  },
  {
    key: "load_updates",
    title: "Load Status Updates",
    desc: "In-transit status changes and delivery confirmations",
  },
  {
    key: "disputes",
    title: "Dispute Events",
    desc: "When disputes are filed or resolved",
  },
];

// ── Sub-components ──────────────────────────────────────────────────────────

/** Shimmer for a form field */
function FieldSkeleton({ wide }: { wide?: boolean }) {
  return (
    <div className={cn("space-y-2", wide && "col-span-2")}>
      <div className="ml-1 h-3 w-20 rounded-md bg-input animate-pulse" />
      <div className="h-12 w-full rounded-2xl bg-input animate-pulse" />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-input/50 border border-border">
        <div className="h-24 w-24 rounded-[2rem] bg-input animate-pulse" />
        <div className="space-y-2">
          <div className="h-5 w-28 rounded-md bg-input animate-pulse" />
          <div className="h-3 w-40 rounded-md bg-input animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <FieldSkeleton />
        <FieldSkeleton />
      </div>
      <FieldSkeleton />
      <FieldSkeleton />
    </div>
  );
}

/** Toggle switch */
function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "h-8 w-14 rounded-full transition-all relative p-1",
        checked ? "bg-accent" : "bg-muted/30",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <div
        className={cn(
          "h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-0",
        )}
      />
    </button>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  // ── Profile ───────────────────────────────────────────────────────────
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) {
        setProfileLoading(false);
        return;
      }
      try {
        const { data } = await api.get(`/users/${user.id}`);
        const profile = data.data;
        if (profile) {
          profileForm.reset({
            firstName: profile.firstName || user.firstName || "",
            lastName: profile.lastName || user.lastName || "",
            phone: profile.phone || "",
            timezone:
              profile.timezone ||
              Intl.DateTimeFormat().resolvedOptions().timeZone,
          });
        }
      } catch {
        // keep defaults from user store
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProfileSave = async (formData: ProfileFormData) => {
    if (!user?.id) return;
    setSavingProfile(true);
    try {
      const { data } = await api.patch(`/users/${user.id}`, formData);
      dispatch(updateUser(data.data || formData));
      toast.success("Profile updated");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
      toast.error(
        axiosErr.response?.data?.error?.message || "Failed to update profile",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Password ──────────────────────────────────────────────────────────
  const [changingPassword, setChangingPassword] = useState(false);
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handlePasswordChange = async (formData: PasswordFormData) => {
    setChangingPassword(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Password changed successfully");
      passwordForm.reset();
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
      toast.error(
        axiosErr.response?.data?.error?.message || "Failed to change password",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ── Connected Accounts / Stripe ───────────────────────────────────────
  const [stripeStatus, setStripeStatus] = useState<
    "loading" | "connected" | "disconnected"
  >("loading");
  const [stripeLast4, setStripeLast4] = useState("");
  const [stripeBank, setStripeBank] = useState("");

  useEffect(() => {
    async function checkStripe() {
      try {
        // Attempt to get stripe status from auth/me or the JWT itself
        const { data } = await api.get("/auth/me");
        const me = data.data || data;
        if (me.stripeConnected || me.stripeAccountId) {
          setStripeStatus("connected");
          setStripeLast4(me.stripeLast4 || "4242");
          setStripeBank(me.stripeBank || "");
        } else {
          setStripeStatus("disconnected");
        }
      } catch {
        setStripeStatus("disconnected");
      }
    }
    if (activeTab === "accounts") checkStripe();
  }, [activeTab]);

  const handleStripeConnect = async () => {
    try {
      const { data } = await api.post("/stripe/connect-account");
      if (data.url) {
        window.location.assign(data.url);
      } else toast.success("Stripe account link created");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
      toast.error(
        axiosErr.response?.data?.error?.message || "Failed to connect Stripe",
      );
    }
  };

  // ── Notifications ─────────────────────────────────────────────────────
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotificationUIState>({});

  useEffect(() => {
    async function fetchNotifs() {
      if (!user?.id) {
        setNotifLoading(false);
        return;
      }
      try {
        const { data } = await api.get(`/users/${user.id}`);
        const prefs = data.data?.notificationPreferences;
        setNotifPrefs(toUIState(prefs));
      } catch {
        setNotifPrefs(toUIState(null));
      } finally {
        setNotifLoading(false);
      }
    }
    fetchNotifs();
  }, [user?.id]);

  const toggleNotifChannel = (
    eventKey: NotificationKey,
    channel: "email" | "push" | "inapp",
  ) => {
    setNotifPrefs((prev) => {
      const event = prev[eventKey] || {};
      return {
        ...prev,
        [eventKey]: { ...event, [channel]: !event[channel] },
      };
    });
  };

  const handleNotifSave = async () => {
    if (!user?.id) return;
    setNotifSaving(true);
    try {
      await api.patch(`/users/${user.id}`, {
        notificationPreferences: toBackendDTO(notifPrefs),
      });
      toast.success("Notification preferences saved");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
      toast.error(
        axiosErr.response?.data?.error?.message || "Failed to save preferences",
      );
    } finally {
      setNotifSaving(false);
    }
  };

  // ── Business Profile ──────────────────────────────────────────────────
  const [businessLoading, setBusinessLoading] = useState(true);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const businessForm = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      companyName: "",
      mcNumber: "",
      dotNumber: "",
      address: { line1: "", line2: "", city: "", state: "", zip: "" },
    },
  });

  useEffect(() => {
    async function fetchBusiness() {
      if (!user?.id) {
        setBusinessLoading(false);
        return;
      }
      try {
        const { data } = await api.get(`/users/${user.id}/business-profile`);
        const bp = data.data;
        if (bp) {
          businessForm.reset({
            companyName: bp.companyName || "",
            mcNumber: bp.mcNumber || "",
            dotNumber: bp.dotNumber || "",
            address: {
              line1: bp.address?.line1 || "",
              line2: bp.address?.line2 || "",
              city: bp.address?.city || "",
              state: bp.address?.state || "",
              zip: bp.address?.zip || "",
            },
          });
        }
      } catch {
        // keep empty defaults
      } finally {
        setBusinessLoading(false);
      }
    }
    fetchBusiness();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBusinessSave = async (formData: BusinessFormData) => {
    if (!user?.id) return;
    setSavingBusiness(true);
    try {
      await api.post(`/users/${user.id}/business-profile`, formData);
      toast.success("Business profile saved");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
      toast.error(
        axiosErr.response?.data?.error?.message ||
          "Failed to save business profile",
      );
    } finally {
      setSavingBusiness(false);
    }
  };

  // ── Danger Zone / Delete ──────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteForm = useForm<DeleteFormData>({
    resolver: zodResolver(deleteSchema),
    defaultValues: { password: "" },
  });

  const handleDeleteAccount = async (formData: DeleteFormData) => {
    if (!user?.id) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${user.id}`, {
        data: { password: formData.password },
      });
      toast.success("Account deleted");
      // Force logout
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      router.push("/login");
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
      toast.error(
        axiosErr.response?.data?.error?.message || "Failed to delete account",
      );
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-[calc(100vh-72px)] overflow-hidden animate-in fade-in duration-500">
      {/* ── Sidebar Nav ──────────────────────────────────────────────── */}
      <div className="w-[260px] border-r border-border bg-background p-5 flex-shrink-0">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted mb-6 ml-2">
          Settings
        </h2>
        <nav className="space-y-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                  isActive
                    ? "bg-accent-light text-accent shadow-sm ring-1 ring-accent/10"
                    : cn(
                        "text-muted hover:bg-card-hover hover:text-foreground",
                        tab.color,
                      ),
                )}
              >
                <tab.icon size={20} weight={isActive ? "bold" : "regular"} />
                {tab.label}
                {isActive && (
                  <ArrowRight size={14} weight="bold" className="ml-auto" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Content Area ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-card">
        <div className="max-w-[700px] p-10 mx-auto">
          {/* ── Profile Tab ─────────────────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  Profile Settings
                </h2>
                <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">
                  Manage your personal information
                </p>
              </div>

              {profileLoading ? (
                <ProfileSkeleton />
              ) : (
                <form
                  onSubmit={profileForm.handleSubmit(handleProfileSave)}
                  className="space-y-6"
                >
                  {/* Avatar */}
                  <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-input/50 border border-border">
                    <div className="h-20 w-20 flex items-center justify-center rounded-[2rem] bg-accent text-white text-2xl font-black shadow-xl shadow-accent/20">
                      {user?.firstName?.slice(0, 1)}
                      {user?.lastName?.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-foreground">
                        Profile Photo
                      </h4>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">
                        JPG or PNG, max 5MB
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          className="btn btn-secondary h-8 px-4 text-[10px] font-black uppercase tracking-widest"
                        >
                          <PencilSimple size={14} weight="bold" /> Upload
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost h-8 px-4 text-[10px] font-black uppercase tracking-widest"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Name fields */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                        First Name
                      </label>
                      <input
                        {...profileForm.register("firstName")}
                        className="w-full rounded-2xl border border-border bg-input px-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all"
                      />
                      {profileForm.formState.errors.firstName && (
                        <p className="text-xs font-bold text-danger ml-1">
                          {profileForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                        Last Name
                      </label>
                      <input
                        {...profileForm.register("lastName")}
                        className="w-full rounded-2xl border border-border bg-input px-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all"
                      />
                      {profileForm.formState.errors.lastName && (
                        <p className="text-xs font-bold text-danger ml-1">
                          {profileForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email (readonly) */}
                  <div className="space-y-1.5">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                      Email Address
                    </label>
                    <div className="relative">
                      <EnvelopeSimple
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                        weight="bold"
                      />
                      <input
                        readOnly
                        value={user?.email || ""}
                        className="w-full rounded-2xl border border-border bg-muted/10 pl-12 pr-5 py-3.5 text-sm font-bold text-muted outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                        weight="bold"
                      />
                      <input
                        {...profileForm.register("phone")}
                        className="w-full rounded-2xl border border-border bg-input pl-12 pr-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  {/* Timezone */}
                  <div className="space-y-1.5">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                      Timezone
                    </label>
                    <div className="relative">
                      <Globe
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                        weight="bold"
                      />
                      <select
                        {...profileForm.register("timezone")}
                        className="w-full rounded-2xl border border-border bg-input pl-12 pr-10 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all appearance-none cursor-pointer"
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn btn-primary h-12 px-10 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent/20"
                  >
                    {savingProfile ? (
                      <Spinner
                        size={18}
                        weight="bold"
                        className="animate-spin"
                      />
                    ) : null}
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── Security Tab ─────────────────────────────────────────── */}
          {activeTab === "security" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  Security & Password
                </h2>
                <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">
                  Keep your account secure
                </p>
              </div>

              <form
                onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                    Current Password
                  </label>
                  <div className="relative">
                    <LockSimple
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                      weight="bold"
                    />
                    <input
                      type="password"
                      {...passwordForm.register("currentPassword")}
                      className="w-full rounded-2xl border border-border bg-input pl-12 pr-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all"
                      placeholder="Enter current password"
                    />
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-xs font-bold text-danger ml-1">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                      New Password
                    </label>
                    <input
                      type="password"
                      {...passwordForm.register("newPassword")}
                      className="w-full rounded-2xl border border-border bg-input px-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all"
                      placeholder="Minimum 8 characters"
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-xs font-bold text-danger ml-1">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      {...passwordForm.register("confirmPassword")}
                      className="w-full rounded-2xl border border-border bg-input px-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all"
                      placeholder="Repeat new password"
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-xs font-bold text-danger ml-1">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="btn btn-primary h-12 px-10 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent/20"
                >
                  {changingPassword ? (
                    <Spinner size={18} weight="bold" className="animate-spin" />
                  ) : null}
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>

              <hr className="border-border" />

              {/* 2FA placeholder */}
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-light text-indigo">
                      <DeviceMobile size={28} weight="bold" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-foreground">
                        Two-Factor Authentication
                      </h4>
                      <p className="text-xs font-bold text-muted uppercase tracking-widest mt-0.5">
                        Add an extra layer of security
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.info("2FA setup coming soon")}
                    className="btn btn-secondary h-10 px-5 text-[10px] font-black uppercase tracking-widest"
                  >
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Connected Accounts Tab ────────────────────────────────── */}
          {activeTab === "accounts" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  Connected Accounts
                </h2>
                <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">
                  Manage third-party integrations
                </p>
              </div>

              {/* Stripe */}
              <div
                className="rounded-2xl border p-6 shadow-sm"
                style={{
                  borderLeftWidth: "3px",
                  borderLeftColor:
                    stripeStatus === "connected"
                      ? "var(--success)"
                      : "var(--muted)",
                }}
              >
                {stripeStatus === "loading" ? (
                  <div className="flex items-center gap-4 animate-pulse">
                    <div className="h-10 w-10 rounded-lg bg-input" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-input" />
                      <div className="h-3 w-48 rounded bg-input" />
                    </div>
                  </div>
                ) : stripeStatus === "connected" ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#635BFF] text-white font-black text-sm">
                        <CreditCard size={20} weight="fill" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-foreground">
                          Stripe Connected
                        </h4>
                        <p className="text-xs font-bold text-muted mt-0.5">
                          •••• {stripeLast4}
                          {stripeBank ? ` · ${stripeBank}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          toast.info("Stripe dashboard coming soon")
                        }
                        className="btn btn-secondary h-9 px-4 text-[10px] font-black uppercase tracking-widest"
                      >
                        Manage
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.info("Disconnect coming soon")}
                        className="btn btn-secondary h-9 px-4 text-[10px] font-black uppercase tracking-widest text-danger border-danger/20 hover:bg-danger-light"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-input">
                        <CreditCard
                          size={20}
                          weight="bold"
                          className="text-muted"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-foreground">
                          Stripe Not Connected
                        </h4>
                        <p className="text-xs font-bold text-muted mt-0.5">
                          Connect to receive payments
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleStripeConnect}
                      className="btn btn-primary h-9 px-5 text-[10px] font-black uppercase tracking-widest shadow-lg"
                    >
                      <Plug size={14} weight="bold" /> Connect Stripe
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Notifications Tab ─────────────────────────────────────── */}
          {activeTab === "notifications" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  Notification Preferences
                </h2>
                <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">
                  Choose how and when to be notified
                </p>
              </div>

              {notifLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-border bg-card p-5 animate-pulse"
                    >
                      <div className="h-4 w-48 rounded bg-input mb-2" />
                      <div className="h-3 w-72 rounded bg-input" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {NOTIFICATION_EVENTS.map((event) => {
                    const channels = notifPrefs[event.key] || {};
                    return (
                      <div
                        key={event.key}
                        className="rounded-2xl border border-border bg-card p-5 hover:bg-input/20 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-sm font-black text-foreground uppercase tracking-wide">
                              {event.title}
                            </h4>
                            <p className="text-xs font-bold text-muted mt-1">
                              {event.desc}
                            </p>
                          </div>
                          <div className="flex items-center gap-6 flex-shrink-0">
                            <label className="flex flex-col items-center gap-1 cursor-pointer">
                              <ToggleSwitch
                                checked={!!channels.email}
                                onChange={() =>
                                  toggleNotifChannel(event.key, "email")
                                }
                              />
                              <span className="text-[9px] font-black uppercase tracking-widest text-muted">
                                Email
                              </span>
                            </label>
                            <label className="flex flex-col items-center gap-1 cursor-pointer">
                              <ToggleSwitch
                                checked={!!channels.push}
                                onChange={() =>
                                  toggleNotifChannel(event.key, "push")
                                }
                              />
                              <span className="text-[9px] font-black uppercase tracking-widest text-muted">
                                Push
                              </span>
                            </label>
                            <label className="flex flex-col items-center gap-1 cursor-pointer">
                              <ToggleSwitch
                                checked={!!channels.inapp}
                                onChange={() =>
                                  toggleNotifChannel(event.key, "inapp")
                                }
                              />
                              <span className="text-[9px] font-black uppercase tracking-widest text-muted">
                                In-App
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={handleNotifSave}
                disabled={notifSaving || notifLoading}
                className="btn btn-primary h-12 px-10 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent/20"
              >
                {notifSaving ? (
                  <Spinner size={18} weight="bold" className="animate-spin" />
                ) : null}
                {notifSaving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          )}

          {/* ── Business Profile Tab ──────────────────────────────────── */}
          {activeTab === "business" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  Business Profile
                </h2>
                <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">
                  Your company information for loads and contracts
                </p>
              </div>

              {businessLoading ? (
                <div className="space-y-5">
                  <FieldSkeleton wide />
                  <div className="grid grid-cols-2 gap-5">
                    <FieldSkeleton />
                    <FieldSkeleton />
                  </div>
                  <FieldSkeleton wide />
                  <FieldSkeleton wide />
                  <div className="grid grid-cols-3 gap-5">
                    <FieldSkeleton />
                    <FieldSkeleton />
                    <FieldSkeleton />
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={businessForm.handleSubmit(handleBusinessSave)}
                  className="space-y-5"
                >
                  {/* Company name */}
                  <div className="space-y-1.5">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                      Company Name
                    </label>
                    <div className="relative">
                      <Buildings
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                        weight="bold"
                      />
                      <input
                        {...businessForm.register("companyName")}
                        className="w-full rounded-2xl border border-border bg-input pl-12 pr-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all"
                        placeholder="Your company legal name"
                      />
                    </div>
                    {businessForm.formState.errors.companyName && (
                      <p className="text-xs font-bold text-danger ml-1">
                        {businessForm.formState.errors.companyName.message}
                      </p>
                    )}
                  </div>

                  {/* MC / DOT */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                        MC Number
                      </label>
                      <div className="relative">
                        <IdentificationBadge
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                          weight="bold"
                        />
                        <input
                          {...businessForm.register("mcNumber")}
                          className="w-full rounded-2xl border border-border bg-input pl-12 pr-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all"
                          placeholder="MC-123456"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                        DOT Number
                      </label>
                      <div className="relative">
                        <Truck
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                          weight="bold"
                        />
                        <input
                          {...businessForm.register("dotNumber")}
                          className="w-full rounded-2xl border border-border bg-input pl-12 pr-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all"
                          placeholder="DOT-1234567"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                      Address Line 1
                    </label>
                    <div className="relative">
                      <MapPin
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                        weight="bold"
                      />
                      <input
                        {...businessForm.register("address.line1")}
                        className="w-full rounded-2xl border border-border bg-input pl-12 pr-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all"
                        placeholder="123 Commerce St"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                      Address Line 2
                    </label>
                    <input
                      {...businessForm.register("address.line2")}
                      className="w-full rounded-2xl border border-border bg-input px-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all"
                      placeholder="Suite 200"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                        City
                      </label>
                      <input
                        {...businessForm.register("address.city")}
                        className="w-full rounded-2xl border border-border bg-input px-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all"
                        placeholder="Chicago"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                        State
                      </label>
                      <input
                        {...businessForm.register("address.state")}
                        className="w-full rounded-2xl border border-border bg-input px-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all"
                        placeholder="IL"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                        ZIP
                      </label>
                      <input
                        {...businessForm.register("address.zip")}
                        className="w-full rounded-2xl border border-border bg-input px-5 py-3.5 text-sm font-bold outline-none focus:border-accent transition-all"
                        placeholder="60601"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingBusiness}
                    className="btn btn-primary h-12 px-10 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent/20"
                  >
                    {savingBusiness ? (
                      <Spinner
                        size={18}
                        weight="bold"
                        className="animate-spin"
                      />
                    ) : null}
                    {savingBusiness ? "Saving..." : "Save Business Profile"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── Danger Zone Tab ───────────────────────────────────────── */}
          {activeTab === "danger" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="rounded-2xl border-2 border-danger/20 bg-danger-light p-8 shadow-lg">
                <h2 className="text-2xl font-black tracking-tight text-danger flex items-center gap-3 mb-3">
                  <WarningCircle size={28} weight="fill" />
                  Danger Zone
                </h2>
                <p className="text-sm font-bold text-danger/80 leading-relaxed mb-8 max-w-lg">
                  Once you delete your account, there is no going back. All your
                  data, loads, documents, and reviews will be permanently
                  removed from our servers.
                </p>

                <div className="p-6 rounded-2xl bg-card border border-danger/30 space-y-4">
                  <div>
                    <h4 className="text-base font-black text-foreground">
                      Delete Account
                    </h4>
                    <p className="text-xs font-bold text-muted uppercase tracking-widest mt-0.5">
                      This action cannot be undone
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      deleteForm.reset();
                      setShowDeleteModal(true);
                    }}
                    className="btn btn-primary h-11 px-8 text-[11px] font-black uppercase tracking-widest bg-danger border-none hover:bg-danger/90 shadow-xl shadow-danger/20"
                  >
                    <TrashIcon /> Permanently Delete My Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Account Modal ──────────────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-[2rem] border border-border shadow-2xl p-8 animate-in zoom-in-95">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-2xl bg-danger-light">
                <WarningCircle
                  size={24}
                  weight="fill"
                  className="text-danger"
                />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">
                  Delete your account?
                </h2>
                <p className="text-sm font-bold text-muted mt-1">
                  This action cannot be undone. Please enter your password to
                  confirm.
                </p>
              </div>
            </div>

            <form
              onSubmit={deleteForm.handleSubmit(handleDeleteAccount)}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                  Your Password
                </label>
                <div className="relative">
                  <LockSimple
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    weight="bold"
                  />
                  <input
                    type="password"
                    {...deleteForm.register("password")}
                    className="w-full rounded-2xl border border-border bg-input pl-12 pr-5 py-3.5 text-sm font-bold outline-none focus:border-danger transition-all"
                    placeholder="Enter your password"
                  />
                </div>
                {deleteForm.formState.errors.password && (
                  <p className="text-xs font-bold text-danger ml-1">
                    {deleteForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 btn btn-secondary h-11 text-[11px] font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="flex-1 btn btn-primary h-11 text-[11px] font-black uppercase tracking-widest bg-danger border-none hover:bg-danger/90 shadow-xl shadow-danger/20"
                >
                  {deleting ? (
                    <Spinner size={18} weight="bold" className="animate-spin" />
                  ) : (
                    <WarningCircle size={18} weight="bold" />
                  )}
                  {deleting ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/** Small inline trash icon used in danger zone button — avoids import issues */
function TrashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 256 256"
      fill="currentColor"
      className="inline-block"
    >
      <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
    </svg>
  );
}
