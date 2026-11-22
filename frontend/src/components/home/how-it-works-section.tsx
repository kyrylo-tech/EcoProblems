const steps = [
    { title: "Оберіть вторсировину", description: "Позначте, що саме хочете здати." },
    { title: "Знайдіть пункт", description: "Карта покаже найближчі пункти з графіком роботи." },
    { title: "Підготуйте й віднесіть", description: "Перегляньте вимоги пункту та прокладіть маршрут." },
];

export const HowItWorksSection = () => {
    return (
        <section id="how" className="scroll-mt-6 border-y border-secondary bg-primary">
            <div className="mx-auto w-full max-w-container px-4 py-16 md:px-8 md:py-24">
                <h2 className="text-display-xs font-bold tracking-tight text-primary md:text-display-sm">Як це працює</h2>

                <ol className="mt-10 grid gap-10 md:mt-12 md:grid-cols-3 md:gap-8">
                    {steps.map((step, index) => (
                        <li key={step.title} className="flex flex-col">
                            <span className="text-display-md font-bold text-brand-tertiary" aria-hidden="true">
                                {index + 1}
                            </span>
                            <h3 className="mt-4 text-lg font-semibold text-primary">{step.title}</h3>
                            <p className="mt-2 text-md text-tertiary">{step.description}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
};
