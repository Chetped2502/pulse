import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeltaBadge } from "@/components/DeltaBadge";
import { formatCount } from "@/lib/stats";

export function StatTile({
  label,
  value,
  deltaPercent,
}: {
  label: string;
  value: number | null | undefined;
  deltaPercent: number | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground font-normal">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold tabular-nums">{formatCount(value)}</span>
        <DeltaBadge percent={deltaPercent} />
      </CardContent>
    </Card>
  );
}
