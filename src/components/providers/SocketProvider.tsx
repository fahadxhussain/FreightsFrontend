"use client";

import { useSocket } from "@/hooks/useSocket";
import { ReactNode } from "react";

export default function SocketProvider({ children }: { children: ReactNode }) {
  useSocket();
  return <>{children}</>;
}
