import type { Metadata } from "next";
import { connection } from "next/server";
import { AboutScreen } from "@/components/project/about-screen";
import { fetchBackend } from "@/lib/server-api";
import type { Stats } from "@/lib/types";

export const metadata: Metadata = {
    title: "Про проєкт",
    description: "Eco Guard — карта пунктів прийому вторсировини та екологічних проблем України, яку наповнюють люди й перевіряють модератори.",
};

export default async function AboutPage() {
    await connection(); // live numbers from the backend, not from build time
    const stats = await fetchBackend<Stats>("/stats");
    return <AboutScreen stats={stats} />;
}
