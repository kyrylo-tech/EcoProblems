"use client";

import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { EcoGuardLogo } from "@/components/foundations/logo/eco-guard-logo";

/** Untitled UI `footer-large-02`, Eco Guard content. */

const footerNavList = [
    {
        label: "Карта",
        items: [
            { label: "Пункти прийому", href: "/#map" },
            { label: "Екопроблеми", href: "/#problems" },
            { label: "Що можна здати", href: "/#waste" },
            {
                label: "Додати точку",
                href: "/points/new",
                badge: (
                    <Badge color="brand" type="pill-color" size="sm" className="ml-1">
                        Нове
                    </Badge>
                ),
            },
        ],
    },
    {
        label: "Проєкт",
        items: [
            { label: "Про проєкт", href: "/about" },
            { label: "Як це працює", href: "/#how" },
            { label: "Для бізнесу", href: "/#business" },
            { label: "Контакти", href: "/contacts" },
        ],
    },
    {
        label: "Правила",
        items: [
            { label: "Конфіденційність", href: "/privacy" },
            { label: "Умови використання", href: "/terms" },
            { label: "Правила модерації", href: "/moderation" },
        ],
    },
];

export const FooterLarge02 = () => {
    return (
        <footer>
            <div className="bg-primary py-12 md:pt-16">
                <div className="mx-auto max-w-container px-4 md:px-8">
                    <div className="flex flex-col gap-8 md:gap-16 xl:flex-row">
                        <div className="flex flex-col items-start gap-6 md:w-80 md:gap-6">
                            <EcoGuardLogo />
                            <p className="text-md text-tertiary">
                                Карта пунктів прийому вторсировини та екологічних проблем України. Разом робимо міста чистішими.
                            </p>
                        </div>
                        <nav className="flex-1">
                            <ul className="grid flex-1 grid-cols-2 gap-8 md:grid-cols-3">
                                {footerNavList.map((category) => (
                                    <li key={category.label}>
                                        <h4 className="text-sm font-semibold text-quaternary">{category.label}</h4>
                                        <ul className="mt-4 flex flex-col gap-3">
                                            {category.items.map((item) => (
                                                <li key={item.label} className="flex">
                                                    <Button
                                                        color="link-gray"
                                                        size="md"
                                                        href={item.href}
                                                        iconTrailing={"badge" in item ? item.badge : undefined}
                                                        className="max-h-5 gap-1"
                                                    >
                                                        {item.label}
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
            <div className="bg-secondary_alt py-10 md:py-12">
                <div className="mx-auto max-w-container px-4 md:px-8">
                    <div className="flex flex-col-reverse justify-between gap-6 md:flex-row">
                        <p className="text-sm text-quaternary">© Eco Guard. Дані карти додають користувачі та перевіряють модератори.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
