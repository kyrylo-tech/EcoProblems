const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ["@untitledui/icons"],
    },
    // Proxy /api/* to FastAPI so the browser talks to one origin (no CORS in dev)
    async rewrites() {
        return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
    },
};

export default nextConfig;
