"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SyncNowButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setIsSyncing(true);
    setError(null);
    try {
      const response = await fetch("/api/sync", { method: "POST" });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "ซิงค์ไม่สำเร็จ");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ซิงค์ไม่สำเร็จ");
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleClick} disabled={isSyncing}>
        {isSyncing ? "กำลังซิงค์..." : "ซิงค์ตอนนี้"}
      </Button>
      {error && <p className="text-sm text-negative">{error}</p>}
    </div>
  );
}
