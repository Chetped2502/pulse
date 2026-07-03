export interface SnapshotPoint {
  capturedAt: Date;
  value: number;
}

export function percentDelta(current: number, previous: number | null | undefined): number | null {
  if (previous === null || previous === undefined || previous === 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

export function closestSnapshotOnOrBefore(
  points: SnapshotPoint[],
  targetDate: Date
): SnapshotPoint | null {
  const eligible = points.filter((p) => p.capturedAt.getTime() <= targetDate.getTime());
  if (eligible.length === 0) return null;
  return eligible.reduce((closest, p) =>
    p.capturedAt.getTime() > closest.capturedAt.getTime() ? p : closest
  );
}

export function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}
