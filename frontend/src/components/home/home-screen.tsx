"use client";

import { useMemo, useState } from "react";
import type { Catalog, PointSummary, Stats, WasteKind } from "@/lib/types";
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
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const visiblePoints = useMemo(
        () => points.filter((point) => !activeWaste || point.accepted_waste.includes(activeWaste)),
        [points, activeWaste],
    );

    const activePoint = visiblePoints.find((point) => point.id === selectedId) ?? visiblePoints[0] ?? null;

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
