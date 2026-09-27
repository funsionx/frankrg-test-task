"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";
import { connectLive } from "../api/live-connection";

export function LiveUpdates() {
  const router = useRouter();

  useEffect(() => connectLive({ onPostChange: () => startTransition(() => router.refresh()) }), [router]);

  return null;
}
