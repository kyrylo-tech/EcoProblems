"use client";

import { AlertTriangle, Camera01, Eye, MarkerPin01, Route, ShieldTick } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { MetricsSection } from "@/components/home/metrics-section";
import { ADD_POINT_HREF } from "@/components/marketing/header-navigation/header";
import type { Stats } from "@/lib/types";
import { CtaCard, FeatureGrid, PageHeader, Section } from "./sections";

const features = [
    {
        icon: MarkerPin01,
        title: "Пункти прийому",
        text: "Адреса, графік роботи по днях і види вторсировини, які там приймають.",
    },
    {
        icon: AlertTriangle,
        title: "Екопроблеми",
        text: "Стихійні звалища, переповнені контейнери, спалювання сміття, забруднення води, повітря й ґрунту, вирубка дерев.",
    },
    {
        icon: ShieldTick,
        title: "Перевірені дані",
        text: "Кожну нову точку й кожну зміну перевіряє адміністратор — на карту потрапляє лише те, що пройшло модерацію.",
    },
    {
        icon: Camera01,
        title: "Фото з місця",
        text: "До точки можна додати до 10 фото — так простіше впізнати пункт і оцінити масштаб проблеми.",
    },
    {
        icon: Route,
        title: "Маршрут в один дотик",
        text: "Знайшли пункт — прокладіть до нього шлях у Google Maps прямо з карти.",
    },
    {
        icon: Eye,
        title: "Відкрито для всіх",
        text: "Переглядати карту можна без реєстрації. Обліковий запис потрібен лише для того, щоб додавати точки.",
    },
];

export const AboutScreen = ({ stats }: { stats: Stats | null }) => (
    <>
        <PageHeader
            eyebrow="Про проєкт"
            title="Eco Guard — карта для чистіших міст"
            description="Ми збираємо на одній карті пункти прийому вторсировини та екологічні проблеми України, щоб кожен міг знайти, куди здати відходи, і повідомити про те, що потребує уваги."
        />

        <Section muted title="Навіщо це потрібно">
            <div className="grid grid-cols-1 gap-8 text-lg text-tertiary md:grid-cols-3 md:gap-12">
                <p>
                    Багато хто готовий сортувати відходи, але не знає, куди їх віднести: інформація про пункти прийому розкидана по сайтах, групах і
                    оголошеннях, а графіки та умови швидко застарівають.
                </p>
                <p>
                    Так само непомітними лишаються стихійні звалища, спалювання сміття чи забруднення води — про них знають місцеві мешканці, але ця
                    інформація рідко доходить до тих, хто може допомогти.
                </p>
                <p>
                    Eco Guard поєднує обидві задачі: відкрита карта, яку наповнюють самі люди, а модератори перевіряють кожну точку перед
                    публікацією.
                </p>
            </div>
        </Section>

        <Section eyebrow="Можливості" title="Що є на карті" description="Усе, що потрібно, щоб здати вторсировину або привернути увагу до проблеми.">
            <FeatureGrid items={features} />
        </Section>

        <MetricsSection stats={stats} />

        <CtaCard
            title="Долучайтеся"
            description="Знаєте пункт прийому чи помітили проблему поруч? Додайте її на карту — це займе кілька хвилин."
            actions={
                <>
                    <Button color="secondary" size="xl" href="/#map" className="shadow-xs! ring-0">
                        Відкрити карту
                    </Button>
                    <Button size="xl" href={ADD_POINT_HREF}>
                        Додати точку
                    </Button>
                </>
            }
        />
    </>
);
