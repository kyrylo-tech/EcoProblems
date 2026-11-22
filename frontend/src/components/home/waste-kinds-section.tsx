"use client";

import { Dot } from "@/components/foundations/dot-icon";
import type { WasteKind, WasteKindOption } from "@/lib/types";
import { cx } from "@/utils/cx";

interface WasteKindsSectionProps {
    wasteKinds: WasteKindOption[];
    activeWaste: WasteKind | null;
    onToggle: (kind: WasteKind) => void;
}

export const WasteKindsSection = ({ wasteKinds, activeWaste, onToggle }: WasteKindsSectionProps) => {
    return (
        <section id="waste" className="mx-auto w-full max-w-container scroll-mt-6 px-4 pb-16 md:px-8 md:pb-24">
            <h2 className="text-display-xs font-bold tracking-tight text-primary md:text-display-sm">Що можна здати</h2>
            <p className="mt-3 text-lg text-tertiary">Оберіть тип вторсировини, і карта покаже пункти, які його приймають.</p>

            {wasteKinds.length === 0 ? (
                <p className="mt-8 text-md text-tertiary">Не вдалося завантажити перелік вторсировини. Спробуйте оновити сторінку.</p>
            ) : (
                <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {wasteKinds.map((kind) => {
                        const isActive = kind.value === activeWaste;
                        return (
                            <li key={kind.value}>
                                <button
                                    type="button"
                                    aria-pressed={isActive}
                                    onClick={() => onToggle(kind.value)}
                                    className={cx(
                                        "flex h-full w-full cursor-pointer flex-col items-start rounded-2xl bg-primary p-5 text-left shadow-xs ring-1 ring-secondary outline-focus-ring transition duration-100 ease-linear ring-inset hover:ring-primary focus-visible:outline-2 focus-visible:outline-offset-2 md:p-6",
                                        isActive && "ring-2 ring-brand hover:ring-brand",
                                    )}
                                >
                                    <Dot size="md" style={{ color: kind.color }} aria-hidden="true" />
                                    <span className="mt-3 text-lg font-semibold text-primary">{kind.label}</span>
                                    <span className="mt-1 text-md text-tertiary">{kind.description}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
};
