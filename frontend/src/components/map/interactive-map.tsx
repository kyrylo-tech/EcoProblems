"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { formatAddress } from "@/lib/format";
import type { PointDetail, PointSummary } from "@/lib/types";

type Coordinates = [number, number];

interface InteractiveMapProps {
    points: PointSummary[];
    details: Record<number, PointDetail>;
    detailErrors: Record<number, string>;
    userLocation: Coordinates | null;
    view: { center: Coordinates; zoom: number };
    onSelectPoint: (point: PointSummary) => void;
}

function MapViewController({ view }: { view: { center: Coordinates; zoom: number } }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo(view.center, view.zoom, { duration: 0.8 });
    }, [map, view]);

    return null;
}

export function InteractiveMap({
    points,
    details,
    detailErrors,
    userLocation,
    view,
    onSelectPoint,
}: InteractiveMapProps) {
    const collectionIcon = useMemo(
        () =>
            L.divIcon({
                className: "point-map-marker",
                html: '<span class="point-map-marker__dot point-map-marker__dot--collection"></span>',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            }),
        [],
    );
    const problemIcon = useMemo(
        () =>
            L.divIcon({
                className: "point-map-marker",
                html: '<span class="point-map-marker__dot point-map-marker__dot--problem"></span>',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            }),
        [],
    );
    const userIcon = useMemo(
        () =>
            L.divIcon({
                className: "point-map-marker",
                html: '<span class="point-map-marker__dot point-map-marker__dot--user"></span>',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            }),
        [],
    );

    return (
        <MapContainer
            center={view.center}
            zoom={view.zoom}
            minZoom={5}
            maxZoom={18}
            scrollWheelZoom
            className="h-[min(70vh,720px)] min-h-100 w-full rounded-xl"
            aria-label="Інтерактивна карта точок України"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapViewController view={view} />
            {userLocation && (
                <Marker position={userLocation} icon={userIcon} keyboard={false} interactive={false} />
            )}
            {points.map((point) => {
                const detail = details[point.id];
                const address = formatAddress(point.street, point.city) || "Адресу не вказано";
                const imageUrl = detail?.photos[0]?.url ?? point.cover_photo_url;
                return (
                    <Marker
                        key={point.id}
                        position={[point.latitude, point.longitude]}
                        icon={point.type === "collection" ? collectionIcon : problemIcon}
                        eventHandlers={{ click: () => onSelectPoint(point) }}
                    >
                        <Popup className="point-map-popup" minWidth={220} maxWidth={280}>
                            <article className="flex flex-col gap-2">
                                {imageUrl && (
                                    <img
                                        src={imageUrl}
                                        alt={`Фото: ${point.title}`}
                                        className="h-32 w-full rounded-lg object-cover"
                                        loading="lazy"
                                    />
                                )}
                                <div>
                                    <p className="font-semibold text-primary">{point.title}</p>
                                    <p className="mt-0.5 text-sm text-tertiary">{address}</p>
                                    <p className="mt-2 text-sm leading-5 text-secondary">
                                        {detail
                                            ? detail.description || "Опис не додано."
                                            : detailErrors[point.id] ?? "Завантаження опису…"}
                                    </p>
                                </div>
                                <a
                                    href={`/points/${point.id}`}
                                    className="text-sm font-semibold text-brand-secondary underline-offset-2 hover:underline"
                                >
                                    Переглянути точку
                                </a>
                            </article>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
