"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

interface CoordinatePickerProps {
    latitude: string;
    longitude: string;
    onChange: (latitude: string, longitude: string) => void;
}

const UKRAINE_CENTER: [number, number] = [49.0, 32.0];

function roundCoordinate(value: number): string {
    return value.toFixed(6);
}

function MapClickHandler({ onChange }: { onChange: (latitude: number, longitude: number) => void }) {
    useMapEvents({
        click(event) {
            onChange(event.latlng.lat, event.latlng.lng);
        },
    });
    return null;
}

function MapViewport({ position }: { position: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo(position, Math.max(map.getZoom(), 13), { duration: 0.8 });
    }, [map, position]);

    return null;
}

export function CoordinatePicker({ latitude, longitude, onChange }: CoordinatePickerProps) {
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const parsedLatitude = Number(latitude.trim().replace(",", "."));
    const parsedLongitude = Number(longitude.trim().replace(",", "."));
    const hasValidCoordinates =
        latitude.trim() !== "" &&
        longitude.trim() !== "" &&
        Number.isFinite(parsedLatitude) &&
        Number.isFinite(parsedLongitude) &&
        parsedLatitude >= -90 &&
        parsedLatitude <= 90 &&
        parsedLongitude >= -180 &&
        parsedLongitude <= 180;

    const position: [number, number] = hasValidCoordinates
        ? [parsedLatitude, parsedLongitude]
        : UKRAINE_CENTER;

    const markerIcon = useMemo(
        () =>
            L.divIcon({
                className: "coordinate-marker",
                html: '<div class="coordinate-marker__pin"></div>',
                iconSize: [28, 28],
                iconAnchor: [14, 14],
            }),
        [],
    );

    const handleMapCoordinateChange = (nextLatitude: number, nextLongitude: number) => {
        setLocationError(null);
        onChange(roundCoordinate(nextLatitude), roundCoordinate(nextLongitude));
    };

    const locateUser = () => {
        setLocationError(null);
        if (!navigator.geolocation) {
            setLocationError("Ваш браузер не підтримує визначення геолокації.");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (currentPosition) => {
                setIsLocating(false);
                handleMapCoordinateChange(currentPosition.coords.latitude, currentPosition.coords.longitude);
            },
            (error) => {
                setIsLocating(false);
                setLocationError(
                    error.code === error.PERMISSION_DENIED
                        ? "Доступ до геолокації заборонено. Дозвольте його у налаштуваннях браузера."
                        : "Не вдалося визначити ваше місцезнаходження.",
                );
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
        );
    };

    return (
        <div className="overflow-hidden rounded-xl ring-1 ring-secondary">
            <div className="relative h-72 sm:h-80">
                <MapContainer
                    center={position}
                    zoom={hasValidCoordinates ? 13 : 6}
                    scrollWheelZoom
                    className="h-full w-full"
                    aria-label="Карта для вибору координат"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onChange={handleMapCoordinateChange} />
                    <MapViewport position={position} />
                    <Marker
                        position={position}
                        icon={markerIcon}
                        draggable
                        eventHandlers={{
                            dragend: (event) => {
                                const marker = event.target as L.Marker;
                                const nextPosition = marker.getLatLng();
                                handleMapCoordinateChange(nextPosition.lat, nextPosition.lng);
                            },
                        }}
                    />
                </MapContainer>

                <button
                    type="button"
                    onClick={locateUser}
                    disabled={isLocating}
                    className="absolute top-3 right-3 z-[1000] flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-secondary shadow-sm ring-1 ring-primary hover:bg-primary_hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
                        <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="10" cy="10" r="4.25" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="10" cy="10" r="1.25" fill="currentColor" />
                    </svg>
                    {isLocating ? "Визначення…" : "Моє місцезнаходження"}
                </button>
            </div>
            {locationError && (
                <p className="border-t border-secondary bg-error-primary px-3 py-2 text-sm text-error-primary" role="alert">
                    {locationError}
                </p>
            )}
        </div>
    );
}
