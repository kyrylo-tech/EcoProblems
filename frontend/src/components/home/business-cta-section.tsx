import { Button } from "@/components/base/buttons/button";
import { ADD_POINT_HREF } from "@/components/layout/site-header";

export const BusinessCtaSection = () => {
    return (
        <section id="business" className="mx-auto w-full max-w-container scroll-mt-6 px-4 pt-16 md:px-8 md:pt-24">
            <div className="flex flex-col items-start gap-6 rounded-3xl bg-brand-section px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12 md:py-12">
                <div>
                    <h2 className="text-display-xs font-bold tracking-tight text-primary_on-brand">Керуєте пунктом прийому?</h2>
                    <p className="mt-2 text-lg text-secondary_on-brand">Додайте його на карту, щоб вас легше знаходили.</p>
                </div>
                <Button color="accent" size="xl" href={ADD_POINT_HREF} className="shrink-0 rounded-full">
                    Додати пункт
                </Button>
            </div>
        </section>
    );
};
