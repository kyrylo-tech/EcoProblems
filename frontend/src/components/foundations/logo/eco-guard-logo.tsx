"use client";

import type { HTMLAttributes } from "react";
import { Feather } from "@untitledui/icons";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { cx } from "@/utils/cx";

/** Eco Guard logo built from Untitled UI primitives: a brand featured icon + wordmark. */
export const EcoGuardLogo = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
    <span className={cx("inline-flex items-center gap-2.5", className)} {...props}>
        <FeaturedIcon icon={Feather} size="sm" color="brand" theme="dark" />
        <span className="text-lg font-semibold text-primary">Eco Guard</span>
    </span>
);
