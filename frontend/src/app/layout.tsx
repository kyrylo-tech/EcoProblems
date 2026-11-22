import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { FooterLarge02 } from "@/components/marketing/footers/footer-large-02";
import { Header } from "@/components/marketing/header-navigation/header";
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
    themeColor: "#099250",
    colorScheme: "light dark",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="uk" suppressHydrationWarning>
            <body className={cx(inter.variable, "bg-primary antialiased")}>
                <RouteProvider>
                    <Theme>
                        <div className="flex min-h-dvh flex-col">
                            <Header />
                            <main className="flex-1">{children}</main>
                            <FooterLarge02 />
                        </div>
                    </Theme>
                </RouteProvider>
            </body>
        </html>
    );
}
