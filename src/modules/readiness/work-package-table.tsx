import Link from "next/link";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/data-table";
import { formatPlannedDate, ReadinessStatusBadge } from "./readiness-display";
import type { WorkPackageReadiness } from "./readiness-model";
import { formatSolutionLabel } from "./solution-display";

export function WorkPackageTable({
  items,
  selectedIds,
}: {
  readonly items: readonly WorkPackageReadiness[];
  readonly selectedIds?: readonly string[];
}) {
  const selectable = selectedIds !== undefined;
  const selected = new Set(selectedIds);

  return (
    <DataTable label="Work Packages">
      <colgroup className="hidden lg:table-column-group">
        {selectable ? <col className="w-[9%]" /> : null}
        <col className={selectable ? "w-[14%]" : "w-[16%]"} />
        <col className={selectable ? "w-[27%]" : "w-[30%]"} />
        <col className={selectable ? "w-[36%]" : "w-[40%]"} />
        <col className="w-[14%]" />
      </colgroup>
      <DataTableHead>
        {selectable ? <DataTableHeaderCell>Compare</DataTableHeaderCell> : null}
        <DataTableHeaderCell>Planned</DataTableHeaderCell>
        <DataTableHeaderCell>Work Package</DataTableHeaderCell>
        <DataTableHeaderCell>Solution</DataTableHeaderCell>
        <DataTableHeaderCell>Status</DataTableHeaderCell>
      </DataTableHead>
      <DataTableBody>
        {items.map(({ workPackage, selectedOption, assessment }) => (
          <DataTableRow key={workPackage.id}>
            {selectable ? (
              <DataTableCell label="Compare">
                <input
                  aria-label={`Select ${workPackage.name}`}
                  className="relative z-10 size-6 accent-emerald-800 outline-none focus-visible:ring-3 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                  defaultChecked={selected.has(workPackage.id)}
                  name="workPackage"
                  type="checkbox"
                  value={workPackage.id}
                />
              </DataTableCell>
            ) : null}
            <DataTableCell label="Planned">
              {formatPlannedDate(workPackage.plannedDate)}
            </DataTableCell>
            <DataTableCell label="Work Package" emphasis>
              <Link
                href={`/work-packages/${workPackage.id}`}
                className="rounded-sm text-base font-semibold text-slate-950 outline-none group-hover:text-emerald-900 after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-3 focus-visible:after:ring-emerald-700 focus-visible:after:ring-inset"
              >
                {workPackage.name}
              </Link>
            </DataTableCell>
            <DataTableCell label="Solution">
              {formatSolutionLabel(selectedOption.solution)}
            </DataTableCell>
            <DataTableCell label="Status">
              <ReadinessStatusBadge status={assessment.status} />
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  );
}
