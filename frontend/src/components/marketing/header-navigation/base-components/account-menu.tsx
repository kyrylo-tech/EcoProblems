"use client";

import { useTransition } from "react";
import { LogOut01 } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { Avatar } from "@/components/base/avatar/avatar";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { logout } from "@/lib/auth-actions";
import type { User } from "@/lib/types";
import { cx } from "@/utils/cx";

const fullName = (user: User) => `${user.first_name} ${user.last_name}`;
const initials = (user: User) => `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();

const AccountLabel = ({ user }: { user: User }) => (
    <AvatarLabelGroup
        size="md"
        initials={initials(user)}
        title={
            <span className="flex items-center gap-1.5">
                <span className="truncate">{fullName(user)}</span>
                {user.role === "admin" && (
                    <Badge size="sm" color="brand" type="pill-color">
                        Адмін
                    </Badge>
                )}
            </span>
        }
        subtitle={user.email}
    />
);

/** Desktop: avatar that opens the account dropdown (Untitled UI `dropdown-avatar`). */
export const AccountMenu = ({ user }: { user: User }) => {
    const [, startTransition] = useTransition();

    return (
        <Dropdown.Root>
            <AriaButton
                aria-label={`Акаунт: ${fullName(user)}`}
                className={({ isPressed, isFocusVisible }) =>
                    cx("group relative inline-flex cursor-pointer rounded-full outline-offset-2 outline-focus-ring", (isPressed || isFocusVisible) && "outline-2")
                }
            >
                <Avatar size="sm" initials={initials(user)} alt={fullName(user)} />
            </AriaButton>

            <Dropdown.Popover className="w-64">
                <div className="flex gap-3 border-b border-secondary p-3">
                    <AccountLabel user={user} />
                </div>
                <Dropdown.Menu aria-label="Меню акаунта">
                    <Dropdown.Item id="logout" icon={LogOut01} onAction={() => startTransition(() => logout())}>
                        Вийти
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown.Root>
    );
};

/** Mobile menu footer: who is signed in and a sign-out button. */
export const MobileAccount = ({ user }: { user: User }) => {
    const [isPending, startTransition] = useTransition();

    return (
        <div className="flex flex-col gap-4">
            <AccountLabel user={user} />
            <Button color="secondary" size="md" iconLeading={LogOut01} isLoading={isPending} onPress={() => startTransition(() => logout())}>
                Вийти
            </Button>
        </div>
    );
};
