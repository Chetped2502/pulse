import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { exchangeCodeForToken } from "@/lib/tiktok/auth";
import { fetchUserInfo } from "@/lib/tiktok/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = request.cookies.get("tiktok_oauth_state")?.value;
  const codeVerifier = request.cookies.get("tiktok_pkce_verifier")?.value;

  if (!code || !state || !expectedState || state !== expectedState || !codeVerifier) {
    return NextResponse.redirect(new URL("/connect?error=invalid_state", request.url));
  }

  const redirectUri = new URL("/api/auth/tiktok/callback", request.url).toString();

  try {
    const token = await exchangeCodeForToken(code, redirectUri, codeVerifier);
    const userInfo = await fetchUserInfo(token.access_token);

    await db.account.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        tiktokOpenId: userInfo.open_id,
        displayName: userInfo.display_name,
        avatarUrl: userInfo.avatar_url,
        accessTokenEncrypted: encrypt(token.access_token),
        refreshTokenEncrypted: encrypt(token.refresh_token),
        accessTokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
        refreshTokenExpiresAt: new Date(Date.now() + token.refresh_expires_in * 1000),
      },
      update: {
        tiktokOpenId: userInfo.open_id,
        displayName: userInfo.display_name,
        avatarUrl: userInfo.avatar_url,
        accessTokenEncrypted: encrypt(token.access_token),
        refreshTokenEncrypted: encrypt(token.refresh_token),
        accessTokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
        refreshTokenExpiresAt: new Date(Date.now() + token.refresh_expires_in * 1000),
      },
    });

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.delete("tiktok_oauth_state");
    response.cookies.delete("tiktok_pkce_verifier");
    return response;
  } catch (error) {
    console.error("TikTok OAuth callback failed", error);
    return NextResponse.redirect(new URL("/connect?error=token_exchange_failed", request.url));
  }
}
