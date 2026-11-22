import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/current-user";
import { safeRedirectPath } from "@/lib/session";

export const metadata: Metadata = { title: "Реєстрація" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
    const redirectTo = safeRedirectPath((await searchParams).next);
    if (await getCurrentUser()) redirect(redirectTo);

    return <RegisterForm redirectTo={redirectTo} />;
}
