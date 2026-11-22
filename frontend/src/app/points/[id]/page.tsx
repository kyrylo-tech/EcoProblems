import { notFound } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { fetchBackend } from "@/lib/server-api";
import { directionsUrl, formatAddress } from "@/lib/format";
import type { PointDetail } from "@/lib/types";

export default async function PointPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!/^\d+$/.test(id)) notFound();

    const point = await fetchBackend<PointDetail>(`/points/${id}`);
    if (!point) notFound();

    const address = formatAddress(point.street, point.city);
    const typeLabel = point.type === "collection" ? "Пункт прийому" : "Екологічна проблема";

    return (
        <main className="bg-secondary py-10 md:py-14">
            <article className="mx-auto w-full max-w-4xl px-4 md:px-8">
                <nav aria-label="Навігаційний шлях" className="mb-6 flex gap-4">
                    <Button color="link-gray" size="sm" href="/map">
                        До карти
                    </Button>
                    <Button color="link-gray" size="sm" href="/">
                        На головну
                    </Button>
                </nav>

                <div className="rounded-2xl bg-primary p-5 shadow-xs ring-1 ring-secondary md:p-8">
                    <p className="text-sm font-semibold text-brand-secondary">{typeLabel}</p>
                    <h1 className="mt-2 text-display-sm font-semibold text-primary md:text-display-md">{point.title}</h1>
                    {address && <p className="mt-3 text-md text-tertiary">{address}</p>}

                    {point.photos.length > 0 && (
                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            {point.photos.map((photo) => (
                                <img
                                    key={photo.id}
                                    src={photo.url}
                                    alt={`Фото точки «${point.title}»`}
                                    className="max-h-96 w-full rounded-xl object-cover"
                                />
                            ))}
                        </div>
                    )}

                    <section className="mt-7">
                        <h2 className="text-lg font-semibold text-primary">Опис</h2>
                        <p className="mt-2 whitespace-pre-wrap leading-relaxed text-tertiary">
                            {point.description || "Опис не додано."}
                        </p>
                    </section>

                    <div className="mt-7 flex flex-wrap gap-3">
                        <Button
                            href={directionsUrl(point.latitude, point.longitude)}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Прокласти маршрут
                        </Button>
                        <Button href="/map" color="secondary">
                            Повернутися до карти
                        </Button>
                    </div>
                </div>
            </article>
        </main>
    );
}
