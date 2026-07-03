"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/stats";

type Range = 7 | 30;

export interface TrendPoint {
  date: string; // ISO date string
  value: number;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-sm">
      <div className="font-semibold tabular-nums text-popover-foreground">
        {formatCount(payload[0].value)}
      </div>
      <div className="text-xs text-muted-foreground">{formatShortDate(label ?? "")}</div>
    </div>
  );
}

export function TrendChart({ label, data }: { label: string; data: TrendPoint[] }) {
  const [range, setRange] = useState<Range>(7);

  const visibleData = useMemo(() => data.slice(-range), [data, range]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex gap-1">
          {([7, 30] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                range === r
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {r} วัน
            </button>
          ))}
        </div>
      </div>

      {visibleData.length < 2 ? (
        <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
          ยังไม่มีข้อมูลพอสำหรับแสดงกราฟ
        </div>
      ) : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visibleData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCount(v)}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                content={<TrendTooltip />}
                cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={false}
                activeDot={{ r: 4, stroke: "var(--background)", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
