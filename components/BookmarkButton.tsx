"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BookmarkButton({
  videoId,
  initialBookmarked,
}: {
  videoId: string;
  initialBookmarked: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function toggle() {
    const next = !bookmarked;
    setBookmarked(next);
    await fetch(`/api/bookmarks/${videoId}`, { method: next ? "POST" : "DELETE" });
    startTransition(() => router.refresh());
  }

  return (
    <Button
      variant={bookmarked ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={isPending}
    >
      <Bookmark className={cn("size-4", bookmarked && "fill-current")} />
      {bookmarked ? "บันทึกไว้แล้ว" : "บันทึกคลิปนี้"}
    </Button>
  );
}
