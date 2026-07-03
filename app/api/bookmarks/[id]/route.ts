import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const video = await db.video.update({
    where: { id },
    data: { bookmarkedAt: new Date() },
  });
  return NextResponse.json(video);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const video = await db.video.update({
    where: { id },
    data: { bookmarkedAt: null },
  });
  return NextResponse.json(video);
}
