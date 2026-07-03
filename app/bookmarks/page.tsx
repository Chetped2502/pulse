import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { VideoCard } from "@/components/VideoCard";
import { getAccount, getBookmarkedVideos } from "@/lib/queries";

export default async function BookmarksPage() {
  const account = await getAccount();
  if (!account) redirect("/connect");

  const videos = await getBookmarkedVideos(account.id);

  return (
    <div className="flex flex-1 flex-col">
      <NavBar />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-4 py-6">
        <h1 className="text-sm font-medium text-muted-foreground">คลิปที่บันทึกไว้</h1>
        {videos.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีคลิปที่บันทึกไว้</p>
        ) : (
          <div className="flex flex-col gap-2">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
