import type { ReadinessStatus } from "./readiness-model";
import { formatDateOnly } from "@/lib/presentation/formatters";

const statusStyles: Record<ReadinessStatus, string> = {
  READY: "border-emerald-700/25 bg-emerald-50 text-emerald-900",
  SHORTAGE: "border-rose-700/25 bg-rose-50 text-rose-900",
  UNKNOWN: "border-amber-700/25 bg-amber-50 text-amber-950",
};

export function ReadinessStatusBadge({
  status,
}: {
  readonly status: ReadinessStatus;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-bold tracking-[0.08em] ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export function formatPlannedDate(value: string): string {
  return formatDateOnly(value);
}
