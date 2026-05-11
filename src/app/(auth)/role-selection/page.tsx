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
      <h1 className="text-center text-[1.8rem] font-extrabold text-accent">
        FLOW
      </h1>
      <h2 className="mt-1 text-center text-[1.4rem] font-bold text-foreground">
        Who are you?
      </h2>
      <p className="mb-7 text-center text-sm text-muted">
        Your role determines your dashboard and features.
      </p>

      <div className="flex flex-col gap-3">
        {roles.map(({ id, title, description, Icon }) => (
          <div
            key={id}
            onClick={() => setSelectedRole(id)}
            className={cn(
              "flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all hover:border-muted",
              selectedRole === id
                ? "border-accent bg-accent-light"
                : "border-border bg-input",
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-light text-accent">
              <Icon size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">{title}</h4>
              <p className="text-xs text-muted font-medium">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedRole}
        className="btn btn-primary btn-lg mt-8 w-full"
      >
        Continue
      </button>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-accent hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
