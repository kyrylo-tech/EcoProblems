"use client";

import type { KeyboardEvent } from "react";
import type { PointSummary } from "@/lib/types";
import { cx } from "@/utils/cx";

// Simplified state border of Ukraine (lon, lat), clockwise from the Polish–Belarusian tripoint.
// Illustration only — good enough to place real points on.
const BORDER: [number, number][] = [
    [23.63, 51.52], [24.38, 51.88], [25.27, 51.96], [26.17, 51.85], [27.2, 51.65], [28.24, 51.57], [28.76, 51.43],
    [29.25, 51.37], [29.74, 51.47], [30.16, 51.42], [30.55, 51.25], [30.62, 51.7], [30.93, 52.07], [31.78, 52.1],
    [32.16, 52.07], [32.41, 52.29], [33.2, 52.36], [33.8, 52.03], [34.1, 51.65], [34.38, 51.24], [35.1, 51.21],
    [35.37, 50.78], [35.7, 50.36], [36.3, 50.3], [36.62, 50.23], [37.42, 50.38], [38.03, 49.92], [38.68, 49.98],
    [39.18, 49.85], [39.78, 49.57], [40.18, 49.55], [40.08, 49.05], [39.68, 48.78], [39.9, 48.3], [39.75, 47.83],
    [38.8, 47.83], [38.25, 47.55], [38.22, 47.1], [37.55, 47.07], [36.8, 46.7], [35.8, 46.6], [35.2, 46.3],
    [34.82, 46.17], [35.05, 45.85], [35.35, 45.45], [35.95, 45.45], [36.62, 45.4], [36.45, 45.1], [35.8, 45.08],
    [35.4, 45.02], [35.05, 44.85], [34.45, 44.62], [34.15, 44.45], [33.75, 44.4], [33.5, 44.55], [33.55, 44.95],
    [33.38, 45.18], [32.8, 45.35], [32.5, 45.38], [32.75, 45.55], [33.25, 45.8], [33.62, 46.1], [33.2, 46.12],
    [32.6, 46.08], [31.95, 46.32], [31.55, 46.58], [31.05, 46.6], [30.75, 46.47], [30.4, 46.15], [30.15, 45.85],
    [29.7, 45.6], [29.72, 45.25], [29.2, 45.38], [28.8, 45.3], [28.25, 45.48], [28.55, 45.8], [28.95, 46.1],
    [29.05, 46.45], [29.6, 46.42], [30.12, 46.42], [29.95, 46.75], [29.7, 47.15], [29.55, 47.35], [29.2, 47.55],
    [29.2, 47.95], [28.8, 48.12], [28.25, 48.2], [27.75, 48.45], [27.25, 48.38], [26.65, 48.27], [26.2, 48.0],
    [25.55, 47.93], [25.1, 47.75], [24.65, 47.95], [24.05, 47.95], [23.45, 48.0], [22.9, 47.98], [22.6, 48.12],
    [22.15, 48.4], [22.55, 49.05], [22.7, 49.4], [22.65, 49.55], [23.25, 50.05], [23.7, 50.38], [24.1, 50.85],
];

const LON_MIN = 22.0;
const LON_MAX = 40.4;
const LAT_MIN = 44.2;
const LAT_MAX = 52.5;
const K = Math.cos((((LAT_MIN + LAT_MAX) / 2) * Math.PI) / 180); // equirectangular aspect correction
const WIDTH = 600;
const SCALE = WIDTH / ((LON_MAX - LON_MIN) * K);
const HEIGHT = Math.round((LAT_MAX - LAT_MIN) * SCALE);

const project = (lon: number, lat: number): [number, number] => [(lon - LON_MIN) * K * SCALE, (LAT_MAX - lat) * SCALE];

const BORDER_PATH = `M${BORDER.map(([lon, lat]) => project(lon, lat).map((v) => v.toFixed(1)).join(",")).join("L")}Z`;

interface UkraineMapProps {
    points: PointSummary[];
    colorOf: (point: PointSummary) => string;
    activeId: number | null;
    onSelect: (point: PointSummary) => void;
    className?: string;
}

export const UkraineMap = ({ points, colorOf, activeId, onSelect, className }: UkraineMapProps) => {
    const handleKey = (event: KeyboardEvent, point: PointSummary) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(point);
        }
    };

    // Render the active point last so its ring stays on top
    const ordered = [...points].sort((a, b) => Number(a.id === activeId) - Number(b.id === activeId));

    return (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={cx("h-auto w-full", className)} role="group" aria-label="Карта України з пунктами">
            <path d={BORDER_PATH} className="fill-map-land stroke-map-border" strokeWidth={1.5} strokeLinejoin="round" />

            {ordered.map((point) => {
                const [x, y] = project(point.longitude, point.latitude);
                const isActive = point.id === activeId;
                return (
                    <g
                        key={point.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`${point.title}${point.city ? `, ${point.city}` : ""}`}
                        aria-pressed={isActive}
                        onClick={() => onSelect(point)}
                        onKeyDown={(event) => handleKey(event, point)}
                        className="group cursor-pointer outline-none"
                    >
                        <circle
                            cx={x}
                            cy={y}
                            r={13}
                            fill="none"
                            strokeWidth={2}
                            className={cx(
                                "stroke-fg-brand-primary transition duration-100 ease-linear",
                                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50 group-focus-visible:opacity-100",
                            )}
                        />
                        <circle cx={x} cy={y} r={7.5} fill={colorOf(point)} strokeWidth={2.5} className="stroke-bg-primary" />
                    </g>
                );
            })}
        </svg>
    );
};
