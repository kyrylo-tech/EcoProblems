"use client";

import type { FC } from "react";
import { AlertTriangle, ArrowRight, Building07, HelpCircle, Mail01, Send01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { ADD_POINT_HREF } from "@/components/marketing/header-navigation/header";
import { SITE_CONTACTS } from "@/lib/site";
import { PageHeader } from "./sections";

interface ContactCard {
    icon: FC<{ className?: string }>;
    title: string;
    text: string;
    linkLabel: string;
    href: string;
    external?: boolean;
}

const directChannels: ContactCard[] = [
    ...(SITE_CONTACTS.email
        ? [{ icon: Mail01, title: "Пошта", text: "Питання щодо сайту, помилки в даних, співпраця.", linkLabel: SITE_CONTACTS.email, href: `mailto:${SITE_CONTACTS.email}` }]
        : []),
    ...(SITE_CONTACTS.telegram
        ? [{ icon: Send01, title: "Telegram", text: "Новини проєкту та швидкі питання.", linkLabel: "Написати в Telegram", href: SITE_CONTACTS.telegram, external: true }]
        : []),
];

const siteChannels: ContactCard[] = [
    {
        icon: AlertTriangle,
        title: "Екопроблема поруч",
        text: "Не чекайте відповіді — позначте її на карті, і після перевірки її побачать усі.",
        linkLabel: "Повідомити про проблему",
        href: ADD_POINT_HREF,
    },
    {
        icon: Building07,
        title: "Для пунктів прийому",
        text: "Як додати свій пункт і що він отримає на карті.",
        linkLabel: "Для бізнесу",
        href: "/business",
    },
    {
        icon: HelpCircle,
        title: "Часті запитання",
        text: "Реєстрація, модерація, фото та редагування точок.",
        linkLabel: "Читати відповіді",
        href: "/how-it-works#faq",
    },
];

/** Untitled UI `contact-section-icon-cards`. */
export const ContactsScreen = () => (
    <>
        <PageHeader
            eyebrow="Контакти"
            title="Зв'яжіться з нами"
            description="Маєте питання чи пропозицію, або знайшли помилку на карті? Оберіть зручний спосіб."
        />

        <section className="bg-primary pb-16 md:pb-24">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[...directChannels, ...siteChannels].map((card) => (
                        <li key={card.title} className="flex flex-col gap-12 rounded-2xl bg-secondary p-5 md:gap-16 md:p-6">
                            <FeaturedIcon icon={card.icon} size="lg" color="brand" theme="dark" />
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">{card.title}</h2>
                                    <p className="mt-1 text-md text-tertiary">{card.text}</p>
                                </div>
                                <Button
                                    href={card.href}
                                    color="link-color"
                                    size="lg"
                                    iconTrailing={ArrowRight}
                                    {...(card.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                >
                                    {card.linkLabel}
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    </>
);
