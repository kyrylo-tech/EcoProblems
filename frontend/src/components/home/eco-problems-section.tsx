import { AlertTriangle, ArrowRight } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { FeatureTextFeaturedIconCard } from "@/components/marketing/features/base-components/feature-text";
import { ADD_POINT_HREF } from "@/components/marketing/header-navigation/header";
import type { EcoProblemKind, EcoProblemKindOption } from "@/lib/types";
import { ecoProblemIcons } from "./icons";

/** Untitled UI `features-icon-cards-02`: the most common problem kinds from /api/catalog. */

const FEATURED: EcoProblemKind[] = ["illegal_dump", "water_pollution", "waste_burning", "illegal_logging"];

export const EcoProblemsSection = ({ problemKinds }: { problemKinds: EcoProblemKindOption[] }) => {
    const featured = FEATURED.map((value) => problemKinds.find((kind) => kind.value === value)).filter((kind) => kind !== undefined);

    return (
        <section id="problems" className="scroll-mt-18 bg-primary py-16 md:py-24">
            <div className="mx-auto w-full max-w-container px-4 md:px-8">
                <div className="grid grid-cols-1 gap-12 md:gap-16 lg:grid-cols-3">
                    <div className="flex max-w-3xl flex-col items-start lg:col-span-1">
                        <FeaturedIcon icon={AlertTriangle} size="xl" theme="light" color="brand" className="hidden md:flex" />
                        <FeaturedIcon icon={AlertTriangle} size="lg" theme="light" color="brand" className="flex md:hidden" />
                        <h2 className="mt-5 text-display-sm font-semibold text-primary md:text-display-md">Помітили екопроблему?</h2>
                        <p className="mt-4 text-lg text-tertiary md:mt-5">
                            Позначте її на карті з фото — після перевірки модератором точку побачать мешканці, активісти та місцеві служби.
                        </p>
                        <Button size="xl" href={ADD_POINT_HREF} iconTrailing={ArrowRight} className="mt-8">
                            Повідомити про проблему
                        </Button>
                    </div>

                    <div className="lg:col-span-2">
                        <ul className="grid w-full grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 md:gap-y-8">
                            {featured.map((kind) => (
                                <li key={kind.value} className="flex *:flex-1">
                                    <FeatureTextFeaturedIconCard icon={ecoProblemIcons[kind.value]} title={kind.label} subtitle={kind.description} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};
