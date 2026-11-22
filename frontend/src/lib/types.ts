/** Mirrors backend/app/schemas — keep in sync with /api/docs. */

export type PointType = "eco_problem" | "collection";
export type PointStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "admin";
export type WasteKind = "plastic" | "glass" | "paper" | "metal" | "batteries" | "textile";
export type EcoProblemKind =
    | "illegal_dump"
    | "overflowing_bins"
    | "waste_burning"
    | "water_pollution"
    | "air_pollution"
    | "soil_contamination"
    | "illegal_logging"
    | "greenery_damage"
    | "hazardous_waste"
    | "other";
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: UserRole;
    created_at: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: "bearer";
    user: User;
}

export interface Page<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
}

export interface Option<T extends string> {
    value: T;
    label: string;
}

export interface WasteKindOption extends Option<WasteKind> {
    description: string;
    accepted: string;
    not_accepted: string;
    color: string;
}

export interface EcoProblemKindOption extends Option<EcoProblemKind> {
    description: string;
    color: string;
}

export interface Catalog {
    user_roles: Option<UserRole>[];
    point_types: Option<PointType>[];
    point_statuses: Option<PointStatus>[];
    weekdays: (Option<Weekday> & { short_label: string })[];
    eco_problem_kinds: EcoProblemKindOption[];
    waste_kinds: WasteKindOption[];
    preparation_tips: string[];
}

export interface Stats {
    collection_points: number;
    eco_problems: number;
    cities: number;
    waste_kinds: number;
}

export interface DayHours {
    opens: string;
    closes: string;
}

/** null — no restrictions (24/7); a null day — day off. */
export type Schedule = Record<Weekday, DayHours | null> | null;

export interface PointSummary {
    id: number;
    type: PointType;
    title: string;
    latitude: number;
    longitude: number;
    city: string | null;
    street: string | null;
    problem_kind: EcoProblemKind | null;
    accepted_waste: WasteKind[];
    schedule: Schedule;
    cover_photo_url: string | null;
    created_at: string;
    distance_km: number | null;
}
