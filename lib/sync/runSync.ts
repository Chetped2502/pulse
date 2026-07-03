import { db } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/crypto";
import { refreshAccessToken } from "@/lib/tiktok/auth";
import { fetchAllVideos, fetchUserInfo } from "@/lib/tiktok/client";
import { parseHashtags } from "@/lib/hashtags";

const TOKEN_REFRESH_MARGIN_MS = 30 * 60 * 1000;

export async function runSync(): Promise<{ videosSynced: number }> {
  const log = await db.syncLog.create({ data: { status: "running" } });

  try {
    const account = await db.account.findUnique({ where: { id: 1 } });
    if (!account) {
      throw new Error("No TikTok account connected yet");
    }

    const accessToken = await ensureFreshAccessToken(account);
    const capturedAt = startOfToday();

    const userInfo = await fetchUserInfo(accessToken);
    await db.accountSnapshot.upsert({
      where: { accountId_capturedAt: { accountId: account.id, capturedAt } },
      create: {
        accountId: account.id,
        capturedAt,
        followerCount: userInfo.follower_count ?? null,
        followingCount: userInfo.following_count ?? null,
        totalLikeCount: userInfo.likes_count ?? null,
        videoCount: userInfo.video_count ?? null,
      },
      update: {
        followerCount: userInfo.follower_count ?? null,
        followingCount: userInfo.following_count ?? null,
        totalLikeCount: userInfo.likes_count ?? null,
        videoCount: userInfo.video_count ?? null,
      },
    });

    const videos = await fetchAllVideos(accessToken);

    for (const video of videos) {
      await db.video.upsert({
        where: { id: video.id },
        create: {
          id: video.id,
          accountId: account.id,
          description: video.video_description ?? "",
          hashtags: JSON.stringify(parseHashtags(video.video_description ?? "")),
          durationSeconds: video.duration,
          coverImageUrl: video.cover_image_url,
          shareUrl: video.share_url,
          embedLink: video.embed_link,
          postedAt: new Date(video.create_time * 1000),
          lastSyncedAt: new Date(),
        },
        update: {
          description: video.video_description ?? "",
          hashtags: JSON.stringify(parseHashtags(video.video_description ?? "")),
          coverImageUrl: video.cover_image_url,
          shareUrl: video.share_url,
          embedLink: video.embed_link,
          lastSyncedAt: new Date(),
        },
      });

      await db.videoSnapshot.upsert({
        where: { videoId_capturedAt: { videoId: video.id, capturedAt } },
        create: {
          videoId: video.id,
          capturedAt,
          viewCount: video.view_count,
          likeCount: video.like_count,
          commentCount: video.comment_count,
          shareCount: video.share_count,
        },
        update: {
          viewCount: video.view_count,
          likeCount: video.like_count,
          commentCount: video.comment_count,
          shareCount: video.share_count,
        },
      });
    }

    await db.account.update({
      where: { id: account.id },
      data: { lastSyncedAt: new Date() },
    });

    await db.syncLog.update({
      where: { id: log.id },
      data: { status: "success", videosSynced: videos.length, finishedAt: new Date() },
    });

    return { videosSynced: videos.length };
  } catch (error) {
    await db.syncLog.update({
      where: { id: log.id },
      data: {
        status: "error",
        errorMessage: error instanceof Error ? error.message : String(error),
        finishedAt: new Date(),
      },
    });
    throw error;
  }
}

async function ensureFreshAccessToken(account: {
  id: number;
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string;
  accessTokenExpiresAt: Date;
}): Promise<string> {
  const isExpiringSoon =
    account.accessTokenExpiresAt.getTime() - Date.now() < TOKEN_REFRESH_MARGIN_MS;

  if (!isExpiringSoon) {
    return decrypt(account.accessTokenEncrypted);
  }

  const refreshToken = decrypt(account.refreshTokenEncrypted);
  const refreshed = await refreshAccessToken(refreshToken);

  await db.account.update({
    where: { id: account.id },
    data: {
      accessTokenEncrypted: encrypt(refreshed.access_token),
      refreshTokenEncrypted: encrypt(refreshed.refresh_token),
      accessTokenExpiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
      refreshTokenExpiresAt: new Date(Date.now() + refreshed.refresh_expires_in * 1000),
    },
  });

  return refreshed.access_token;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
