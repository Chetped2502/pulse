import { NextResponse } from "next/server";
import { runSync } from "@/lib/sync/runSync";

export async function POST() {
  try {
    const result = await runSync();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
