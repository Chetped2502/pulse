import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { SyncNowButton } from "@/components/SyncNowButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccount, getRecentSyncLogs } from "@/lib/queries";

const statusLabel: Record<string, string> = {
  success: "สำเร็จ",
  error: "ล้มเหลว",
  running: "กำลังทำงาน",
};

export default async function SettingsPage() {
  const account = await getAccount();
  if (!account) redirect("/connect");

  const logs = await getRecentSyncLogs();

  return (
    <div className="flex flex-1 flex-col">
      <NavBar />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>บัญชีที่เชื่อมต่อ</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p>{account.displayName}</p>
            <p className="text-muted-foreground">
              ซิงค์ล่าสุด:{" "}
              {account.lastSyncedAt
                ? account.lastSyncedAt.toLocaleString("th-TH")
                : "ยังไม่เคยซิงค์"}
            </p>
          </CardContent>
        </Card>

        <SyncNowButton />

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">ประวัติการซิงค์</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีประวัติ</p>
          ) : (
            <div className="flex flex-col gap-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span>{log.startedAt.toLocaleString("th-TH")}</span>
                  <span
                    className={
                      log.status === "error" ? "text-negative" : "text-muted-foreground"
                    }
                  >
                    {statusLabel[log.status] ?? log.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
