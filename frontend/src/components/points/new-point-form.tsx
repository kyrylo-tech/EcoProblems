"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { NativeSelect } from "@/components/base/select/select-native";
import { RadioButton, RadioGroup } from "@/components/base/radio-buttons/radio-buttons";
import { TextArea } from "@/components/base/textarea/textarea";
import type { Catalog, DayHours, PointType, Weekday, WasteKind } from "@/lib/types";

const MAX_PHOTOS = 10;
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

type WeeklySchedule = Record<Weekday, DayHours | null>;

const initialSchedule: WeeklySchedule = {
    mon: { opens: "09:00", closes: "18:00" },
    tue: { opens: "09:00", closes: "18:00" },
    wed: { opens: "09:00", closes: "18:00" },
    thu: { opens: "09:00", closes: "18:00" },
    fri: { opens: "09:00", closes: "18:00" },
    sat: null,
    sun: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isLabeledOptions(value: unknown): value is { value: string; label: string }[] {
    return Array.isArray(value) && value.every((item) => isRecord(item) && typeof item.value === "string" && typeof item.label === "string");
}

function isCatalog(value: unknown): value is Catalog {
    return (
        isRecord(value) &&
        isLabeledOptions(value.point_types) &&
        Array.isArray(value.weekdays) &&
        value.weekdays.every(
            (day) => isRecord(day) && typeof day.value === "string" && typeof day.label === "string" && typeof day.short_label === "string",
        ) &&
        Array.isArray(value.eco_problem_kinds) &&
        value.eco_problem_kinds.every(
            (kind) =>
                isRecord(kind) &&
                typeof kind.value === "string" &&
                typeof kind.label === "string" &&
                typeof kind.description === "string" &&
                typeof kind.color === "string",
        ) &&
        Array.isArray(value.waste_kinds) &&
        value.waste_kinds.every(
            (kind) =>
                isRecord(kind) &&
                typeof kind.value === "string" &&
                typeof kind.label === "string" &&
                typeof kind.description === "string" &&
                typeof kind.accepted === "string" &&
                typeof kind.not_accepted === "string" &&
                typeof kind.color === "string",
        )
    );
}

function responseErrorMessage(body: unknown): string | null {
    if (typeof body === "string" && body.trim()) return body;
    if (!isRecord(body)) return null;

    const detail = body.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (Array.isArray(detail)) {
        const messages = detail
            .filter(isRecord)
            .map((item) => item.msg)
            .filter((message): message is string => typeof message === "string" && Boolean(message.trim()));
        if (messages.length) return messages.join(". ");
    }

    return null;
}

async function readResponseBody(response: Response): Promise<unknown> {
    if (response.headers.get("content-type")?.includes("application/json")) {
        try {
            return await response.json();
        } catch {
            return null;
        }
    }
    return response.text();
}

function localizedError(error: unknown, fallback: string): string {
    return error instanceof Error && !(error instanceof TypeError) && error.message ? error.message : fallback;
}

async function uploadPhotos(pointId: number, files: File[], token: string): Promise<void> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file, file.name));

    const response = await fetch(`/api/points/${pointId}/photos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    const body = await readResponseBody(response);
    if (!response.ok) {
        throw new Error(responseErrorMessage(body) ?? "Не вдалося завантажити фото. Спробуйте ще раз.");
    }
}

export const NewPointForm = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [catalog, setCatalog] = useState<Catalog | null>(null);
    const [catalogError, setCatalogError] = useState<string | null>(null);
    const [catalogLoadVersion, setCatalogLoadVersion] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [type, setType] = useState<PointType>("eco_problem");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [problemKind, setProblemKind] = useState("");
    const [acceptedWaste, setAcceptedWaste] = useState<WasteKind[]>([]);
    const [isAlwaysOpen, setIsAlwaysOpen] = useState(true);
    const [schedule, setSchedule] = useState<WeeklySchedule>(initialSchedule);
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [pendingPhotoUpload, setPendingPhotoUpload] = useState<{ pointId: number; files: File[] } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRetryingPhotos, setIsRetryingPhotos] = useState(false);

    useEffect(() => {
        setIsAuthenticated(Boolean(localStorage.getItem("access_token")));

        const loadCatalog = async () => {
            setCatalogError(null);
            try {
                const response = await fetch("/api/catalog", { cache: "no-store" });
                const body = await readResponseBody(response);
                if (!response.ok) {
                    throw new Error(responseErrorMessage(body) ?? "Не вдалося завантажити довідники.");
                }
                if (!isCatalog(body)) {
                    throw new Error("Сервер повернув некоректний довідник.");
                }
                setCatalog(body);
            } catch (error) {
                setCatalogError(
                    localizedError(error, "Не вдалося завантажити довідники. Перевірте з’єднання та спробуйте ще раз."),
                );
            }
        };

        void loadCatalog();
    }, [catalogLoadVersion]);

    const handlePhotoSelection = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        event.target.value = "";
        setPhotoError(null);

        if (photos.length + selectedFiles.length > MAX_PHOTOS) {
            setPhotoError(`Можна додати не більше ${MAX_PHOTOS} фото.`);
            return;
        }

        const unsupported = selectedFiles.find((file) => !ACCEPTED_PHOTO_TYPES.includes(file.type));
        if (unsupported) {
            setPhotoError("Дозволені лише фото у форматі JPEG, PNG або WebP.");
            return;
        }

        const oversized = selectedFiles.find((file) => file.size > MAX_PHOTO_SIZE);
        if (oversized) {
            setPhotoError("Розмір одного фото не може перевищувати 10 МБ.");
            return;
        }

        setPhotos((current) => [...current, ...selectedFiles]);
    };

    const toggleWaste = (kind: WasteKind, isSelected: boolean) => {
        setAcceptedWaste((current) =>
            isSelected ? [...current, kind] : current.filter((selectedKind) => selectedKind !== kind),
        );
    };

    const toggleWeekday = (weekday: Weekday, isSelected: boolean) => {
        setSchedule((current) => ({
            ...current,
            [weekday]: isSelected ? current[weekday] ?? { opens: "09:00", closes: "18:00" } : null,
        }));
    };

    const updateDayHours = (weekday: Weekday, field: keyof DayHours, value: string) => {
        setSchedule((current) => ({
            ...current,
            [weekday]: current[weekday] ? { ...current[weekday], [field]: value } : null,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);
        setSuccessMessage(null);

        const token = localStorage.getItem("access_token");
        if (!token) {
            setIsAuthenticated(false);
            setFormError("Щоб додати точку, увійдіть у свій обліковий запис.");
            return;
        }

        if (!catalog) {
            setFormError("Довідники ще завантажуються. Спробуйте надіслати форму трохи пізніше.");
            return;
        }

        const selectedProblemKind = catalog.eco_problem_kinds.find((option) => option.value === problemKind)?.value;
        if (type === "eco_problem" && !selectedProblemKind) {
            setFormError("Оберіть категорію екологічної проблеми.");
            return;
        }
        if (type === "collection" && acceptedWaste.length === 0) {
            setFormError("Оберіть щонайменше один вид вторсировини.");
            return;
        }

        if (title.trim().length < 3 || title.trim().length > 120) {
            setFormError("Назва має містити від 3 до 120 символів.");
            return;
        }

        if (!latitude.trim() || !longitude.trim()) {
            setFormError("Вкажіть широту та довготу точки.");
            return;
        }

        const latitudeValue = Number(latitude);
        const longitudeValue = Number(longitude);
        if (!Number.isFinite(latitudeValue) || latitudeValue < -90 || latitudeValue > 90) {
            setFormError("Широта має бути числом від -90 до 90.");
            return;
        }
        if (!Number.isFinite(longitudeValue) || longitudeValue < -180 || longitudeValue > 180) {
            setFormError("Довгота має бути числом від -180 до 180.");
            return;
        }

        if (type === "collection" && !isAlwaysOpen) {
            const selectedDays = WEEKDAYS.filter((weekday) => schedule[weekday]);
            if (selectedDays.length === 0) {
                setFormError("Оберіть хоча б один робочий день або вкажіть цілодобовий режим.");
                return;
            }
            const hasInvalidHours = selectedDays.some((weekday) => {
                const hours = schedule[weekday];
                return !hours || !hours.opens || !hours.closes || hours.closes <= hours.opens;
            });
            if (hasInvalidHours) {
                setFormError("Для кожного робочого дня час закриття має бути пізніше за час відкриття.");
                return;
            }
        }

        const payload = {
            type,
            title: title.trim(),
            description: description.trim() || null,
            latitude: latitudeValue,
            longitude: longitudeValue,
            ...(type === "eco_problem"
                ? { problem_kind: selectedProblemKind }
                : {
                      accepted_waste: acceptedWaste,
                      schedule: isAlwaysOpen ? null : schedule,
                  }),
        };

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/points", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const body = await readResponseBody(response);
            if (!response.ok) {
                throw new Error(responseErrorMessage(body) ?? "Не вдалося додати точку. Перевірте дані та спробуйте ще раз.");
            }

            const pointId = isRecord(body) && typeof body.id === "number" ? body.id : null;
            if (pointId === null) {
                throw new Error("Точку створено, але сервер не повернув її ідентифікатор. Фото не завантажено.");
            }

            if (photos.length > 0) {
                try {
                    await uploadPhotos(pointId, photos, token);
                } catch (error) {
                    setPendingPhotoUpload({ pointId, files: photos });
                    setFormError(
                        `Точку створено, але фото не завантажено: ${localizedError(
                            error,
                            "не вдалося зв’язатися із сервером. Перевірте з’єднання та спробуйте ще раз.",
                        )}`,
                    );
                    return;
                }
            }

            setSuccessMessage("Точку додано. Дякуємо за внесок! Вона стане доступною після перевірки.");
        } catch (error) {
            setFormError(
                localizedError(error, "Не вдалося зв’язатися із сервером. Перевірте з’єднання та спробуйте ще раз."),
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const retryPhotoUpload = async () => {
        if (!pendingPhotoUpload) return;
        const token = localStorage.getItem("access_token");
        if (!token) {
            setIsAuthenticated(false);
            setFormError("Щоб завантажити фото, увійдіть у свій обліковий запис.");
            return;
        }

        setIsRetryingPhotos(true);
        setFormError(null);
        try {
            await uploadPhotos(pendingPhotoUpload.pointId, pendingPhotoUpload.files, token);
            setPendingPhotoUpload(null);
            setSuccessMessage("Точку додано разом із фото. Дякуємо за внесок! Вона стане доступною після перевірки.");
        } catch (error) {
            setFormError(
                `Точку створено, але фото не завантажено: ${localizedError(
                    error,
                    "не вдалося зв’язатися із сервером. Перевірте з’єднання та спробуйте ще раз.",
                )}`,
            );
        } finally {
            setIsRetryingPhotos(false);
        }
    };

    return (
        <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-8 md:py-16">
            <div className="mb-8">
                <h1 className="text-display-sm font-semibold text-primary">Додати точку</h1>
                <p className="mt-2 text-md text-tertiary">
                    Повідомте про екологічну проблему або додайте пункт прийому вторсировини.
                </p>
            </div>

            {!isAuthenticated && (
                <div className="mb-6 rounded-xl bg-warning-primary p-4 text-sm text-warning-primary ring-1 ring-warning_subtle">
                    Щоб додати точку, потрібно увійти у свій обліковий запис.
                </div>
            )}

            {catalogError && (
                <div className="mb-6 rounded-xl bg-error-primary p-4 text-sm text-error-primary ring-1 ring-error_subtle" role="alert">
                    <p>{catalogError}</p>
                    <Button
                        color="link-destructive"
                        size="sm"
                        className="mt-2"
                        onClick={() => setCatalogLoadVersion((version) => version + 1)}
                    >
                        Спробувати завантажити довідники ще раз
                    </Button>
                </div>
            )}

            {successMessage ? (
                <div className="rounded-xl bg-success-primary p-5 text-sm text-success-primary ring-1 ring-success_subtle" role="status">
                    <p>{successMessage}</p>
                    <Button href="/" color="secondary" size="md" className="mt-4">
                        На головну
                    </Button>
                </div>
            ) : (
                <>
                    {formError && (
                        <div className="mb-6 rounded-xl bg-error-primary p-4 text-sm text-error-primary ring-1 ring-error_subtle" role="alert">
                            <p>{formError}</p>
                            {pendingPhotoUpload && (
                                <Button
                                    color="secondary"
                                    size="sm"
                                    className="mt-3"
                                    isLoading={isRetryingPhotos}
                                    onClick={retryPhotoUpload}
                                >
                                    Повторити завантаження фото
                                </Button>
                            )}
                        </div>
                    )}

                    {pendingPhotoUpload ? null : catalog ? (
                        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
                            <section className="flex flex-col gap-5 rounded-2xl bg-primary p-5 shadow-xs ring-1 ring-secondary md:p-8">
                                <h2 className="text-lg font-semibold text-primary">Основна інформація</h2>
                                <NativeSelect
                                    label="Тип точки"
                                    value={type}
                                    onChange={(event) => {
                                        const selectedType = catalog.point_types.find((option) => option.value === event.target.value);
                                        if (selectedType) setType(selectedType.value);
                                        setFormError(null);
                                    }}
                                    options={catalog.point_types}
                                />
                                <Input
                                    label="Назва"
                                    value={title}
                                    onChange={setTitle}
                                    minLength={3}
                                    maxLength={120}
                                    isRequired
                                    placeholder="Наприклад, стихійне сміттєзвалище"
                                />
                                <TextArea
                                    label="Опис"
                                    value={description}
                                    onChange={setDescription}
                                    maxLength={2000}
                                    rows={4}
                                    placeholder="Додайте деталі, які допоможуть іншим зрозуміти ситуацію"
                                />
                                <div className="grid gap-5 md:grid-cols-2">
                                    <Input
                                        label="Широта"
                                        type="number"
                                        value={latitude}
                                        onChange={setLatitude}
                                        isRequired
                                        placeholder="50.4501"
                                    />
                                    <Input
                                        label="Довгота"
                                        type="number"
                                        value={longitude}
                                        onChange={setLongitude}
                                        isRequired
                                        placeholder="30.5234"
                                    />
                                </div>
                                <p className="text-sm text-tertiary">
                                    Місто й вулицю буде визначено автоматично за координатами.
                                </p>
                            </section>

                            {type === "eco_problem" ? (
                                <section className="flex flex-col gap-5 rounded-2xl bg-primary p-5 shadow-xs ring-1 ring-secondary md:p-8">
                                    <h2 className="text-lg font-semibold text-primary">Категорія проблеми</h2>
                                    <NativeSelect
                                        label="Вид екологічної проблеми"
                                        value={problemKind}
                                        onChange={(event) => setProblemKind(event.target.value)}
                                        options={[
                                            { value: "", label: "Оберіть категорію" },
                                            ...catalog.eco_problem_kinds,
                                        ]}
                                        required
                                    />
                                </section>
                            ) : (
                                <>
                                    <section className="flex flex-col gap-5 rounded-2xl bg-primary p-5 shadow-xs ring-1 ring-secondary md:p-8">
                                        <div>
                                            <h2 className="text-lg font-semibold text-primary">Що приймає пункт</h2>
                                            <p className="mt-1 text-sm text-tertiary">Оберіть усі відповідні види вторсировини.</p>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {catalog.waste_kinds.map((kind) => (
                                                <Checkbox
                                                    key={kind.value}
                                                    label={kind.label}
                                                    hint={kind.description}
                                                    isSelected={acceptedWaste.includes(kind.value)}
                                                    onChange={(isSelected) => toggleWaste(kind.value, isSelected)}
                                                />
                                            ))}
                                        </div>
                                    </section>

                                    <section className="flex flex-col gap-5 rounded-2xl bg-primary p-5 shadow-xs ring-1 ring-secondary md:p-8">
                                        <div>
                                            <h2 className="text-lg font-semibold text-primary">Графік роботи</h2>
                                            <p className="mt-1 text-sm text-tertiary">Вкажіть години роботи або позначте пункт як цілодобовий.</p>
                                        </div>
                                        <RadioGroup
                                            aria-label="Режим роботи"
                                            value={isAlwaysOpen ? "always" : "schedule"}
                                            onChange={(value) => setIsAlwaysOpen(value === "always")}
                                            className="gap-3"
                                        >
                                            <RadioButton value="always" label="Працює цілодобово" />
                                            <RadioButton value="schedule" label="Працює за графіком" />
                                        </RadioGroup>
                                        {!isAlwaysOpen && (
                                            <div className="flex flex-col gap-4">
                                                {catalog.weekdays.map((day) => {
                                                    const hours = schedule[day.value];
                                                    return (
                                                        <div key={day.value} className="grid gap-3 sm:grid-cols-[minmax(9rem,1fr)_1fr_1fr] sm:items-end">
                                                            <Checkbox
                                                                label={day.label}
                                                                isSelected={Boolean(hours)}
                                                                onChange={(isSelected) => toggleWeekday(day.value, isSelected)}
                                                            />
                                                            {hours && (
                                                                <>
                                                                    <Input
                                                                        label="Відчиняється"
                                                                        type="time"
                                                                        value={hours.opens}
                                                                        onChange={(value) => updateDayHours(day.value, "opens", value)}
                                                                        isRequired
                                                                    />
                                                                    <Input
                                                                        label="Зачиняється"
                                                                        type="time"
                                                                        value={hours.closes}
                                                                        onChange={(value) => updateDayHours(day.value, "closes", value)}
                                                                        isRequired
                                                                    />
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </section>
                                </>
                            )}

                            <section className="flex flex-col gap-4 rounded-2xl bg-primary p-5 shadow-xs ring-1 ring-secondary md:p-8">
                                <div>
                                    <h2 className="text-lg font-semibold text-primary">Фото</h2>
                                    <p className="mt-1 text-sm text-tertiary">
                                        До {MAX_PHOTOS} фото у форматі JPEG, PNG або WebP, до 10 МБ кожне.
                                    </p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={ACCEPTED_PHOTO_TYPES.join(",")}
                                    multiple
                                    onChange={handlePhotoSelection}
                                    aria-label="Завантажити фото"
                                    className="block w-full rounded-lg bg-primary text-sm text-secondary file:mr-4 file:rounded-lg file:border-0 file:bg-secondary file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-secondary hover:file:bg-secondary_hover"
                                />
                                {photoError && <p className="text-sm text-error-primary" role="alert">{photoError}</p>}
                                {photos.length > 0 && (
                                    <ul className="flex flex-col gap-2">
                                        {photos.map((photo, index) => (
                                            <li key={`${photo.name}-${photo.lastModified}-${index}`} className="flex items-center justify-between gap-3 text-sm text-secondary">
                                                <span className="min-w-0 truncate">{photo.name}</span>
                                                <Button
                                                    color="link-destructive"
                                                    size="sm"
                                                    onClick={() => setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))}
                                                >
                                                    Видалити
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <Button href="/" color="secondary" size="md">Скасувати</Button>
                                <Button type="submit" size="md" isLoading={isSubmitting} isDisabled={!isAuthenticated || !catalog}>
                                    Додати точку
                                </Button>
                            </div>
                        </form>
                    ) : null}
                </>
            )}
        </section>
    );
};
