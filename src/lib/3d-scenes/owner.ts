import { randomUUID } from "node:crypto";

const COOKIE_NAME = "berrybox_scene_owner";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cookiesFromRequest(request: Request) {
  return Object.fromEntries((request.headers.get("cookie") || "").split(";").map((part) => {
    const index = part.indexOf("=");
    if (index < 0) return [part.trim(), ""];
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))];
  }));
}

export function sceneOwner(request: Request) {
  const existing = cookiesFromRequest(request)[COOKIE_NAME];
  if (existing && UUID.test(existing)) return { ownerId: existing };
  const ownerId = randomUUID();
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return {
    ownerId,
    setCookie: `${COOKIE_NAME}=${ownerId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure}`,
  };
}

export function withOwnerCookie(headers: HeadersInit | undefined, setCookie?: string) {
  const result = new Headers(headers);
  if (setCookie) result.append("Set-Cookie", setCookie);
  return result;
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
