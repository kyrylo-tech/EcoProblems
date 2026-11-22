import type { Metadata } from "next";
import { connection } from "next/server";
import { BusinessScreen } from "@/components/project/business-screen";
import { fetchBackend } from "@/lib/server-api";
import type { Catalog } from "@/lib/types";

export const metadata: Metadata = {
    title: "Для бізнесу",
    description: "Додайте свій пункт прийому вторсировини на карту Eco Guard: адреса, графік роботи, перелік вторсировини й фото.",
};

export default async function BusinessPage() {
    await connection();
    const catalog = await fetchBackend<Catalog>("/catalog");
    return <BusinessScreen catalog={catalog} />;
}
