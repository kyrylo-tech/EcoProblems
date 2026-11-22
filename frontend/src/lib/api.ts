export class ApiError extends Error {
    constructor(
        public status: number,
        public body: unknown,
    ) {
        super(`API error ${status}`);
    }
}

/**
 * Calls the FastAPI backend through the Next.js /api proxy (see next.config.mjs).
 * Signed-in requests are authorized automatically: src/proxy.ts adds the Bearer token from the session cookie.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`/api${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...init?.headers },
    });

    const body = res.headers.get("content-type")?.includes("application/json") ? await res.json() : await res.text();
    if (!res.ok) throw new ApiError(res.status, body);
    return body as T;
}
