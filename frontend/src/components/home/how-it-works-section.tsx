"use client";

import { MarkerPin01, Route, SearchLg } from "@untitledui/icons";
import { Progress } from "@/components/application/progress-steps/progress-steps";
import type { ProgressFeaturedIconType } from "@/components/application/progress-steps/progress-types";

/** Untitled UI section header + `progress-steps` (featured icons). */

const steps: ProgressFeaturedIconType[] = [
    { title: "Оберіть вторсировину", description: "Позначте, що саме хочете здати.", icon: SearchLg, status: "complete" },
    { title: "Знайдіть пункт", description: "Карта покаже найближчі пункти з графіком роботи.", icon: MarkerPin01, status: "complete" },
    { title: "Підготуйте й віднесіть", description: "Перегляньте вимоги пункту та прокладіть маршрут.", icon: Route, status: "complete" },
];

export const HowItWorksSection = () => {
    return (
        <section id="how" className="scroll-mt-18 bg-secondary py-16 md:py-24">
            <div className="mx-auto w-full max-w-container px-4 md:px-8">
                <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
                    <span className="text-sm font-semibold text-brand-secondary md:text-md">Як це працює</span>
                    <h2 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">Три кроки до чистішого міста</h2>
                    <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">Без реєстрації — просто знайдіть пункт поруч і віднесіть туди вторсировину.</p>
                </div>

                <div className="mx-auto mt-12 max-w-4xl md:mt-16">
                    <Progress.IconsWithText type="featured-icon" orientation="horizontal" size="md" items={steps} className="max-md:hidden" />
                    <Progress.IconsWithText type="featured-icon" orientation="vertical" size="md" items={steps} className="md:hidden" />
                </div>
            </div>
        </section>
    );
};
