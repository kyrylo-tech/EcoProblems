"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { plural } from "@/lib/format";
import type { Catalog, Page, PointSummary, Stats, WasteKind } from "@/lib/types";
import { BusinessCtaSection } from "./business-cta-section";
import { EcoProblemsSection } from "./eco-problems-section";
import { HeroSection } from "./hero-section";
import { HowItWorksSection } from "./how-it-works-section";
import { MetricsSection } from "./metrics-section";
import { WasteKindsSection } from "./waste-kinds-section";

interface HomeScreenProps {
    stats: Stats | null;
    catalog: Catalog | null;
    points: PointSummary[];
}

export const HomeScreen = ({ stats, catalog, points }: HomeScreenProps) => {
    const wasteKinds = catalog?.waste_kinds ?? [];

    const [activeWaste, setActiveWaste] = useState<WasteKind | null>(null);
    const [searchIds, setSearchIds] = useState<Set<number> | null>(null);
    const [searchMessage, setSearchMessage] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const visiblePoints = useMemo(
        () =>
            points.filter(
                (point) => (!activeWaste || point.accepted_waste.includes(activeWaste)) && (!searchIds || searchIds.has(point.id)),
            ),
        [points, activeWaste, searchIds],
    );

    const activePoint = visiblePoints.find((point) => point.id === selectedId) ?? visiblePoints[0] ?? null;

    const search = async (query: string) => {
        setSearchMessage(null);
        if (!query) {
            setSearchIds(null);
            return;
        }
        setIsSearching(true);
        try {
            const params = new URLSearchParams({ type: "collection", q: query, limit: "500" });
            const result = await api<Page<PointSummary>>(`/points?${params}`);
            setSearchIds(new Set(result.items.map((point) => point.id)));
            setSelectedId(result.items[0]?.id ?? null);
            setSearchMessage(
                result.total === 0
                    ? `За запитом «${query}» пунктів не знайдено.`
                    : `Знайдено ${result.total} ${plural(result.total, ["пункт", "пункти", "пунктів"])}.`,
            );
        } catch {
            setSearchMessage("Не вдалося виконати пошук. Спробуйте ще раз.");
        } finally {
            setIsSearching(false);
        }
    };

    const toggleWaste = (kind: WasteKind) => {
        setActiveWaste((current) => (current === kind ? null : kind));
        document.getElementById("map")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <>
            <HeroSection
                points={visiblePoints}
                wasteKinds={wasteKinds}
                activeWaste={wasteKinds.find((kind) => kind.value === activeWaste) ?? null}
                onClearWaste={() => setActiveWaste(null)}
                searchMessage={searchMessage}
                isSearching={isSearching}
                onSearch={search}
                activePoint={activePoint}
                onSelectPoint={(point) => setSelectedId(point.id)}
            />
            <MetricsSection stats={stats} />
            <WasteKindsSection wasteKinds={wasteKinds} activeWaste={activeWaste} onToggle={toggleWaste} />
            <EcoProblemsSection problemKinds={catalog?.eco_problem_kinds ?? []} />
            <HowItWorksSection />
            <BusinessCtaSection />
        </>
    );
};
