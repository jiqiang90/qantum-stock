import Link from "next/link";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/data-table";
import { formatQuantity, formatTimestamp } from "@/lib/presentation/formatters";
import { ReadinessStatusBadge } from "./readiness-display";
import type {
  ReadinessAssessment,
  ReadinessReason,
  RequirementAssessment,
} from "./readiness-model";

const reasonDescriptions: Record<ReadinessReason, string> = {
  NO_REQUIREMENTS: "No requirements recorded",
  PRODUCT_NOT_MAPPED: "Product not mapped",
  REQUIRED_QUANTITY_MISSING: "Required quantity missing",
  INVENTORY_SNAPSHOT_MISSING: "Inventory snapshot missing",
  INSUFFICIENT_QUANTITY: "Insufficient quantity",
  SUFFICIENT_QUANTITY: "Quantity available",
};

export function WorkPackageRequirementsSection({
  assessment,
}: {
  readonly assessment: ReadinessAssessment;
}) {
  const requirementCount = assessment.requirements.length;

  return (
    <section aria-label="Product Requirements">
      {requirementCount === 0 ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
          <p className="font-semibold text-amber-950">
            No Product Requirements are recorded.
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            Readiness remains UNKNOWN until requirements are available.
          </p>
        </div>
      ) : (
        <DataTable label="Product Requirements">
          <colgroup className="hidden lg:table-column-group">
            <col className="w-[25%]" />
            <col className="w-[18%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
            <col className="w-[17%]" />
            <col className="w-[13%]" />
          </colgroup>
          <DataTableHead>
            <DataTableHeaderCell>Requirement</DataTableHeaderCell>
            <DataTableHeaderCell>Product</DataTableHeaderCell>
            <DataTableHeaderCell>Required</DataTableHeaderCell>
            <DataTableHeaderCell>Available</DataTableHeaderCell>
            <DataTableHeaderCell>Missing</DataTableHeaderCell>
            <DataTableHeaderCell>Inventory captured</DataTableHeaderCell>
            <DataTableHeaderCell>Status</DataTableHeaderCell>
          </DataTableHead>
          <DataTableBody>
            {assessment.requirements.map((requirement) => (
              <RequirementRow
                key={requirement.requirementId}
                requirement={requirement}
              />
            ))}
          </DataTableBody>
        </DataTable>
      )}
    </section>
  );
}

function RequirementRow({
  requirement,
}: {
  readonly requirement: RequirementAssessment;
}) {
  const unit = requirement.product?.canonicalUnit ?? null;

  return (
    <DataTableRow interactive={false}>
      <DataTableCell label="Requirement" emphasis>
        <span className="block leading-6">{requirement.description}</span>
        {requirement.product === null ? (
          <span className="mt-1 block text-xs font-semibold text-amber-800">
            Not mapped to nominated Solution
          </span>
        ) : null}
      </DataTableCell>
      <DataTableCell label="Product">
        {requirement.product === null ? (
          <>
            <span className="block">Unknown</span>
            <span className="mt-1 block text-xs text-slate-500">Unknown</span>
          </>
        ) : (
          <>
            <Link
              href={`/products/${requirement.product.id}`}
              className="rounded-sm font-semibold text-emerald-900 underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
            >
              {requirement.product.name}
            </Link>
            <span className="mt-1 block text-xs text-slate-500">
              {requirement.product.productCode}
            </span>
          </>
        )}
      </DataTableCell>
      <DataTableCell label="Required">
        {formatQuantity(requirement.requiredQuantity, unit)}
      </DataTableCell>
      <DataTableCell label="Available">
        {formatQuantity(requirement.availableQuantity, unit)}
      </DataTableCell>
      <DataTableCell label="Missing">
        {formatQuantity(requirement.missingQuantity, unit)}
      </DataTableCell>
      <DataTableCell label="Inventory captured">
        {formatTimestamp(requirement.inventoryCapturedAt)}
      </DataTableCell>
      <DataTableCell label="Status">
        <ReadinessStatusBadge status={requirement.status} />
        <span className="mt-2 block text-xs leading-5 text-slate-600">
          {reasonDescriptions[requirement.reason]}
        </span>
      </DataTableCell>
    </DataTableRow>
  );
}
