"use client";

import { Button } from "@/components/base/buttons/button";
import { Form } from "@/components/base/form/form";
import { Input } from "@/components/base/input/input";
import { register } from "@/lib/auth-actions";
import { AuthFormError, AuthShell } from "./auth-shell";
import { useAuthForm } from "./use-auth-form";

export const RegisterForm = ({ redirectTo }: { redirectTo: string }) => {
    const { error, isPending, onSubmit, field } = useAuthForm(register);
    const loginHref = redirectTo === "/" ? "/login" : `/login?next=${encodeURIComponent(redirectTo)}`;

    return (
        <AuthShell
            title="Створіть акаунт"
            description="Додавайте точки на карту та повідомляйте про екопроблеми поруч."
            footer={
                <>
                    <span className="text-sm text-tertiary">Вже маєте акаунт?</span>
                    <Button href={loginHref} color="link-color" size="md">
                        Увійти
                    </Button>
                </>
            }
        >
            <AuthFormError>{error}</AuthFormError>

            <Form validationBehavior="aria" onSubmit={onSubmit} className="flex flex-col gap-6">
                <input type="hidden" name="next" value={redirectTo} />

                <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Input
                            {...field("first_name")}
                            isRequired
                            hideRequiredIndicator
                            autoFocus
                            label="Ім'я"
                            autoComplete="given-name"
                            maxLength={100}
                            placeholder="Олена"
                        />
                        <Input
                            {...field("last_name")}
                            isRequired
                            hideRequiredIndicator
                            label="Прізвище"
                            autoComplete="family-name"
                            maxLength={100}
                            placeholder="Коваленко"
                        />
                    </div>
                    <Input {...field("email")} isRequired hideRequiredIndicator label="Пошта" type="email" autoComplete="email" placeholder="olena@example.com" />
                    <Input
                        {...field("password", "Мінімум 8 символів")}
                        isRequired
                        hideRequiredIndicator
                        label="Пароль"
                        type="password"
                        autoComplete="new-password"
                        maxLength={128}
                        placeholder="••••••••"
                    />
                </div>

                <Button type="submit" size="lg" isLoading={isPending}>
                    Зареєструватися
                </Button>
            </Form>
        </AuthShell>
    );
};
