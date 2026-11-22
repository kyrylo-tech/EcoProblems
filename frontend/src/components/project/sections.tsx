"use client";

import type { FC, ReactNode } from "react";
import { MessageQuestionCircle } from "@untitledui/icons";
import { Progress } from "@/components/application/progress-steps/progress-steps";
import type { ProgressFeaturedIconType } from "@/components/application/progress-steps/progress-types";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { FeatureTextFeaturedIconTopLeft } from "@/components/marketing/features/base-components/feature-text";
import { cx } from "@/utils/cx";

/** Building blocks of the "Проєкт" pages, composed from Untitled UI marketing sections. */

type Icon = FC<{ className?: string }>;

/** Untitled UI `header-section-simple`. */
export const PageHeader = ({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) => (
    <section className="bg-primary pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="mx-auto max-w-container px-4 md:px-8">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
                <span className="text-sm font-semibold text-brand-secondary md:text-md">{eyebrow}</span>
                <h1 className="mt-3 text-display-md font-semibold text-primary md:text-display-lg">{title}</h1>
                <p className="mt-4 text-lg text-balance text-tertiary md:mt-6 md:text-xl">{description}</p>
                {actions && <div className="mt-8 flex flex-col-reverse gap-3 self-stretch sm:flex-row sm:self-center md:mt-12">{actions}</div>}
            </div>
        </div>
    </section>
);

interface SectionProps {
    id?: string;
    eyebrow?: string;
    title: string;
    description?: ReactNode;
    /** Gray background to separate neighbouring sections. */
    muted?: boolean;
    centered?: boolean;
    children: ReactNode;
}

export const Section = ({ id, eyebrow, title, description, muted, centered, children }: SectionProps) => (
    <section id={id} className={cx("scroll-mt-18 py-16 md:py-24", muted ? "bg-secondary" : "bg-primary")}>
        <div className="mx-auto w-full max-w-container px-4 md:px-8">
            <div className={cx("flex w-full max-w-3xl flex-col", centered && "mx-auto items-center text-center")}>
                {eyebrow && <span className="text-sm font-semibold text-brand-secondary md:text-md">{eyebrow}</span>}
                <h2 className={cx("text-display-sm font-semibold text-primary md:text-display-md", eyebrow && "mt-3")}>{title}</h2>
                {description && <div className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">{description}</div>}
            </div>
            <div className="mt-12 md:mt-16">{children}</div>
        </div>
    </section>
);

/** Untitled UI `features-simple-icons` grid. */
export const FeatureGrid = ({ items }: { items: { icon: Icon; title: string; text: string }[] }) => (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 md:gap-y-16 lg:grid-cols-3">
        {items.map((item) => (
            <li key={item.title} className="flex justify-center sm:justify-start">
                <FeatureTextFeaturedIconTopLeft icon={item.icon} title={item.title} subtitle={item.text} />
            </li>
        ))}
    </ul>
);

/** Untitled UI `progress-steps` with featured icons, horizontal on desktop. */
export const Steps = ({ steps }: { steps: Omit<ProgressFeaturedIconType, "status">[] }) => {
    const items = steps.map((step) => ({ ...step, status: "complete" as const }));
    return (
        <div className="mx-auto max-w-5xl">
            <Progress.IconsWithText type="featured-icon" orientation="horizontal" size="md" items={items} className="max-md:hidden" />
            <Progress.IconsWithText type="featured-icon" orientation="vertical" size="md" items={items} className="md:hidden" />
        </div>
    );
};

/** Untitled UI `faq-section-simple` with icons, two columns. */
export const Faq = ({ items }: { items: { question: string; answer: ReactNode }[] }) => (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 md:gap-y-12">
        {items.map((item) => (
            <div key={item.question} className="flex gap-4">
                <FeaturedIcon icon={MessageQuestionCircle} size="md" color="brand" theme="light" className="shrink-0" />
                <div className="flex flex-col gap-1 pt-1.5">
                    <dt className="text-lg font-semibold text-primary">{item.question}</dt>
                    <dd className="text-md text-tertiary">{item.answer}</dd>
                </div>
            </div>
        ))}
    </dl>
);

/** Untitled UI `cta-card-horizontal-brand` (same look as the CTA on the home page). */
export const CtaCard = ({ title, description, actions }: { title: string; description: string; actions: ReactNode }) => (
    <section className="bg-primary py-16 md:py-24">
        <div className="mx-auto max-w-container px-4 md:px-8">
            <div className="flex flex-col items-center rounded-2xl bg-brand-section px-6 py-10 text-center lg:p-16">
                <h2 className="text-display-sm font-semibold text-primary_on-brand xl:text-display-md">{title}</h2>
                <p className="mt-4 text-lg text-tertiary_on-brand md:mt-5 lg:text-xl">{description}</p>
                <div className="mt-8 flex flex-col-reverse gap-3 self-stretch sm:flex-row sm:self-center">{actions}</div>
            </div>
        </div>
    </section>
);
