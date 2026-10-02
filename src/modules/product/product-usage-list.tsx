import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { formatDateOnly, formatQuantity } from "@/lib/presentation/formatters";
import type { ProductUsageEvidence } from "./product-model";

export function ProductUsageList({
  usages,
  unit,
}: {
  readonly usages: readonly ProductUsageEvidence[];
  readonly unit: string;
}) {
  if (usages.length === 0) {
    return (
      <div className="pt-8">
        <EmptyState
          title="No Work Packages reference this Product"
          description="This Product is not referenced by any current Work Package. No usage or readiness conclusion should be inferred."
        />
      </div>
    );
  }

  return (
    <section aria-labelledby="product-usage-title" className="pt-8">
      <p className="text-xs font-semibold tracking-[0.16em] text-slate-600 uppercase">
        Requirement evidence
      </p>
      <h2
        id="product-usage-title"
        className="mt-1 text-2xl font-semibold text-slate-950"
      >
        Used in Work Packages
      </h2>
      <p className="mt-2 text-sm font-semibold text-slate-600">
        {usages.length} Product Requirement{usages.length === 1 ? "" : "s"}
      </p>

      <ul className="mt-5 space-y-4">
        {usages.map((usage) => (
          <li
            key={usage.requirementId}
            className="grid gap-5 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:grid-cols-[1fr_12rem_9rem] sm:items-center sm:p-6"
          >
            <div>
              <Link
                href={`/work-packages/${usage.workPackage.id}`}
                className="text-lg font-semibold text-emerald-900 underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                {usage.workPackage.name}
              </Link>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {usage.description}
              </p>
            </div>
            <UsageValue
              label="Planned"
              value={formatDateOnly(usage.workPackage.plannedDate)}
            />
            <UsageValue
              label="Required"
              value={formatQuantity(usage.requiredQuantity, unit)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function UsageValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
