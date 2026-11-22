import type { HTMLAttributes } from "react";
import { cx } from "@/utils/cx";

export const EcoGuardMark = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cx("size-6 text-fg-brand-primary", className)}>
        <path
            d="M5 19c0-8.5 5.5-14 15-14 0 9.5-5.5 15-15 14Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path d="M5 19 13.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export const EcoGuardLogo = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
    <span className={cx("inline-flex items-center gap-2", className)} {...props}>
        <EcoGuardMark />
        <span className="text-lg font-bold tracking-tight text-primary">Eco Guard</span>
    </span>
);
