import { NextRequest, NextResponse } from "next/server";
import { getAdminToken, verifyAdminCookie, ADMIN_COOKIE, COOKIE_MAX_AGE } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
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
    require("crypto").timingSafeEqual(givenPadded, expectedPadded);

  if (!match) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

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
