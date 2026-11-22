import { cache } from "react";
import { cookies } from "next/headers";
import { fetchBackend } from "@/lib/server-api";
import { SESSION_COOKIE, isTokenExpired } from "@/lib/session";
import type { User } from "@/lib/types";

/**
 * The signed-in user for Server Components (deduplicated per request).
 * null for guests, expired or revoked sessions, and when the backend is down.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token || isTokenExpired(token)) return null;
    return fetchBackend<User>("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
});
