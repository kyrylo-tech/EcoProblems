import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, isTokenExpired } from "@/lib/session";

/**
 * Browser calls to /api/* are rewritten to FastAPI (next.config.mjs). The JWT lives in an httpOnly cookie
 * that client JS can't read, so here it becomes the `Authorization: Bearer` header FastAPI expects.
 */
export function proxy(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    // An expired token is not forwarded: FastAPI answers 401 to any request with a bad token, even public ones.
    // (The cookie can't be deleted here — responses of external rewrites don't carry Proxy's Set-Cookie.)
    if (!token || isTokenExpired(token) || request.headers.has("authorization")) return NextResponse.next();

    const headers = new Headers(request.headers);
    headers.set("authorization", `Bearer ${token}`);
    return NextResponse.next({ request: { headers } });
}

export const config = {
    matcher: "/api/:path*",
};
