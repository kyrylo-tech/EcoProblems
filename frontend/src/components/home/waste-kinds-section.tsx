"use client";

import { ArrowRight, XClose } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeatureTextFeaturedIconCard } from "@/components/marketing/features/base-components/feature-text";
import type { WasteKind, WasteKindOption } from "@/lib/types";
import { cx } from "@/utils/cx";
import { wasteKindIcons } from "./icons";

/** Untitled UI `features-icon-cards-01`: one card per waste kind from /api/catalog. */

interface WasteKindsSectionProps {
    wasteKinds: WasteKindOption[];
    activeWaste: WasteKind | null;
    onToggle: (kind: WasteKind) => void;
}

export const WasteKindsSection = ({ wasteKinds, activeWaste, onToggle }: WasteKindsSectionProps) => {
    return (
        <section id="waste" className="scroll-mt-18 bg-primary py-16 md:py-24">
            <div className="mx-auto w-full max-w-container px-4 md:px-8">
                <div className="flex w-full max-w-3xl flex-col">
                    <span className="text-sm font-semibold text-brand-secondary md:text-md">Що здавати</span>
                    <h2 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">Що можна здати на переробку</h2>
                    <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">
                        Оберіть тип вторсировини — карта покаже лише ті пункти, які його приймають. Вимоги можуть відрізнятися, тому
                        перевіряйте сторінку пункту.
                    </p>
                </div>

                <div className="mt-12 md:mt-16">
                    {wasteKinds.length === 0 ? (
                        <p className="text-md text-tertiary">Не вдалося завантажити перелік вторсировини. Спробуйте оновити сторінку.</p>
                    ) : (
                        <ul className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {wasteKinds.map((kind) => {
                                const isActive = kind.value === activeWaste;
                                return (
                                    <li key={kind.value} className={cx("flex *:flex-1", isActive && "rounded-sm ring-2 ring-brand")}>
                                        <FeatureTextFeaturedIconCard
                                            icon={wasteKindIcons[kind.value]}
                                            title={kind.label}
                                            subtitle={kind.description}
                                            footer={
                                                <Button
                                                    color="link-color"
                                                    size="lg"
                                                    iconTrailing={isActive ? XClose : ArrowRight}
                                                    onClick={() => onToggle(kind.value)}
                                                    aria-pressed={isActive}
                                                >
                                                    {isActive ? "Скинути фільтр" : "Показати на карті"}
                                                </Button>
                                            }
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </section>
    );
};
