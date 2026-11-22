"use client";

import type { ReactNode } from "react";
import { AlertCircle, Feather } from "@untitledui/icons";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";

/** Layout of the Untitled UI `log-in-simple` / `sign-up-simple` pages. */

interface AuthShellProps {
    title: string;
    description: string;
    children: ReactNode;
    footer: ReactNode;
}

export const AuthShell = ({ title, description, children, footer }: AuthShellProps) => (
    <section className="relative overflow-hidden bg-primary px-4 py-12 md:px-8 md:pt-24 md:pb-32">
        <div className="mx-auto flex w-full max-w-90 flex-col gap-8">
            <div className="flex flex-col items-center gap-6 text-center">
                <div className="relative">
                    <BackgroundPattern pattern="grid" className="absolute top-1/2 left-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2 md:block" />
                    <BackgroundPattern pattern="grid" size="md" className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 md:hidden" />
                    <FeaturedIcon icon={Feather} size="lg" color="brand" theme="dark" className="relative z-10" />
                </div>

                <div className="relative z-10 flex flex-col gap-2 md:gap-3">
                    <h1 className="text-display-xs font-semibold text-primary md:text-display-sm">{title}</h1>
                    <p className="text-md text-tertiary">{description}</p>
                </div>
            </div>

            <div className="relative z-10 flex flex-col gap-6">{children}</div>

            <div className="relative z-10 flex justify-center gap-1 text-center">{footer}</div>
        </div>
    </section>
);

/** Form-level error (wrong password, backend unavailable). Field errors are shown under the inputs. */
export const AuthFormError = ({ children }: { children?: ReactNode }) => {
    if (!children) return null;

    return (
        <div role="alert" className="flex gap-3 rounded-xl bg-error-primary p-4 ring-1 ring-error_subtle ring-inset">
            <AlertCircle aria-hidden="true" className="size-5 shrink-0 text-fg-error-primary" />
            <p className="text-sm font-medium text-error-primary">{children}</p>
        </div>
    );
};
