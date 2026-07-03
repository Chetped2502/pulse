import { createHash, randomBytes } from "crypto";
import type { TikTokTokenResponse } from "@/lib/tiktok/types";

const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
export const AUTHORIZE_URL = "https://www.tiktok.com/v2/auth/authorize/";

export const REQUIRED_SCOPES = [
  "user.info.basic",
  "user.info.profile",
  "user.info.stats",
  "video.list",
].join(",");

function base64url(input: Buffer): string {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generatePkcePair(): { verifier: string; challenge: string } {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

export function buildAuthorizeUrl(
  redirectUri: string,
  state: string,
  codeChallenge: string
): string {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) {
    throw new Error("TIKTOK_CLIENT_KEY is not set in the environment");
  }
  const params = new URLSearchParams({
    client_key: clientKey,
    scope: REQUIRED_SCOPES,
    response_type: "code",
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
  codeVerifier: string
): Promise<TikTokTokenResponse> {
  return requestToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<TikTokTokenResponse> {
  return requestToken({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

async function requestToken(
  extraParams: Record<string, string>
): Promise<TikTokTokenResponse> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  if (!clientKey || !clientSecret) {
    throw new Error("TikTok client credentials are not set in the environment");
  }

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    ...extraParams,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`TikTok token request failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}
