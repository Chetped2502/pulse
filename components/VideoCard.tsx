import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkline } from "@/components/Sparkline";
import { formatCount } from "@/lib/stats";

export interface VideoCardData {
  id: string;
  coverImageUrl: string;
  description: string;
  postedAt: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  sparkline: { value: number }[];
}

export function VideoCard({ video }: { video: VideoCardData }) {
  return (
    <Link href={`/clips/${video.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex gap-3">
          <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
            {video.coverImageUrl && (
              <Image
                src={video.coverImageUrl}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
                unoptimized
              />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="line-clamp-2 text-sm">{video.description || "—"}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground tabular-nums">
              <span>{formatCount(video.viewCount)} วิว</span>
              <span>{formatCount(video.likeCount)} ไลก์</span>
              <span>{formatCount(video.commentCount)} คอมเมนต์</span>
              <span>{formatCount(video.shareCount)} แชร์</span>
            </div>
            <Sparkline data={video.sparkline} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
