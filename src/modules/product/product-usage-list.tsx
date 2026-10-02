import Link from "next/link";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import {
  formatDateOnly,
  formatNumber,
  formatQuantity,
  formatTimestamp,
} from "@/lib/presentation/formatters";
import type {
  ProductInventoryEvidence,
  ProductUsageEvidence,
} from "./product-model";

export function ProductUsageList({
  inventorySnapshot,
  usages,
  unit,
}: {
  readonly inventorySnapshot: ProductInventoryEvidence | null;
  readonly usages: readonly ProductUsageEvidence[];
  readonly unit: string;
}) {
  const requiredQuantity = summarizeRequiredQuantity(usages);

  return (
    <div className="space-y-5 pt-8">
      <UsageSummary
        inventorySnapshot={inventorySnapshot}
        requiredQuantity={requiredQuantity}
        unit={unit}
      />

      {usages.length === 0 ? (
        <EmptyState
          title="No Work Packages reference this Product"
          description="This Product is not referenced by any current Work Package. No usage or readiness conclusion should be inferred."
        />
      ) : (
        <DataTable label="Work Package usage">
          <colgroup className="hidden lg:table-column-group">
            <col className="w-[32%]" />
            <col className="w-[34%]" />
            <col className="w-[17%]" />
            <col className="w-[17%]" />
          </colgroup>
          <DataTableHead>
            <DataTableHeaderCell>Work Package</DataTableHeaderCell>
            <DataTableHeaderCell>Requirement</DataTableHeaderCell>
            <DataTableHeaderCell>Planned</DataTableHeaderCell>
            <DataTableHeaderCell>Required</DataTableHeaderCell>
          </DataTableHead>
          <DataTableBody>
            {usages.map((usage) => (
              <DataTableRow key={usage.requirementId}>
                <DataTableCell label="Work Package" emphasis>
                  <Link
                    href={`/work-packages/${usage.workPackage.id}`}
                    className="rounded-sm text-base font-semibold text-slate-950 outline-none group-hover:text-emerald-900 after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-3 focus-visible:after:ring-emerald-700 focus-visible:after:ring-inset"
                  >
                    {usage.workPackage.name}
                  </Link>
                </DataTableCell>
                <DataTableCell label="Requirement">
                  {usage.description}
                </DataTableCell>
                <DataTableCell label="Planned">
                  {formatDateOnly(usage.workPackage.plannedDate)}
                </DataTableCell>
                <DataTableCell label="Required">
                  {formatQuantity(usage.requiredQuantity, unit)}
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      )}
    </div>
  );
}

function UsageSummary({
  inventorySnapshot,
  requiredQuantity,
  unit,
}: {
  readonly inventorySnapshot: ProductInventoryEvidence | null;
  readonly requiredQuantity: RequiredQuantitySummary;
  readonly unit: string;
}) {
  return (
    <section
      aria-label="Product usage summary"
      className="rounded-2xl border border-slate-300 bg-white px-5 py-4 shadow-sm"
    >
      <dl className="grid gap-4 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-slate-200">
        <div className="sm:pr-6">
          <dt className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
            Available
          </dt>
          <dd className="mt-1">
            <span
              className={`block text-xl font-semibold ${
                inventorySnapshot === null ? "text-amber-900" : "text-slate-950"
              }`}
            >
              {inventorySnapshot === null
                ? "Unknown"
                : `${formatNumber(inventorySnapshot.availableQuantity)} ${unit}`}
            </span>
            {inventorySnapshot === null ? null : (
              <span className="mt-1 block text-xs leading-5 text-slate-600">
                Captured {formatTimestamp(inventorySnapshot.capturedAt)}
              </span>
            )}
          </dd>
        </div>
        <div className="border-t border-slate-200 pt-4 sm:border-t-0 sm:pt-0 sm:pl-6">
          <dt className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
            {requiredQuantity.unknownCount === 0
              ? "Total required"
              : "Known required"}
          </dt>
          <dd className="mt-1">
            <span className="block text-xl font-semibold text-slate-950">
              {requiredQuantity.knownCount === 0 &&
              requiredQuantity.unknownCount > 0
                ? "Unknown"
                : `${formatNumber(requiredQuantity.knownTotal)} ${unit}`}
            </span>
            {requiredQuantity.unknownCount === 0 ? null : (
              <span className="mt-1 block text-xs leading-5 font-semibold text-amber-900">
                {formatUnknownRequirementCount(requiredQuantity.unknownCount)}
              </span>
            )}
          </dd>
        </div>
      </dl>
      <p className="mt-4 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-600">
        Informational across listed Work Packages; does not reserve stock or
        assume concurrent work.
      </p>
    </section>
  );
}

interface RequiredQuantitySummary {
  readonly knownCount: number;
  readonly knownTotal: number;
  readonly unknownCount: number;
}

function summarizeRequiredQuantity(
  usages: readonly ProductUsageEvidence[],
): RequiredQuantitySummary {
  let knownCount = 0;
  let knownTotal = 0;
  let unknownCount = 0;

  for (const usage of usages) {
    if (usage.requiredQuantity === null) {
      unknownCount += 1;
    } else {
      knownCount += 1;
      knownTotal += usage.requiredQuantity;
    }
  }

  return { knownCount, knownTotal, unknownCount };
}

function formatUnknownRequirementCount(count: number): string {
  return count === 1
    ? "1 requirement has unknown quantity"
    : `${formatNumber(count)} requirements have unknown quantity`;
}
