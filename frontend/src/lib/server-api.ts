export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

/**
 * Server Components call FastAPI directly (no proxy hop).
 * Returns null when the backend is unreachable so pages can render a graceful fallback.
 */
export async function fetchBackend<T>(path: string, init?: RequestInit): Promise<T | null> {
    try {
        const res = await fetch(`${BACKEND_URL}/api${path}`, { cache: "no-store", ...init });
        if (!res.ok) return null;
        return (await res.json()) as T;
    } catch {
        return null;
    }
}
