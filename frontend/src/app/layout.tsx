import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RouteProvider } from "@/providers/router-provider";
import { Theme } from "@/providers/theme";
import "@/styles/globals.css";
import { cx } from "@/utils/cx";

const inter = Inter({
    subsets: ["latin", "cyrillic"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: {
        default: "Eco Guard — карта пунктів прийому вторсировини",
        template: "%s · Eco Guard",
    },
    description:
        "Пункти прийому пластику, скла, паперу, металу та батарейок на одній карті: з адресами, графіком і типами вторсировини. Повідомляйте про екологічні проблеми поруч.",
};

export const viewport: Viewport = {
    themeColor: "#15342b",
    colorScheme: "light dark",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="uk" suppressHydrationWarning>
            <body className={cx(inter.variable, "bg-secondary antialiased")}>
                <RouteProvider>
                    <Theme>
                        <div className="flex min-h-dvh flex-col">
                            <SiteHeader />
                            <main className="flex-1">{children}</main>
                            <SiteFooter />
                        </div>
                    </Theme>
                </RouteProvider>
            </body>
        </html>
    );
}
