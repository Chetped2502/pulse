import { db } from "@/lib/db";
import { closestSnapshotOnOrBefore, daysAgo, percentDelta } from "@/lib/stats";

export async function getAccount() {
  return db.account.findUnique({ where: { id: 1 } });
}

export async function getAccountDeltas(accountId: number) {
  const snapshots = await db.accountSnapshot.findMany({
    where: { accountId },
    orderBy: { capturedAt: "asc" },
  });

  if (snapshots.length === 0) {
    return {
      followerCount: null,
      totalLikeCount: null,
      videoCount: null,
      followerDelta: null,
      likeDelta: null,
      videoDelta: null,
    };
  }

  const latest = snapshots[snapshots.length - 1];
  const weekAgoPoint = closestSnapshotOnOrBefore(
    snapshots.map((s) => ({ capturedAt: s.capturedAt, value: s.followerCount ?? 0 })),
    daysAgo(7)
  );
  const weekAgoSnapshot = snapshots.find(
    (s) => s.capturedAt.getTime() === weekAgoPoint?.capturedAt.getTime()
  );

  return {
    followerCount: latest.followerCount,
    totalLikeCount: latest.totalLikeCount,
    videoCount: latest.videoCount,
    followerDelta: percentDelta(latest.followerCount ?? 0, weekAgoSnapshot?.followerCount),
    likeDelta: percentDelta(latest.totalLikeCount ?? 0, weekAgoSnapshot?.totalLikeCount),
    videoDelta: percentDelta(latest.videoCount ?? 0, weekAgoSnapshot?.videoCount),
  };
}

export async function getAccountViewTrend(accountId: number, days: number) {
  const since = daysAgo(days);
  const snapshots = await db.videoSnapshot.findMany({
    where: {
      capturedAt: { gte: since },
      video: { accountId },
    },
    select: { capturedAt: true, viewCount: true },
  });

  const totalsByDay = new Map<string, number>();
  for (const snap of snapshots) {
    const key = snap.capturedAt.toISOString().slice(0, 10);
    totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + snap.viewCount);
  }

  return Array.from(totalsByDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

export async function getVideosWithSparklines(accountId: number, days: number) {
  const since = daysAgo(days);
  const videos = await db.video.findMany({
    where: { accountId },
    orderBy: { postedAt: "desc" },
    include: {
      snapshots: {
        where: { capturedAt: { gte: since } },
        orderBy: { capturedAt: "asc" },
      },
    },
  });

  return videos.map((video) => {
    const latest = video.snapshots[video.snapshots.length - 1];
    return {
      id: video.id,
      description: video.description,
      hashtags: JSON.parse(video.hashtags) as string[],
      durationSeconds: video.durationSeconds,
      coverImageUrl: video.coverImageUrl,
      shareUrl: video.shareUrl,
      postedAt: video.postedAt,
      bookmarkedAt: video.bookmarkedAt,
      viewCount: latest?.viewCount ?? 0,
      likeCount: latest?.likeCount ?? 0,
      commentCount: latest?.commentCount ?? 0,
      shareCount: latest?.shareCount ?? 0,
      sparkline: video.snapshots.map((s) => ({ value: s.viewCount })),
    };
  });
}

export async function getVideoDetail(videoId: string) {
  const video = await db.video.findUnique({
    where: { id: videoId },
    include: {
      snapshots: { orderBy: { capturedAt: "asc" } },
    },
  });
  if (!video) return null;

  const latest = video.snapshots[video.snapshots.length - 1];
  const weekAgoPoint = closestSnapshotOnOrBefore(
    video.snapshots.map((s) => ({ capturedAt: s.capturedAt, value: s.viewCount })),
    daysAgo(7)
  );
  const weekAgoSnapshot = video.snapshots.find(
    (s) => s.capturedAt.getTime() === weekAgoPoint?.capturedAt.getTime()
  );

  return {
    id: video.id,
    description: video.description,
    hashtags: JSON.parse(video.hashtags) as string[],
    durationSeconds: video.durationSeconds,
    coverImageUrl: video.coverImageUrl,
    shareUrl: video.shareUrl,
    embedLink: video.embedLink,
    postedAt: video.postedAt,
    bookmarkedAt: video.bookmarkedAt,
    viewCount: latest?.viewCount ?? 0,
    likeCount: latest?.likeCount ?? 0,
    commentCount: latest?.commentCount ?? 0,
    shareCount: latest?.shareCount ?? 0,
    viewDelta: percentDelta(latest?.viewCount ?? 0, weekAgoSnapshot?.viewCount),
    likeDelta: percentDelta(latest?.likeCount ?? 0, weekAgoSnapshot?.likeCount),
    trend: video.snapshots.map((s) => ({
      date: s.capturedAt.toISOString().slice(0, 10),
      value: s.viewCount,
    })),
  };
}

export async function getBookmarkedVideos(accountId: number) {
  const videos = await db.video.findMany({
    where: { accountId, bookmarkedAt: { not: null } },
    orderBy: { bookmarkedAt: "desc" },
    include: { snapshots: { orderBy: { capturedAt: "asc" } } },
  });

  return videos.map((video) => {
    const latest = video.snapshots[video.snapshots.length - 1];
    return {
      id: video.id,
      description: video.description,
      postedAt: video.postedAt,
      coverImageUrl: video.coverImageUrl,
      viewCount: latest?.viewCount ?? 0,
      likeCount: latest?.likeCount ?? 0,
      commentCount: latest?.commentCount ?? 0,
      shareCount: latest?.shareCount ?? 0,
      sparkline: video.snapshots.map((s) => ({ value: s.viewCount })),
    };
  });
}

export async function getRecentSyncLogs(take = 5) {
  return db.syncLog.findMany({ orderBy: { startedAt: "desc" }, take });
}
