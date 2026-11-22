import { connection } from "next/server";
import { HomeScreen } from "@/components/home/home-screen";
import { fetchBackend } from "@/lib/server-api";
import type { Catalog, Page, PointSummary, Stats } from "@/lib/types";

export default async function HomePage() {
    await connection(); // render per request: data comes from the live backend, not from build time

    const [stats, catalog, points] = await Promise.all([
        fetchBackend<Stats>("/stats"),
        fetchBackend<Catalog>("/catalog"),
        fetchBackend<Page<PointSummary>>("/points?type=collection&limit=500"),
    ]);

    return <HomeScreen stats={stats} catalog={catalog} points={points?.items ?? []} />;
}
