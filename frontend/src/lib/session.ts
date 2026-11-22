/**
 * Session helpers shared by Server Actions, Server Components and `src/proxy.ts`.
 * Keep this file free of `next/headers` so it also works inside the proxy.
 *
 * The FastAPI JWT is stored in an httpOnly cookie: client JS never sees it,
 * the proxy turns it into `Authorization: Bearer` for /api/* calls.
 */

export const SESSION_COOKIE = "eg_session";

/** Reads `exp` from the JWT payload. The signature is not checked here — FastAPI does that. */
export function tokenExpiresAt(token: string): Date | null {
    const payload = token.split(".")[1];
    if (!payload) return null;
    try {
        const { exp } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: unknown };
        return typeof exp === "number" ? new Date(exp * 1000) : null;
    } catch {
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    const expiresAt = tokenExpiresAt(token);
    return expiresAt === null || expiresAt.getTime() <= Date.now();
}

const AUTH_PAGES = ["/login", "/register"];

/** Only same-site paths are allowed after login (no open redirects, no loops back to the auth pages). */
export function safeRedirectPath(value: unknown): string {
    if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
    const pathname = value.split(/[?#]/)[0];
    return AUTH_PAGES.includes(pathname) ? "/" : value;
}
