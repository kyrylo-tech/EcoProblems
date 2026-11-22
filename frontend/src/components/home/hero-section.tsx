"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, MarkerPin01, Route, SearchLg } from "@untitledui/icons";
import { BadgeGroup } from "@/components/base/badges/badge-groups";
import { Badge, BadgeWithButton } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Form } from "@/components/base/form/form";
import { Input } from "@/components/base/input/input";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { ADD_POINT_HREF } from "@/components/marketing/header-navigation/header";
import { directionsUrl, formatAddress } from "@/lib/format";
import type { PointSummary, WasteKindOption } from "@/lib/types";
import { UkraineMap } from "./ukraine-map";

/** Untitled UI `hero-split-image-01`: the image half shows the live map of collection points. */

interface HeroSectionProps {
    points: PointSummary[];
    wasteKinds: WasteKindOption[];
    activeWaste: WasteKindOption | null;
    onClearWaste: () => void;
    activePoint: PointSummary | null;
    onSelectPoint: (point: PointSummary) => void;
}

export const HeroSection = ({
    points,
    wasteKinds,
    activeWaste,
    onClearWaste,
    activePoint,
    onSelectPoint,
}: HeroSectionProps) => {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const labelOf = new Map(wasteKinds.map((kind) => [kind.value, kind.label]));

    return (
        <section id="map" className="relative scroll-mt-18 bg-primary py-16 lg:flex lg:min-h-180 lg:items-center lg:py-24">
            <div className="mx-auto flex w-full max-w-container items-center px-4 md:px-8">
                <div className="flex flex-col items-start md:max-w-3xl lg:w-1/2 lg:pr-8">
                    <a href="#problems" className="rounded-[10px] outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2">
                        <BadgeGroup className="hidden md:flex" size="lg" addonText="Нове" iconTrailing={ArrowRight} theme="modern" color="brand">
                            Повідомляйте про екопроблеми поруч
                        </BadgeGroup>
                        <BadgeGroup className="md:hidden" size="md" addonText="Нове" iconTrailing={ArrowRight} theme="modern" color="brand">
                            Повідомляйте про екопроблеми
                        </BadgeGroup>
                    </a>

                    <h1 className="mt-4 text-display-md font-semibold text-primary md:text-display-lg lg:text-display-xl">
                        Знайдіть, куди здати вторсировину
                    </h1>
                    <p className="mt-4 text-lg text-balance text-tertiary md:mt-6 md:max-w-lg md:text-xl">
                        Пункти прийому пластику, скла, паперу, металу та батарейок на одній карті — з адресами, графіком і переліком того, що
                        приймають.
                    </p>

                    <Form
                        role="search"
                        onSubmit={(event) => {
                            event.preventDefault();
                            const searchQuery = query.trim();
                            router.push(searchQuery ? `/map?q=${encodeURIComponent(searchQuery)}` : "/map");
                        }}
                        className="mt-8 flex w-full flex-col items-stretch gap-4 md:mt-12 md:max-w-120 md:flex-row md:items-start"
                    >
                        <Input
                            size="lg"
                            name="q"
                            type="search"
                            icon={SearchLg}
                            aria-label="Пошук пунктів"
                            placeholder="Місто, вулиця або назва пункту"
                            wrapperClassName="py-0.5"
                            value={query}
                            onChange={setQuery}
                            hint="Наприклад: Львів, Городоцька або «Чисте місто»."
                        />
                        <Button type="submit" size="xl">
                            Знайти
                        </Button>
                    </Form>
                </div>
            </div>

            <div className="relative mt-16 w-full px-4 md:px-8 lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:h-full lg:w-1/2 lg:px-0">
                <div className="relative flex size-full flex-col justify-center gap-6 rounded-2xl bg-secondary p-4 md:p-8 lg:rounded-none lg:p-12 xl:p-16">
                    {activeWaste && (
                        <div className="flex">
                            <BadgeWithButton type="pill-color" color="brand" size="lg" buttonLabel="Скинути фільтр" onButtonClick={onClearWaste}>
                                Приймають: {activeWaste.label.toLowerCase()}
                            </BadgeWithButton>
                        </div>
                    )}

                    <UkraineMap points={points} activeId={activePoint?.id ?? null} onSelect={onSelectPoint} />

                    <div className="flex flex-col gap-4 rounded-xl bg-primary p-4 shadow-lg ring-1 ring-secondary_alt sm:flex-row sm:items-center md:p-5">
                        {activePoint ? (
                            <>
                                <div className="flex min-w-0 flex-1 gap-3">
                                    <FeaturedIcon icon={MarkerPin01} size="md" color="brand" theme="light" />
                                    <div className="min-w-0">
                                        <p className="truncate text-md font-semibold text-primary">{activePoint.title}</p>
                                        <p className="text-sm text-tertiary">{formatAddress(activePoint.street, activePoint.city)}</p>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {activePoint.accepted_waste.map((kind) => (
                                                <Badge key={kind} type="pill-color" color={kind === activeWaste?.value ? "brand" : "gray"} size="sm">
                                                    {labelOf.get(kind) ?? kind}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    color="secondary"
                                    size="md"
                                    iconLeading={Route}
                                    href={directionsUrl(activePoint.latitude, activePoint.longitude)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0"
                                >
                                    Маршрут
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-1 items-center gap-3">
                                    <FeaturedIcon icon={MarkerPin01} size="md" color="gray" theme="modern" />
                                    <p className="text-sm text-tertiary">
                                        {activeWaste ? "Поки немає пунктів, які це приймають." : "Тут поки немає пунктів."} Знаєте такий? Додайте
                                        його на карту.
                                    </p>
                                </div>
                                <Button size="md" href={ADD_POINT_HREF} className="shrink-0">
                                    Додати пункт
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
