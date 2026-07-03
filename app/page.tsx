import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function Home() {
  const account = await db.account.findUnique({ where: { id: 1 } });
  redirect(account ? "/dashboard" : "/connect");
}
