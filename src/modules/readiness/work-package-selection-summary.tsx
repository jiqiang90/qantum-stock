import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/data-table";
import { formatQuantity } from "@/lib/presentation/formatters";
import type { WorkPackageSelectionAssessment } from "./readiness-model";
import { ReadinessStatusBadge } from "./readiness-display";

export function WorkPackageSelectionSummary({
  assessment,
}: {
  readonly assessment: WorkPackageSelectionAssessment;
}) {
  return (
    <section
      aria-labelledby="selection-readiness-title"
      className="mb-8 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-emerald-800 uppercase">
            Shared inventory check
          </p>
          <h2
            id="selection-readiness-title"
            className="mt-1 text-2xl font-semibold text-slate-950"
          >
            Selected package readiness
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {assessment.workPackageIds.length} Work Packages selected
          </p>
        </div>
        <ReadinessStatusBadge status={assessment.status} />
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-700">
        This comparison checks combined demand against the latest Inventory
        evidence. It does not reserve stock or decide which package receives it.
      </p>

      {assessment.unmappedRequirementCount > 0 ||
      assessment.workPackagesWithoutRequirements > 0 ? (
        <p className="mt-3 text-sm font-semibold text-amber-900">
          Some selected work has incomplete Product evidence, so unknowns remain
          visible alongside any confirmed shortage.
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
    </section>
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
