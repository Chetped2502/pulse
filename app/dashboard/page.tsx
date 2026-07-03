import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { StatTile } from "@/components/StatTile";
import { TrendChart } from "@/components/TrendChart";
import { VideoCard } from "@/components/VideoCard";
import {
  getAccount,
  getAccountDeltas,
  getAccountViewTrend,
  getVideosWithSparklines,
} from "@/lib/queries";

export default async function DashboardPage() {
  const account = await getAccount();
  if (!account) redirect("/connect");

  const [deltas, viewTrend, videos] = await Promise.all([
    getAccountDeltas(account.id),
    getAccountViewTrend(account.id, 30),
    getVideosWithSparklines(account.id, 14),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <NavBar />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6">
        <div className="grid grid-cols-3 gap-3">
          <StatTile
            label="ผู้ติดตาม"
            value={deltas.followerCount}
            deltaPercent={deltas.followerDelta}
          />
          <StatTile
            label="ยอดไลก์รวม"
            value={deltas.totalLikeCount}
            deltaPercent={deltas.likeDelta}
          />
          <StatTile
            label="จำนวนคลิป"
            value={deltas.videoCount}
            deltaPercent={deltas.videoDelta}
          />
        </div>

        <div className="rounded-xl border border-border p-4">
          <TrendChart label="ยอดวิวรวมย้อนหลัง" data={viewTrend} />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">คลิปล่าสุด</h2>
          {videos.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีคลิป ลองซิงค์ข้อมูลที่หน้าตั้งค่า</p>
          ) : (
            <div className="flex flex-col gap-2">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
