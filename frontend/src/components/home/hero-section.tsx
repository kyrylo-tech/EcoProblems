"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { SearchLg } from "@untitledui/icons";
import { Badge, BadgeWithButton } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { ADD_POINT_HREF } from "@/components/layout/site-header";
import { directionsUrl, formatAddress, plural } from "@/lib/format";
import type { PointSummary, Stats, WasteKind, WasteKindOption } from "@/lib/types";
import { UkraineMap } from "./ukraine-map";

const FALLBACK_COLOR = "#1f7a4d";

interface HeroSectionProps {
    stats: Stats | null;
    points: PointSummary[];
    wasteKinds: WasteKindOption[];
    activeWaste: WasteKindOption | null;
    onClearWaste: () => void;
    searchError: string | null;
    isSearching: boolean;
    onSearch: (query: string) => void;
    activePoint: PointSummary | null;
    onSelectPoint: (point: PointSummary) => void;
}

export const HeroSection = ({
    stats,
    points,
    wasteKinds,
    activeWaste,
    onClearWaste,
    searchError,
    isSearching,
    onSearch,
    activePoint,
    onSelectPoint,
}: HeroSectionProps) => {
    const [query, setQuery] = useState("");

    const byKind = new Map(wasteKinds.map((kind) => [kind.value, kind]));

    // Colour a dot by the rarest kind the point accepts, so specialised points stand out on the map
    const frequency = new Map<WasteKind, number>();
    points.forEach((point) => point.accepted_waste.forEach((kind) => frequency.set(kind, (frequency.get(kind) ?? 0) + 1)));
    const colorOf = (point: PointSummary) => {
        if (activeWaste && point.accepted_waste.includes(activeWaste.value)) return activeWaste.color;
        const signature = [...point.accepted_waste].sort((a, b) => (frequency.get(a) ?? 0) - (frequency.get(b) ?? 0))[0];
        return byKind.get(signature)?.color ?? FALLBACK_COLOR;
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        onSearch(query.trim());
    };

    const statItems = [
        { value: stats?.collection_points, forms: ["пункт прийому", "пункти прийому", "пунктів прийому"] },
        { value: stats?.cities, forms: ["місто на карті", "міста на карті", "міст на карті"] },
        { value: stats?.waste_kinds, forms: ["вид вторсировини", "види вторсировини", "видів вторсировини"] },
    ] as const;

    return (
        <section id="map" className="mx-auto grid w-full max-w-container scroll-mt-6 items-center gap-12 px-4 pt-8 pb-16 md:px-8 md:pt-12 md:pb-24 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col items-start">
                <Badge type="pill-color" size="md" color="gray" className="bg-accent-solid text-on-accent ring-transparent">
                    Карта пунктів прийому вторсировини
                </Badge>

                <h1 className="mt-4 text-display-md font-bold tracking-tight text-primary md:text-display-lg lg:text-display-xl">
                    Знайдіть, куди віднести сміття на переробку
                </h1>
                <p className="mt-4 max-w-lg text-lg text-tertiary md:text-xl">
                    Пункти прийому пластику, скла, паперу, металу та батарейок на одній карті: з адресами, графіком і типами вторсировини.
                </p>

                <form onSubmit={handleSubmit} role="search" className="mt-8 flex w-full max-w-lg items-start gap-3">
                    <Input
                        size="lg"
                        icon={SearchLg}
                        aria-label="Адреса або місто"
                        placeholder="Адреса або місто"
                        value={query}
                        onChange={(value) => {
                            setQuery(value);
                            if (!value.trim()) onSearch("");
                        }}
                        className="flex-1"
                        wrapperClassName="rounded-full"
                    />
                    <Button type="submit" size="xl" isLoading={isSearching} className="rounded-full before:rounded-full">
                        Знайти
                    </Button>
                </form>
                <p aria-live="polite" className="mt-2 min-h-5 text-sm text-tertiary">
                    {searchError}
                </p>

                <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                    {statItems.map((item) => (
                        <div key={item.forms[2]} className="flex flex-col-reverse gap-1">
                            <dt className="text-sm text-tertiary">{plural(item.value ?? 0, item.forms)}</dt>
                            <dd className="text-display-xs font-bold text-primary">{item.value ?? "—"}</dd>
                        </div>
                    ))}
                </dl>
            </div>

            <div className="relative flex flex-col gap-4 rounded-3xl bg-map-surface p-4 ring-1 ring-secondary ring-inset md:p-6">
                {activeWaste && (
                    <div className="absolute top-4 left-4 md:top-6 md:left-6">
                        <BadgeWithButton type="pill-color" color="brand" size="md" buttonLabel="Скинути фільтр" onButtonClick={onClearWaste}>
                            Приймають: {activeWaste.label}
                        </BadgeWithButton>
                    </div>
                )}

                <UkraineMap points={points} colorOf={colorOf} activeId={activePoint?.id ?? null} onSelect={onSelectPoint} className="mt-6" />

                <div className="flex items-center justify-between gap-4 rounded-2xl bg-primary p-4 shadow-xs">
                    {activePoint ? (
                        <>
                            <div className="min-w-0">
                                <p className="truncate text-md font-semibold text-primary">{activePoint.title}</p>
                                <p className="mt-0.5 text-sm text-tertiary">
                                    {formatAddress(activePoint.street, activePoint.city)}
                                    {activePoint.accepted_waste.length > 0 && (
                                        <> · {activePoint.accepted_waste.map((kind) => byKind.get(kind)?.label ?? kind).join(", ")}</>
                                    )}
                                </p>
                            </div>
                            <Button
                                color="primary-dark"
                                size="md"
                                href={directionsUrl(activePoint.latitude, activePoint.longitude)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 rounded-full before:rounded-full"
                            >
                                Маршрут
                            </Button>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-tertiary">
                                {activeWaste ? `Поки немає пунктів, які приймають: ${activeWaste.label.toLowerCase()}.` : "Поки немає пунктів на карті."}
                            </p>
                            <Button color="primary-dark" size="md" href={ADD_POINT_HREF} className="shrink-0 rounded-full before:rounded-full">
                                Додати пункт
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};
