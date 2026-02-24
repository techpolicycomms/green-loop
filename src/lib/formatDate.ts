/**
 * Date formatting with fixed locale to avoid hydration mismatch.
 * Server and client can differ on toLocaleDateString() when using undefined locale.
 * Using 'en-GB' ensures consistent output for SSR.
 */
const LOCALE = "en-GB";

export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  try {
    return new Date(dateStr).toLocaleDateString(LOCALE, options ?? { dateStyle: "medium" });
  } catch {
    return dateStr;
  }
}

export function formatDateLong(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(LOCALE, { dateStyle: "long" });
  } catch {
    return dateStr;
  }
}

export function formatEventDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString(LOCALE, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString(LOCALE, { dateStyle: "short", timeStyle: "short" });
  } catch {
    return dateStr;
  }
}

export function formatDateOrDash(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString(LOCALE, { dateStyle: "medium" });
  } catch {
    return dateStr;
  }
}
