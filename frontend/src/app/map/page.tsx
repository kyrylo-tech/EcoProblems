import type { Metadata } from "next";
import { MapScreen } from "@/components/map/map-screen";

type MapPageSearchParams = {
    type?: string | string[];
    q?: string | string[];
};

export const metadata: Metadata = {
    title: "Карта точок",
    description: "Інтерактивна карта пунктів прийому вторсировини та екологічних проблем України.",
};

export default async function MapPage({ searchParams }: { searchParams: Promise<MapPageSearchParams> }) {
    const params = await searchParams;
    const typeParam = Array.isArray(params.type) ? params.type[0] : params.type;
    const queryParam = Array.isArray(params.q) ? params.q[0] : params.q;
    const initialFilter = typeParam === "collection" || typeParam === "eco_problem" ? typeParam : "all";
    const initialQuery = queryParam ?? "";

    return <MapScreen key={`${initialFilter}:${initialQuery}`} initialFilter={initialFilter} initialQuery={initialQuery} />;
}
