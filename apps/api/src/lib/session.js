const isProduction = process.env.NODE_ENV === "production";
const sameSite = (process.env.COOKIE_SAME_SITE || "lax").toLowerCase();

if (!["lax", "strict", "none"].includes(sameSite)) {
  throw new Error("COOKIE_SAME_SITE debe ser lax, strict o none.");
}

if (sameSite === "none" && !isProduction) {
  throw new Error("COOKIE_SAME_SITE=none requiere NODE_ENV=production y HTTPS.");
}

export const sessionCookieName = isProduction ? "__Host-inventra_session" : "inventra_session";
export const sessionCookieOptions = { httpOnly: true, secure: isProduction, sameSite, path: "/" };
export const sessionCookieMaxAge = 8 * 60 * 60 * 1000;
