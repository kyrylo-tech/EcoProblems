import { Button } from "@/components/base/buttons/button";

export interface InformationSection {
    title: string;
    paragraphs?: string[];
    items?: string[];
}

interface InformationPageProps {
    title: string;
    introduction: string;
    sections: InformationSection[];
}

const policyLinks = [
    { label: "Політика конфіденційності", href: "/privacy" },
    { label: "Умови використання", href: "/terms" },
    { label: "Правила модерації", href: "/moderation" },
];

export const InformationPage = ({ title, introduction, sections }: InformationPageProps) => {
    return (
        <article className="bg-secondary py-12 md:py-16">
            <div className="mx-auto w-full max-w-4xl px-4 md:px-8">
                <nav aria-label="Навігаційний шлях" className="mb-8">
                    <Button color="link-gray" size="sm" href="/">
                        На головну
                    </Button>
                </nav>

                <header className="mb-10 md:mb-12">
                    <p className="text-sm font-semibold text-brand-secondary md:text-md">Eco Guard · правила проєкту</p>
                    <h1 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">{title}</h1>
                    <p className="mt-5 text-lg leading-relaxed text-tertiary">{introduction}</p>
                </header>

                <div className="flex flex-col gap-5">
                    {sections.map((section) => (
                        <section key={section.title} className="rounded-2xl bg-primary p-5 shadow-xs ring-1 ring-secondary md:p-8">
                            <h2 className="text-lg font-semibold text-primary md:text-xl">{section.title}</h2>
                            {section.paragraphs?.map((paragraph) => (
                                <p key={paragraph} className="mt-4 leading-relaxed text-tertiary">
                                    {paragraph}
                                </p>
                            ))}
                            {section.items && (
                                <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 leading-relaxed text-tertiary marker:text-brand-secondary">
                                    {section.items.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}
                </div>

                <nav aria-label="Інші правила Eco Guard" className="mt-10 rounded-2xl bg-primary p-5 ring-1 ring-secondary md:p-8">
                    <h2 className="text-lg font-semibold text-primary">Інші правила</h2>
                    <ul className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
                        {policyLinks.map((link) => (
                            <li key={link.href}>
                                <Button color="link-color" size="md" href={link.href}>
                                    {link.label}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </article>
    );
};
