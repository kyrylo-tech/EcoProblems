"use client";

import { Moon01, Sun } from "@untitledui/icons";
import { useTheme } from "next-themes";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { cx } from "@/utils/cx";

/**
 * Light / dark switch built on Untitled UI `ButtonUtility`.
 * Both buttons are rendered and swapped with the `dark:` variant, so SSR markup never depends on the theme.
 */
export const ThemeToggle = ({ size = "sm", className }: { size?: "xs" | "sm"; className?: string }) => {
    const { resolvedTheme, setTheme } = useTheme();
    const toggle = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

    return (
        <span className={cx("inline-flex", className)}>
            <ButtonUtility color="tertiary" size={size} icon={Moon01} tooltip="Темна тема" tooltipPlacement="bottom" onClick={toggle} className="dark:hidden" />
            <ButtonUtility
                color="tertiary"
                size={size}
                icon={Sun}
                tooltip="Світла тема"
                tooltipPlacement="bottom"
                onClick={toggle}
                className="hidden dark:inline-flex"
            />
        </span>
    );
};
