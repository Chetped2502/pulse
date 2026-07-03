"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

export function Sparkline({ data }: { data: { value: number }[] }) {
  if (data.length < 2) {
    return <div className="h-10 w-full" />;
  }

  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
