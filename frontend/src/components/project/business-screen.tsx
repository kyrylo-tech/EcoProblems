"use client";

import { Camera01, CheckCircle, Clock, Edit05, MarkerPin01, Route, SearchLg, ShieldTick, UserPlus01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeatureTextFeaturedIconCard } from "@/components/marketing/features/base-components/feature-text";
import { wasteKindIcons } from "@/components/home/icons";
import { ADD_POINT_HREF } from "@/components/marketing/header-navigation/header";
import type { Catalog } from "@/lib/types";
import { CtaCard, FeatureGrid, PageHeader, Section, Steps } from "./sections";

const benefits = [
    {
        icon: SearchLg,
        title: "Вас знайдуть",
        text: "Мешканці побачать ваш пункт на карті та в пошуку за містом, вулицею чи назвою.",
    },
    {
        icon: CheckCircle,
        title: "Що ви приймаєте",
        text: "Позначте види вторсировини — відвідувачі одразу зрозуміють, з чим до вас іти.",
    },
    {
        icon: Clock,
        title: "Графік роботи",
        text: "Години роботи для кожного дня тижня або позначка «цілодобово».",
    },
    {
        icon: Camera01,
        title: "Фото пункту",
        text: "До 10 фото, щоб пункт було легко впізнати на місці.",
    },
    {
        icon: Route,
        title: "Маршрут до вас",
        text: "Кнопка «Маршрут» прокладає шлях до пункту в Google Maps.",
    },
    {
        icon: ShieldTick,
        title: "Дані під контролем",
        text: "Редагувати пункт можете лише ви та адміністратори, а кожна зміна проходить модерацію.",
    },
];

const steps = [
    { title: "Створіть обліковий запис", description: "Ім'я, пошта й пароль — це займе хвилину.", icon: UserPlus01 },
    { title: "Додайте пункт", description: "Місце на карті, вторсировина, графік роботи й фото.", icon: MarkerPin01 },
    { title: "Модерація", description: "Адміністратор перевіряє дані перед публікацією.", icon: ShieldTick },
    { title: "Оновлюйте дані", description: "Змінився графік чи перелік — відредагуйте пункт, і зміни теж пройдуть перевірку.", icon: Edit05 },
];

export const BusinessScreen = ({ catalog }: { catalog: Catalog | null }) => (
    <>
        <PageHeader
            eyebrow="Для бізнесу"
            title="Розкажіть людям про свій пункт прийому"
            description="Додайте пункт на карту Eco Guard: адреса, графік роботи й перелік вторсировини, яку ви приймаєте, — усе на одній сторінці."
            actions={
                <>
                    <Button color="secondary" size="xl" href="/contacts">
                        Зв'язатися з нами
                    </Button>
                    <Button size="xl" href={ADD_POINT_HREF}>
                        Додати пункт
                    </Button>
                </>
            }
        />

        <Section muted eyebrow="Переваги" title="Що отримає ваш пункт">
            <FeatureGrid items={benefits} />
        </Section>

        {catalog && catalog.waste_kinds.length > 0 && (
            <Section
                eyebrow="Вторсировина"
                title="Що можна вказати"
                description="Відмітьте все, що приймає ваш пункт: відвідувачі зможуть відфільтрувати карту за потрібним видом."
            >
                <ul className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {catalog.waste_kinds.map((kind) => (
                        <li key={kind.value} className="flex *:flex-1">
                            <FeatureTextFeaturedIconCard icon={wasteKindIcons[kind.value]} title={kind.label} subtitle={kind.description} />
                        </li>
                    ))}
                </ul>
            </Section>
        )}

        <Section muted centered eyebrow="Підключення" title="Як додати пункт" description="Чотири кроки — і про ваш пункт дізнаються мешканці району.">
            <Steps steps={steps} />
        </Section>

        <CtaCard
            title="Керуєте мережею пунктів чи організацією?"
            description="Напишіть нам — обговоримо, як найзручніше додати ваші пункти на карту."
            actions={
                <>
                    <Button color="secondary" size="xl" href="/how-it-works" className="shadow-xs! ring-0">
                        Як це працює
                    </Button>
                    <Button size="xl" href="/contacts">
                        Зв'язатися з нами
                    </Button>
                </>
            }
        />
    </>
);
