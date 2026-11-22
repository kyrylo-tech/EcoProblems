import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/current-user";
import { safeRedirectPath } from "@/lib/session";

export const metadata: Metadata = { title: "Вхід" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
    const redirectTo = safeRedirectPath((await searchParams).next);
    if (await getCurrentUser()) redirect(redirectTo);

    return <LoginForm redirectTo={redirectTo} />;
}
