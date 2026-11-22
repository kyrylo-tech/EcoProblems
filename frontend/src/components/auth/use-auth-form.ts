"use client";

import { type FormEvent, startTransition, useActionState, useState } from "react";
import type { AuthFormState } from "@/lib/auth-actions";

type AuthAction = (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;

/** Wires a login/register Server Action to an Untitled UI form: pending state, form error and per-field errors. */
export function useAuthForm(action: AuthAction) {
    const [state, dispatch, isPending] = useActionState(action, {});
    // Field errors disappear once the user edits the field; reset on every new server response
    const [edited, setEdited] = useState<{ state: AuthFormState; fields: string[] }>({ state, fields: [] });
    const editedFields = edited.state === state ? edited.fields : [];

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        // Dispatching manually instead of <form action>: React resets the form after an action, wiping what the user typed
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => dispatch(formData));
    };

    /** Props for an `Input`: name, invalid state, error (or the default hint) and clearing the error on edit. */
    const field = (name: string, hint?: string) => {
        const error = editedFields.includes(name) ? undefined : state.fieldErrors?.[name];

        return {
            name,
            isInvalid: Boolean(error),
            hint: error ?? hint,
            onChange: () => {
                if (error) setEdited({ state, fields: [...editedFields, name] });
            },
        };
    };

    return { error: state.error, isPending, onSubmit, field };
}
