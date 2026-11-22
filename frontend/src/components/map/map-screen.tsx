"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { api } from "@/lib/api";
import type { Page, PointDetail, PointSummary, PointType } from "@/lib/types";

type MapFilter = "all" | PointType;
type Coordinates = [number, number];

const INITIAL_VIEW: Coordinates = [48.5, 31.2];

const InteractiveMap = dynamic(
    () => import("@/components/map/interactive-map").then((module) => module.InteractiveMap),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-[min(70vh,720px)] min-h-100 items-center justify-center rounded-2xl bg-secondary text-sm text-tertiary ring-1 ring-secondary">
                Завантаження карти…
            </div>
        ),
    },
);

const filters: { value: MapFilter; label: string }[] = [
    { value: "all", label: "Усі" },
    { value: "collection", label: "Пункти прийому" },
    { value: "eco_problem", label: "Екопроблеми" },
];

interface MapScreenProps {
    initialFilter: MapFilter;
    initialQuery: string;
}

export function MapScreen({ initialFilter, initialQuery }: MapScreenProps) {
    const [points, setPoints] = useState<PointSummary[]>([]);
    const [details, setDetails] = useState<Record<number, PointDetail>>({});
    const [filter, setFilter] = useState<MapFilter>(initialFilter);
    const [query, setQuery] = useState(initialQuery);
    const [selectedPointId, setSelectedPointId] = useState<number | null>(null);
    const [view, setView] = useState<{ center: Coordinates; zoom: number }>({ center: INITIAL_VIEW, zoom: 6 });
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [detailErrors, setDetailErrors] = useState<Record<number, string>>({});
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

    const loadPoints = async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            const result = await api<Page<PointSummary>>("/points?limit=500");
            setPoints(result.items);
        } catch {
            setLoadError("Не вдалося завантажити точки. Перевірте з’єднання та спробуйте ще раз.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadPoints();
    }, []);

    useEffect(() => {
        if (selectedPointId === null || details[selectedPointId] || detailErrors[selectedPointId]) return;

        let isCurrent = true;
        void api<PointDetail>(`/points/${selectedPointId}`)
            .then((detail) => {
                if (isCurrent) setDetails((current) => ({ ...current, [selectedPointId]: detail }));
            })
            .catch(() => {
                if (isCurrent) {
                    setDetailErrors((current) => ({
                        ...current,
                        [selectedPointId]: "Не вдалося завантажити опис точки.",
                    }));
                }
            });

        return () => {
            isCurrent = false;
        };
    }, [selectedPointId, details, detailErrors]);

    const visiblePoints = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("uk");
        return points.filter((point) => {
            if (filter !== "all" && point.type !== filter) return false;
            if (!normalizedQuery) return true;
            return [point.title, point.city, point.street]
                .filter((value): value is string => Boolean(value))
                .some((value) => value.toLocaleLowerCase("uk").includes(normalizedQuery));
        });
    }, [filter, points, query]);

    const locateUser = () => {
        setLocationError(null);
        if (!navigator.geolocation) {
            setLocationError("Ваш браузер не підтримує визначення геолокації.");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const center: Coordinates = [position.coords.latitude, position.coords.longitude];
                setUserLocation(center);
                setView({ center, zoom: 13 });
                setIsLocating(false);
            },
            (error) => {
                setLocationError(
                    error.code === error.PERMISSION_DENIED
                        ? "Доступ до геолокації заборонено. Дозвольте його у налаштуваннях браузера."
                        : "Не вдалося визначити ваше місцезнаходження.",
                );
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
        );
    };

    return (
        <main className="bg-secondary py-10 md:py-14">
            <div className="mx-auto w-full max-w-container px-4 md:px-8">
                <header className="mb-7 flex flex-col gap-5 md:mb-8 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-brand-secondary">Eco Guard · карта України</p>
                        <h1 className="mt-2 text-display-sm font-semibold text-primary md:text-display-md">Знайдіть точку поруч</h1>
                        <p className="mt-3 max-w-2xl text-md text-tertiary">
                            Переглядайте пункти прийому вторсировини та повідомлення про екологічні проблеми.
                        </p>
                    </div>
                    <label className="flex w-full flex-col gap-1.5 text-sm font-medium text-secondary md:max-w-sm">
                        Пошук за назвою або містом
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Наприклад, Львів або Чисте місто"
                            className="h-11 rounded-lg bg-primary px-3.5 text-md text-primary shadow-xs ring-1 ring-primary outline-none placeholder:text-placeholder focus:ring-2 focus:ring-brand"
                        />
                    </label>
                </header>

                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Фільтр точок за типом">
                        {filters.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                aria-pressed={filter === item.value}
                                onClick={() => setFilter(item.value)}
                                className={
                                    filter === item.value
                                        ? "rounded-lg bg-brand-solid px-3.5 py-2 text-sm font-semibold text-white shadow-xs"
                                        : "rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-secondary ring-1 ring-primary hover:bg-primary_hover"
                                }
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="text-sm text-tertiary" aria-live="polite">
                            {isLoading ? "Завантаження точок…" : `Знайдено: ${visiblePoints.length}`}
                        </p>
                        <Button color="secondary" size="sm" onClick={locateUser} isDisabled={isLocating}>
                            {isLocating ? "Визначення…" : "Моє місцезнаходження"}
                        </Button>
                    </div>
                </div>

                {locationError && (
                    <p className="mb-4 rounded-xl bg-error-primary p-3 text-sm text-error-primary ring-1 ring-error_subtle" role="alert">
                        {locationError}
                    </p>
                )}
                {loadError && (
                    <div className="mb-4 flex flex-col gap-3 rounded-xl bg-error-primary p-4 text-sm text-error-primary ring-1 ring-error_subtle sm:flex-row sm:items-center sm:justify-between">
                        <p role="alert">{loadError}</p>
                        <Button color="secondary" size="sm" onClick={() => void loadPoints()}>
                            Спробувати ще раз
                        </Button>
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl bg-primary p-2 shadow-xs ring-1 ring-secondary md:p-3">
                    <InteractiveMap
                        points={visiblePoints}
                        details={details}
                        detailErrors={detailErrors}
                        userLocation={userLocation}
                        view={view}
                        onSelectPoint={(point) => setSelectedPointId(point.id)}
                    />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-tertiary">
                    <span className="inline-flex items-center gap-2">
                        <span className="size-3 rounded-full bg-utility-brand-600" aria-hidden="true" />
                        Пункти прийому
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="size-3 rounded-full bg-error-solid" aria-hidden="true" />
                        Екопроблеми
                    </span>
                    <span>Натисніть на позначку, щоб переглянути інформацію про точку.</span>
                </div>
                {filter !== "all" && !isLoading && visiblePoints.length === 0 && (
                    <p className="mt-5 rounded-xl bg-primary p-4 text-sm text-tertiary ring-1 ring-secondary">
                        За заданими умовами точки не знайдено. Спробуйте змінити фільтр або пошуковий запит.
                    </p>
                )}
            </div>
        </main>
    );
}
