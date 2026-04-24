import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminToken, verifyAdminCookie, ADMIN_COOKIE, COOKIE_MAX_AGE } from "@/lib/adminAuth";

// ─── In-memory rate limiter ───────────────────────────────────────────────────
// Max 5 attempts per IP per 15-minute window.
// Note: resets per serverless instance — sufficient to slow brute-force attacks.
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, { count: number; resetAt: number }>();

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSecs: number } {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSecs: 0 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfterSecs = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSecs };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSecs: 0 };
}

function resetRateLimit(ip: string) {
  attempts.delete(ip);
}

// ─── POST /api/admin/login ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = getIp(req);

  const { allowed, retryAfterSecs } = checkRateLimit(ip);
  if (!allowed) {
    console.error(`[admin] rate limit hit — ip=${ip}`);
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSecs) },
      },
    );
  }

  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!password) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }

  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  // Constant-time comparison — prevent timing attacks
  const given = Buffer.from(body.password, "utf8");
  const expected = Buffer.from(password, "utf8");
  const maxLen = Math.max(given.length, expected.length);
  const givenPadded = Buffer.concat([given, Buffer.alloc(maxLen - given.length)]);
  const expectedPadded = Buffer.concat([expected, Buffer.alloc(maxLen - expected.length)]);
  const match =
    given.length === expected.length &&
    crypto.timingSafeEqual(givenPadded, expectedPadded);

  if (!match) {
    console.error(`[admin] failed login — ip=${ip} time=${new Date().toISOString()}`);
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  resetRateLimit(ip);
  console.log(`[admin] successful login — ip=${ip} time=${new Date().toISOString()}`);

  const token = getAdminToken(password);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}

// ─── DELETE /api/admin/login ──────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const cookieVal = req.cookies.get(ADMIN_COOKIE)?.value ?? "";
  if (!verifyAdminCookie(cookieVal, password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}

