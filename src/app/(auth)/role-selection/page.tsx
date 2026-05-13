"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SteeringWheel, Truck, Briefcase } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const roles = [
  {
    id: "independent_driver",
    title: "Independent Driver",
    description: "I drive my own truck",
    Icon: SteeringWheel,
  },
  {
    id: "carrier",
    title: "Carrier / Fleet Manager",
    description: "I manage a fleet of trucks",
    Icon: Truck,
  },
  {
    id: "broker",
    title: "Broker",
    description: "I post loads and book carriers",
    Icon: Briefcase,
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      router.push(`/register?role=${selectedRole}`);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-center text-2xl font-semibold text-ink tracking-tight">
        FLOW
      </h1>
      <h2 className="mt-2 text-center text-lg font-semibold text-ink">
        Who are you?
      </h2>
      <p className="mb-7 text-center text-sm text-body-text">
        Your role determines your dashboard and features.
      </p>

      <div className="flex flex-col gap-3">
        {roles.map(({ id, title, description, Icon }) => (
          <div
            key={id}
            onClick={() => setSelectedRole(id)}
            className={cn(
              "flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-colors hover:border-hairline",
              selectedRole === id
                ? "border-primary bg-surface-soft"
                : "border-hairline bg-surface-soft",
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-card text-ink">
              <Icon size={24} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink">{title}</h4>
              <p className="text-xs text-muted">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedRole}
        className="w-full h-11 mt-8 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-active transition-colors disabled:opacity-50"
      >
        Continue
      </button>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
