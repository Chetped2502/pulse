import { buttonVariants } from "@/components/ui/button";

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-primary">Pulse</h1>
        <p className="text-sm text-muted-foreground">
          เชื่อมต่อบัญชี TikTok ของคุณเพื่อเริ่มติดตามผลงานคลิป
        </p>
      </div>
      {error && (
        <p className="text-sm text-negative">
          เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
        </p>
      )}
      <a href="/api/auth/tiktok" className={buttonVariants({ size: "lg" })}>
        เชื่อมต่อบัญชี TikTok
      </a>
    </div>
  );
}
