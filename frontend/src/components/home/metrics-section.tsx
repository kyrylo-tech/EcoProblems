import { plural } from "@/lib/format";
import type { Stats } from "@/lib/types";

/** Untitled UI `metrics-card-gray-light` with live numbers from /api/stats. */

export const MetricsSection = ({ stats }: { stats: Stats | null }) => {
    const items = [
        { value: stats?.collection_points, forms: ["пункт прийому", "пункти прийому", "пунктів прийому"] },
        { value: stats?.cities, forms: ["місто на карті", "міста на карті", "міст на карті"] },
        { value: stats?.eco_problems, forms: ["екопроблема на карті", "екопроблеми на карті", "екопроблем на карті"] },
    ] as const;

    return (
        <section className="bg-primary py-16 md:py-24">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <div className="flex flex-col gap-8 rounded-2xl bg-secondary px-6 py-10 md:gap-16 md:rounded-none md:bg-transparent md:p-0">
                    <div className="flex w-full flex-col self-center text-center md:max-w-3xl">
                        <h2 className="text-display-sm font-semibold text-primary md:text-display-md">Карта, яку наповнюють люди</h2>
                        <p className="mt-4 text-lg text-tertiary md:mt-5 md:text-xl">
                            Кожну точку додають користувачі, а модератори перевіряють її перед публікацією.
                        </p>
                    </div>

                    <dl className="flex flex-col gap-8 rounded-2xl bg-secondary md:flex-row md:p-16">
                        {items.map((item) => (
                            <div key={item.forms[2]} className="flex flex-1 flex-col-reverse gap-3 text-center">
                                <dt className="text-lg font-semibold text-primary">{plural(item.value ?? 0, item.forms)}</dt>
                                <dd className="text-display-lg font-semibold text-brand-tertiary_alt md:text-display-xl">{item.value ?? "—"}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
};
