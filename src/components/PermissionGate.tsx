"use client";

import { ReactNode } from "react";
import { useAppSelector } from "@/store/hooks";

interface PermissionGateProps {
  roles?: string[];
  permissions?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * PermissionGate — conditionally renders children based on user role and/or permissions.
 *
 * Uses the spec pattern:
 * <PermissionGate roles={["broker"]}>
 *   <CreateLoadButton />
 * </PermissionGate>
 *
 * <PermissionGate roles={["carrier"]} permissions={["fleet.manage"]}>
 *   <AddVehicleButton />
 * </PermissionGate>
 */
export default function PermissionGate({
  roles,
  permissions,
  children,
  fallback = null,
}: PermissionGateProps) {
  const user = useAppSelector((s) => s.auth.user);
  const userPermissions = useAppSelector((s) => s.auth.permissions);

  if (!user) {
    return <>{fallback}</>;
  }

  // Check role
  if (roles && roles.length > 0) {
    if (!roles.includes(user.role)) {
      return <>{fallback}</>;
    }
  }

  // Check permissions
  if (permissions && permissions.length > 0) {
    const hasAllPermissions = permissions.every((p) =>
      userPermissions.includes(p),
    );
    if (!hasAllPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
