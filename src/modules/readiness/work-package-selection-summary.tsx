"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/data-table";
import { formatQuantity } from "@/lib/presentation/formatters";
import { CopySummary } from "./copy-summary";
import type { WorkPackageSelectionAssessment } from "./readiness-model";
import { ReadinessStatusBadge } from "./readiness-display";
import {
  buildCombinedShortageSummary,
  type CombinedSummaryWorkPackage,
} from "./shortage-summary";

export function WorkPackageSelectionSummary({
  assessment,
  workPackages,
  closeHref,
}: {
  readonly assessment: WorkPackageSelectionAssessment;
  readonly workPackages: readonly CombinedSummaryWorkPackage[];
  readonly closeHref: string;
}) {
  const dialogReference = useRef<HTMLDialogElement>(null);
  const navigationStarted = useRef(false);
  const router = useRouter();
  const summary =
    assessment.status === "READY"
      ? null
      : buildCombinedShortageSummary({ assessment, workPackages });

  useEffect(() => {
    const dialog = dialogReference.current;

    if (dialog === null || dialog.open) {
      return;
    }

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }, []);

  function finishDismissal() {
    if (navigationStarted.current) {
      return;
    }

    navigationStarted.current = true;
    document.getElementById("check-combined-availability")?.focus();
    router.replace(closeHref, { scroll: false });
  }

  function dismiss() {
    const dialog = dialogReference.current;

    if (dialog !== null && typeof dialog.close === "function" && dialog.open) {
      dialog.close();
      return;
    }

    dialog?.removeAttribute("open");
    finishDismissal();
  }

  return (
    <dialog
      aria-labelledby="selection-readiness-title"
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-2xl border border-slate-300 bg-white p-0 text-slate-950 shadow-2xl backdrop:bg-slate-950/55 backdrop:backdrop-blur-[1px]"
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onClose={finishDismissal}
      ref={dialogReference}
    >
      <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-emerald-800 uppercase">
              Combined availability
            </p>
            <h2
              id="selection-readiness-title"
              className="mt-1 text-2xl font-semibold text-slate-950"
            >
              Combined Availability Report
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {assessment.workPackageIds.length} Work Packages selected
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-4">
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-emerald-900 outline-none hover:bg-emerald-50 focus-visible:ring-3 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              onClick={dismiss}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
              Close report
            </button>
            <ReadinessStatusBadge status={assessment.status} />
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-700">
          This comparison checks combined demand against the latest Inventory
          evidence. It does not reserve stock or decide which package receives
          it.
        </p>

        {assessment.unmappedRequirementCount > 0 ||
        assessment.workPackagesWithoutRequirements > 0 ? (
          <p className="mt-3 text-sm font-semibold text-amber-900">
            Some selected work has incomplete Product evidence, so unknowns
            remain visible alongside any confirmed shortage.
          </p>
        ) : null}

        {assessment.products.length === 0 ? (
          <p className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            No mapped Product totals can be calculated for this selection.
          </p>
        ) : (
          <div className="mt-5">
            <DataTable label="Selected Work Package aggregate readiness">
              <colgroup className="hidden lg:table-column-group">
                <col className="w-[32%]" />
                <col className="w-[19%]" />
                <col className="w-[19%]" />
                <col className="w-[16%]" />
                <col className="w-[14%]" />
              </colgroup>
              <DataTableHead>
                <DataTableHeaderCell>Product</DataTableHeaderCell>
                <DataTableHeaderCell>Total required</DataTableHeaderCell>
                <DataTableHeaderCell>Available</DataTableHeaderCell>
                <DataTableHeaderCell>Missing</DataTableHeaderCell>
                <DataTableHeaderCell>Status</DataTableHeaderCell>
              </DataTableHead>
              <DataTableBody>
                {assessment.products.map((product) => (
                  <DataTableRow interactive={false} key={product.product.id}>
                    <DataTableCell label="Product" emphasis>
                      <span className="block">{product.product.name}</span>
                      <span className="mt-1 block text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">
                        {product.product.productCode}
                      </span>
                    </DataTableCell>
                    <DataTableCell label="Total required">
                      {formatAggregateRequirement(product)}
                    </DataTableCell>
                    <DataTableCell label="Available">
                      {formatQuantity(
                        product.availableQuantity,
                        product.product.canonicalUnit,
                      )}
                    </DataTableCell>
                    <DataTableCell label="Missing">
                      {formatQuantity(
                        product.missingQuantity,
                        product.product.canonicalUnit,
                      )}
                    </DataTableCell>
                    <DataTableCell label="Status">
                      <ReadinessStatusBadge status={product.status} />
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          </div>
        )}

        {summary === null ? null : <CopySummary summary={summary} />}
      </div>
    </dialog>
  );
}

function formatAggregateRequirement(
  product: WorkPackageSelectionAssessment["products"][number],
): string {
  if (!product.requiredQuantityIncomplete) {
    return formatQuantity(
      product.knownRequiredQuantity,
      product.product.canonicalUnit,
    );
  }

  return product.knownRequiredQuantity > 0
    ? `At least ${formatQuantity(
        product.knownRequiredQuantity,
        product.product.canonicalUnit,
      )}`
    : "Unknown";
}
