"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BACKEND_URL } from "@/lib/server-api";
import { SESSION_COOKIE, safeRedirectPath, tokenExpiresAt } from "@/lib/session";
import type { TokenResponse } from "@/lib/types";

export interface AuthFormState {
    /** Error not tied to a single field: wrong password, backend is down, etc. */
    error?: string;
    /** Field name → message (FastAPI 422 details and our own checks). */
    fieldErrors?: Partial<Record<string, string>>;
}

type ValidationDetail = { loc?: (string | number)[]; msg?: string };

const REQUIRED = "Обов'язкове поле";

function readFields<const K extends string>(formData: FormData, names: readonly K[]): Record<K, string> {
    const values = {} as Record<K, string>;
    for (const name of names) {
        const raw = formData.get(name);
        // Passwords are sent as typed; everything else is trimmed
        values[name] = typeof raw !== "string" ? "" : name === "password" ? raw : raw.trim();
    }
    return values;
}

function missingFields(values: Record<string, string>): AuthFormState | null {
    const fieldErrors: Record<string, string> = {};
    for (const [name, value] of Object.entries(values)) if (!value) fieldErrors[name] = REQUIRED;
    return Object.keys(fieldErrors).length > 0 ? { fieldErrors } : null;
}

function toFormState(status: number, body: unknown, fields: readonly string[]): AuthFormState {
    const detail = (body as { detail?: unknown } | null)?.detail;

    if (Array.isArray(detail)) {
        const fieldErrors: Record<string, string> = {};
        for (const { loc, msg } of detail as ValidationDetail[]) {
            const field = loc?.[loc.length - 1];
            if (typeof field === "string" && fields.includes(field) && msg && !fieldErrors[field]) fieldErrors[field] = msg;
        }
        if (Object.keys(fieldErrors).length > 0) return { fieldErrors };
        return { error: "Перевірте правильність введених даних" };
    }

    if (status === 409 && typeof detail === "string") return { fieldErrors: { email: detail } };
    if (typeof detail === "string") return { error: detail };
    return { error: "Щось пішло не так. Спробуйте ще раз." };
}

/** Calls FastAPI and stores the JWT in an httpOnly cookie. Returns form errors, or null on success. */
async function authenticate(path: "/auth/login" | "/auth/register", payload: Record<string, string>, remember: boolean): Promise<AuthFormState | null> {
    let res: Response;
    try {
        res = await fetch(`${BACKEND_URL}/api${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            cache: "no-store",
        });
    } catch {
        return { error: "Сервер недоступний. Спробуйте трохи пізніше." };
    }

    const body: unknown = await res.json().catch(() => null);
    if (!res.ok) return toFormState(res.status, body, Object.keys(payload));

    const token = (body as TokenResponse).access_token;
    (await cookies()).set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        // Without "remember me" it is a session cookie: gone when the browser is closed
        expires: remember ? (tokenExpiresAt(token) ?? undefined) : undefined,
    });
    return null;
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const values = readFields(formData, ["email", "password"]);
    const failure = missingFields(values) ?? (await authenticate("/auth/login", values, formData.get("remember") === "on"));
    if (failure) return failure;

    redirect(safeRedirectPath(formData.get("next")));
}

export async function register(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const values = readFields(formData, ["first_name", "last_name", "email", "password"]);
    const failure = missingFields(values) ?? (await authenticate("/auth/register", values, true));
    if (failure) return failure;

    redirect(safeRedirectPath(formData.get("next")));
}

/** JWTs are stateless on the backend, so signing out is just dropping the cookie. */
export async function logout(): Promise<void> {
    (await cookies()).delete(SESSION_COOKIE);
    redirect("/");
}
