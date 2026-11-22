"use client";

import { AlertTriangle, MarkerPin01, PlusCircle, Recording01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { NavMenuItemLink } from "./base-components/nav-menu-item";

/** Based on Untitled UI `dropdown-menu-simple-with-footer`. */

const items = [
    {
        title: "Пункти прийому",
        subtitle: "Куди здати пластик, скло, папір, метал, батарейки й одяг.",
        href: "/#map",
        Icon: MarkerPin01,
    },
    {
        title: "Екопроблеми",
        subtitle: "Стихійні звалища, забруднення води та повітря поруч із вами.",
        href: "/#problems",
        Icon: AlertTriangle,
    },
    {
        title: "Що можна здати",
        subtitle: "Що приймають і що не приймають пункти переробки.",
        href: "/#waste",
        Icon: Recording01,
    },
    {
        title: "Додати точку",
        subtitle: "Позначте пункт прийому або проблему — після модерації вона з'явиться на карті.",
        href: "/points/new",
        Icon: PlusCircle,
    },
];

export const DropdownMenuMap = () => {
    return (
        <div className="px-3 pb-2 md:max-w-84 md:p-0">
            <nav className="overflow-hidden rounded-xl bg-secondary shadow-xs ring-1 ring-secondary_alt md:rounded-2xl md:shadow-lg">
                <ul className="flex flex-col gap-0.5 rounded-xl bg-primary py-2 ring-1 ring-secondary md:rounded-t-2xl md:p-2">
                    {items.map(({ title, subtitle, href, Icon }) => (
                        <li key={title}>
                            <NavMenuItemLink icon={Icon} title={title} subtitle={subtitle} href={href} />
                        </li>
                    ))}
                </ul>
                <div className="flex justify-center px-4 py-5 text-center sm:px-5">
                    <Button href="/#map" color="link-color" size="md">
                        Відкрити карту
                    </Button>
                </div>
            </nav>
        </div>
    );
};
