"use client";

import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Form } from "@/components/base/form/form";
import { Input } from "@/components/base/input/input";
import { login } from "@/lib/auth-actions";
import { AuthFormError, AuthShell } from "./auth-shell";
import { useAuthForm } from "./use-auth-form";

export const LoginForm = ({ redirectTo }: { redirectTo: string }) => {
    const { error, isPending, onSubmit, field } = useAuthForm(login);
    const registerHref = redirectTo === "/" ? "/register" : `/register?next=${encodeURIComponent(redirectTo)}`;

    return (
        <AuthShell
            title="Увійдіть в акаунт"
            description="Раді бачити вас знову! Введіть свої дані."
            footer={
                <>
                    <span className="text-sm text-tertiary">Ще немає акаунта?</span>
                    <Button href={registerHref} color="link-color" size="md">
                        Зареєструватися
                    </Button>
                </>
            }
        >
            <AuthFormError>{error}</AuthFormError>

            <Form validationBehavior="aria" onSubmit={onSubmit} className="flex flex-col gap-6">
                <input type="hidden" name="next" value={redirectTo} />

                <div className="flex flex-col gap-5">
                    <Input
                        {...field("email")}
                        isRequired
                        hideRequiredIndicator
                        autoFocus
                        label="Пошта"
                        type="email"
                        autoComplete="email"
                        placeholder="olena@example.com"
                    />
                    <Input {...field("password")} isRequired hideRequiredIndicator label="Пароль" type="password" autoComplete="current-password" placeholder="••••••••" />
                </div>

                <Checkbox name="remember" defaultSelected label="Запам'ятати мене" />

                <Button type="submit" size="lg" isLoading={isPending}>
                    Увійти
                </Button>
            </Form>
        </AuthShell>
    );
};
