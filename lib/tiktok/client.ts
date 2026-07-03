import type { TikTokUserInfo, TikTokVideo, TikTokVideoListResponse } from "@/lib/tiktok/types";

const USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";
const VIDEO_LIST_URL = "https://open.tiktokapis.com/v2/video/list/";

const USER_INFO_FIELDS = [
  "open_id",
  "display_name",
  "avatar_url",
  "follower_count",
  "following_count",
  "likes_count",
  "video_count",
].join(",");

const VIDEO_FIELDS = [
  "id",
  "title",
  "video_description",
  "duration",
  "cover_image_url",
  "embed_link",
  "share_url",
  "create_time",
  "view_count",
  "like_count",
  "comment_count",
  "share_count",
].join(",");

export async function fetchUserInfo(accessToken: string): Promise<TikTokUserInfo> {
  const url = `${USER_INFO_URL}?fields=${USER_INFO_FIELDS}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`TikTok user info request failed: ${response.status} ${await response.text()}`);
  }
  const json = await response.json();
  return json.data.user as TikTokUserInfo;
}

export async function fetchAllVideos(accessToken: string): Promise<TikTokVideo[]> {
  const videos: TikTokVideo[] = [];
  let cursor = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${VIDEO_LIST_URL}?fields=${VIDEO_FIELDS}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ max_count: 20, cursor }),
    });

    if (!response.ok) {
      throw new Error(`TikTok video list request failed: ${response.status} ${await response.text()}`);
    }

    const json: TikTokVideoListResponse = await response.json();
    videos.push(...json.data.videos);
    hasMore = json.data.has_more;
    cursor = json.data.cursor;
  }

  return videos;
}
