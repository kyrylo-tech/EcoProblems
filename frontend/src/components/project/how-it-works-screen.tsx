"use client";

import { CheckCircle, MarkerPin01, Route, SearchLg, ShieldTick, UserPlus01, XCircle } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { wasteKindIcons } from "@/components/home/icons";
import { ADD_POINT_HREF } from "@/components/marketing/header-navigation/header";
import type { Catalog } from "@/lib/types";
import { CtaCard, Faq, PageHeader, Section, Steps } from "./sections";

const recycleSteps = [
    { title: "Оберіть вторсировину", description: "Позначте, що саме хочете здати: пластик, скло, папір, метал, батарейки чи текстиль.", icon: SearchLg },
    { title: "Знайдіть пункт", description: "Шукайте за містом, вулицею чи назвою — карта покаже пункти з адресою та графіком.", icon: MarkerPin01 },
    { title: "Підготуйте й віднесіть", description: "Перегляньте вимоги пункту та прокладіть маршрут у Google Maps.", icon: Route },
];

const addSteps = [
    { title: "Створіть обліковий запис", description: "Ім'я, пошта й пароль — і можна додавати точки.", icon: UserPlus01 },
    { title: "Додайте точку", description: "Вкажіть місце, оберіть вид проблеми або вторсировину, яку приймає пункт, додайте фото.", icon: MarkerPin01 },
    { title: "Модерація", description: "Адміністратор перевіряє точку. Поки вона на модерації, її бачите лише ви.", icon: ShieldTick },
    { title: "Точка на карті", description: "Після схвалення точку побачать усі відвідувачі сайту.", icon: CheckCircle },
];

const faq = [
    {
        question: "Чи потрібна реєстрація?",
        answer: "Ні, щоб переглядати карту й шукати пункти. Обліковий запис потрібен лише для того, щоб додавати точки.",
    },
    {
        question: "Хто перевіряє точки?",
        answer: "Адміністратори Eco Guard. Точка з'являється на карті тільки після схвалення, а якщо її відхиляють — обов'язково вказують причину.",
    },
    {
        question: "Що буде, якщо я відредагую точку?",
        answer: "Після змін точка знову проходить модерацію — так дані на карті лишаються перевіреними. Редагувати точку можуть лише її автор і адміністратори.",
    },
    {
        question: "Які фото можна додати?",
        answer: "JPEG, PNG або WebP розміром до 10 МБ, не більше 10 фото на одну точку.",
    },
    {
        question: "Чи можна додати пункт, яким я не керую?",
        answer: "Так. Якщо знаєте пункт прийому чи проблему поруч, додайте її — модератор перевірить дані перед публікацією.",
    },
    {
        question: "Помітили помилку в даних пункту?",
        answer: (
            <>
                Напишіть нам через сторінку{" "}
                <Button href="/contacts" color="link-color" size="lg">
                    «Контакти»
                </Button>
                .
            </>
        ),
    },
];

export const HowItWorksScreen = ({ catalog }: { catalog: Catalog | null }) => (
    <>
        <PageHeader
            eyebrow="Як це працює"
            title="Від пошуку пункту до чистішого міста"
            description="Розповідаємо, як знайти пункт прийому, підготувати вторсировину та повідомити про екологічну проблему."
        />

        <Section muted centered eyebrow="Для мешканців" title="Як здати вторсировину" description="Без реєстрації — просто знайдіть пункт поруч.">
            <Steps steps={recycleSteps} />
        </Section>

        <Section
            eyebrow="Підготовка"
            title="Що приймають і що ні"
            description="Вимоги можуть відрізнятися між пунктами, тому перед походом перевіряйте сторінку конкретного пункту."
        >
            {catalog ? (
                <div className="flex flex-col gap-12 md:gap-16">
                    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {catalog.waste_kinds.map((kind) => (
                            <li key={kind.value} className="flex flex-col gap-4 rounded-2xl bg-secondary p-5 md:p-6">
                                <div className="flex items-center gap-3">
                                    <FeaturedIcon icon={wasteKindIcons[kind.value]} size="md" color="brand" theme="dark" />
                                    <h3 className="text-lg font-semibold text-primary">{kind.label}</h3>
                                </div>
                                <div className="flex gap-2 text-md text-tertiary">
                                    <CheckCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-fg-success-primary" />
                                    <p>
                                        <span className="font-medium text-secondary">Приймають: </span>
                                        {kind.accepted}
                                    </p>
                                </div>
                                <div className="flex gap-2 text-md text-tertiary">
                                    <XCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-fg-error-secondary" />
                                    <p>
                                        <span className="font-medium text-secondary">Не приймають: </span>
                                        {kind.not_accepted}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {catalog.preparation_tips.length > 0 && (
                        <div className="flex flex-col gap-5">
                            <h3 className="text-xl font-semibold text-primary">Перед тим як нести</h3>
                            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {catalog.preparation_tips.map((tip) => (
                                    <li key={tip} className="flex gap-3 text-md text-tertiary">
                                        <CheckCircle aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-fg-brand-primary" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-md text-tertiary">Не вдалося завантажити довідник вторсировини. Спробуйте оновити сторінку.</p>
            )}
        </Section>

        <Section
            muted
            centered
            eyebrow="Для активних"
            title="Як додати пункт чи повідомити про проблему"
            description="Карту наповнюють самі люди, а модератори перевіряють кожну точку."
        >
            <Steps steps={addSteps} />
        </Section>

        <Section id="faq" eyebrow="Питання" title="Часті запитання">
            <Faq items={faq} />
        </Section>

        <CtaCard
            title="Готові почати?"
            description="Знайдіть найближчий пункт прийому або додайте на карту те, що знаєте саме ви."
            actions={
                <>
                    <Button color="secondary" size="xl" href="/#map" className="shadow-xs! ring-0">
                        Знайти пункт
                    </Button>
                    <Button size="xl" href={ADD_POINT_HREF}>
                        Додати точку
                    </Button>
                </>
            }
        />
    </>
);
