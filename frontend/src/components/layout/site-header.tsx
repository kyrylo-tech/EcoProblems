"use client";

import { Menu02, XClose } from "@untitledui/icons";
import { Button as AriaButton, Dialog as AriaDialog, DialogTrigger as AriaDialogTrigger, Popover as AriaPopover } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { EcoGuardLogo } from "@/components/foundations/logo/eco-guard-logo";
import { cx } from "@/utils/cx";

/** Based on the Untitled UI marketing header (components/marketing/header-navigation/header.tsx). */

export const navItems = [
    { label: "Карта", href: "/#map" },
    { label: "Що здавати", href: "/#waste" },
    { label: "Як це працює", href: "/#how" },
    { label: "Для бізнесу", href: "/#business" },
];

export const LOGIN_HREF = "/login";
export const ADD_POINT_HREF = "/points/new";

export const SiteHeader = () => {
    return (
        <header className="relative flex h-18 w-full items-center justify-center max-md:has-aria-expanded:bg-primary md:h-20">
            <div className="flex size-full max-w-container flex-1 items-center pr-3 pl-4 md:px-8">
                <div className="flex w-full items-center justify-between gap-4">
                    <a href="/" aria-label="Eco Guard — на головну" className="rounded-lg outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-4">
                        <EcoGuardLogo />
                    </a>

                    {/* Desktop navigation */}
                    <nav aria-label="Основна навігація" className="max-md:hidden">
                        <ul className="flex items-center gap-0.5 lg:gap-2">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <a
                                        href={item.href}
                                        className="flex rounded-lg px-2 py-1 text-md font-semibold text-secondary outline-focus-ring transition duration-100 ease-linear hover:text-secondary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="hidden items-center gap-2 md:flex">
                        <Button color="tertiary" size="lg" href={LOGIN_HREF}>
                            Увійти
                        </Button>
                        <Button color="primary-dark" size="lg" href={ADD_POINT_HREF} className="rounded-full before:rounded-full">
                            Додати пункт
                        </Button>
                    </div>

                    {/* Mobile menu */}
                    <AriaDialogTrigger>
                        <AriaButton
                            aria-label="Відкрити меню"
                            className={({ isFocusVisible, isHovered }) =>
                                cx(
                                    "group ml-auto cursor-pointer rounded-lg p-2 md:hidden",
                                    isHovered && "bg-primary_hover",
                                    isFocusVisible && "outline-2 outline-offset-2 outline-focus-ring",
                                )
                            }
                        >
                            <Menu02 className="size-6 text-secondary group-aria-expanded:hidden" aria-hidden="true" />
                            <XClose className="hidden size-6 text-secondary group-aria-expanded:block" aria-hidden="true" />
                        </AriaButton>
                        <AriaPopover
                            triggerRef={undefined}
                            className="h-[calc(100%-72px)] w-full overflow-y-auto shadow-lg md:hidden"
                            offset={0}
                            crossOffset={20}
                            containerPadding={0}
                            placement="bottom left"
                        >
                            <AriaDialog className="outline-hidden" aria-label="Меню">
                                {({ close }) => (
                                    <nav className="w-full bg-primary shadow-lg">
                                        <ul className="flex flex-col gap-0.5 py-5">
                                            {navItems.map((item) => (
                                                <li key={item.href}>
                                                    <a
                                                        href={item.href}
                                                        onClick={close}
                                                        className="flex items-center px-4 py-3 text-md font-semibold text-primary hover:bg-primary_hover"
                                                    >
                                                        {item.label}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex flex-col gap-3 border-t border-secondary px-4 py-6">
                                            <Button color="primary-dark" size="lg" href={ADD_POINT_HREF}>
                                                Додати пункт
                                            </Button>
                                            <Button color="secondary" size="lg" href={LOGIN_HREF}>
                                                Увійти
                                            </Button>
                                        </div>
                                    </nav>
                                )}
                            </AriaDialog>
                        </AriaPopover>
                    </AriaDialogTrigger>
                </div>
            </div>
        </header>
    );
};
