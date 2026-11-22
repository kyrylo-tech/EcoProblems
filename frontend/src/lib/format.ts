/** Ukrainian plural form: plural(21, ["пункт", "пункти", "пунктів"]) → "пункт". */
export function plural(n: number, [one, few, many]: readonly [string, string, string]): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
}

export function formatAddress(street: string | null, city: string | null): string {
    return [street, city].filter(Boolean).join(", ");
}

export function directionsUrl(latitude: number, longitude: number): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}
