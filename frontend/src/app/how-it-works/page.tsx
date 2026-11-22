import type { Metadata } from "next";
import { connection } from "next/server";
import { HowItWorksScreen } from "@/components/project/how-it-works-screen";
import { fetchBackend } from "@/lib/server-api";
import type { Catalog } from "@/lib/types";

export const metadata: Metadata = {
    title: "Як це працює",
    description: "Як знайти пункт прийому, підготувати вторсировину та додати на карту пункт чи екологічну проблему.",
};

export default async function HowItWorksPage() {
    await connection();
    const catalog = await fetchBackend<Catalog>("/catalog");
    return <HowItWorksScreen catalog={catalog} />;
}
