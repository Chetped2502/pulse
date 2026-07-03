import Image from "next/image";
import { notFound } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { StatTile } from "@/components/StatTile";
import { TrendChart } from "@/components/TrendChart";
import { BookmarkButton } from "@/components/BookmarkButton";
import { getVideoDetail } from "@/lib/queries";

export default async function ClipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await getVideoDetail(id);
  if (!video) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <NavBar />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6">
        <div className="flex gap-4">
          <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
            {video.coverImageUrl && (
              <Image
                src={video.coverImageUrl}
                alt=""
                fill
                sizes="112px"
                className="object-cover"
                unoptimized
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm">{video.description || "—"}</p>
            {video.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {video.hashtags.map((tag) => (
                  <span key={tag} className="text-xs text-primary">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              ลงเมื่อ {video.postedAt.toLocaleDateString("th-TH")} · {video.durationSeconds} วินาที
            </p>
            <BookmarkButton videoId={video.id} initialBookmarked={Boolean(video.bookmarkedAt)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="วิว" value={video.viewCount} deltaPercent={video.viewDelta} />
          <StatTile label="ไลก์" value={video.likeCount} deltaPercent={video.likeDelta} />
          <StatTile label="คอมเมนต์" value={video.commentCount} deltaPercent={null} />
          <StatTile label="แชร์" value={video.shareCount} deltaPercent={null} />
        </div>

        <div className="rounded-xl border border-border p-4">
          <TrendChart label="ยอดวิวของคลิปนี้" data={video.trend} />
        </div>
      </main>
    </div>
  );
}
