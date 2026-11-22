import { Button } from "@/components/base/buttons/button";

const footerLinks = [
    { label: "Про проєкт", href: "/about" },
    { label: "Контакти", href: "/contacts" },
    { label: "Конфіденційність", href: "/privacy" },
];

export const SiteFooter = () => {
    return (
        <footer className="mx-auto w-full max-w-container px-4 py-10 md:px-8 md:py-12">
            <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-tertiary">© Eco Guard</p>
                <nav aria-label="Нижня навігація">
                    <ul className="flex flex-wrap gap-x-5 gap-y-2">
                        {footerLinks.map((link) => (
                            <li key={link.href}>
                                <Button color="link-gray" size="sm" href={link.href}>
                                    {link.label}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </footer>
    );
};
