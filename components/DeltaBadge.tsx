import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function DeltaBadge({ percent }: { percent: number | null }) {
  if (percent === null) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <Minus className="size-3.5" />
        ไม่มีข้อมูลเทียบ
      </span>
    );
  }

  const isUp = percent > 0;
  const isFlat = Math.abs(percent) < 0.05;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium",
        isFlat
          ? "text-muted-foreground"
          : isUp
            ? "text-positive"
            : "text-negative"
      )}
    >
      {isFlat ? (
        <Minus className="size-3.5" />
      ) : isUp ? (
        <ArrowUp className="size-3.5" />
      ) : (
        <ArrowDown className="size-3.5" />
      )}
      {Math.abs(percent).toFixed(1)}%
    </span>
  );
}
