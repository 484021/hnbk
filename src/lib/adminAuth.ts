import crypto from "crypto";

export const ADMIN_COOKIE = "hnbk_admin";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function getAdminToken(password: string): string {
  return crypto
    .createHmac("sha256", password)
    .update("hnbk-admin-v1")
    .digest("hex");
}

export function verifyAdminCookie(
  cookieValue: string,
  password: string,
): boolean {
  if (!password || !cookieValue) return false;
  try {
    const expected = Buffer.from(getAdminToken(password), "hex");
    const actual = Buffer.from(cookieValue, "hex");
    if (actual.length !== expected.length) return false;
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
