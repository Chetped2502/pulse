import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { buildAuthorizeUrl, generatePkcePair } from "@/lib/tiktok/auth";

export async function GET(request: NextRequest) {
  const state = randomBytes(16).toString("hex");
  const { verifier, challenge } = generatePkcePair();
  const redirectUri = new URL("/api/auth/tiktok/callback", request.url).toString();
  const authorizeUrl = buildAuthorizeUrl(redirectUri, state, challenge);

  const response = NextResponse.redirect(authorizeUrl);
  const cookieOptions = {
    httpOnly: true,
    maxAge: 600,
    sameSite: "lax" as const,
    path: "/",
  };
  response.cookies.set("tiktok_oauth_state", state, cookieOptions);
  response.cookies.set("tiktok_pkce_verifier", verifier, cookieOptions);
  return response;
}
