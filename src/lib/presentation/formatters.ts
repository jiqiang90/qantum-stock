const numberFormatter = new Intl.NumberFormat("en-NZ", {
  maximumFractionDigits: 3,
});

const dateOnlyFormatter = new Intl.DateTimeFormat("en-NZ", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const timestampFormatter = new Intl.DateTimeFormat("en-NZ", {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  timeZone: "Pacific/Auckland",
  timeZoneName: "short",
  year: "numeric",
});

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatQuantity(
  value: number | null,
  unit: string | null,
): string {
  if (value === null || unit === null) {
    return "Unknown";
  }

  return `${formatNumber(value)} ${unit}`;
}

export function formatDateOnly(value: string): string {
  return dateOnlyFormatter.format(new Date(`${value}T00:00:00Z`));
}

export function formatTimestamp(value: string | null): string {
  return value === null
    ? "Unknown"
    : timestampFormatter.format(new Date(value));
}
