import { PageHeading } from "@/components/page-heading";
import { assessWorkPackageSelection } from "@/modules/readiness/assess-readiness";
import { CombinedAvailabilitySelector } from "@/modules/readiness/combined-availability-selector";
import { createReadinessService } from "@/modules/readiness/create-readiness-service";
import {
  parseWorkPackageListFilters,
  parseWorkPackageListMode,
  parseWorkPackageSelection,
} from "@/modules/readiness/readiness-boundaries";
import { WorkPackageList } from "@/modules/readiness/work-package-list";
import { WorkPackageListControls } from "@/modules/readiness/work-package-list-controls";
import { filterWorkPackages } from "@/modules/readiness/work-package-list-filters";
import { WorkPackageSelectionSummary } from "@/modules/readiness/work-package-selection-summary";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseWorkPackageListFilters(params);
  const mode = parseWorkPackageListMode(params);
  const selection =
    mode === "combined"
      ? parseWorkPackageSelection(params)
      : { attempted: false, ids: [] };
  const readiness = createReadinessService();
  const allItems = await readiness.list();
  const items = filterWorkPackages(allItems, filters);
  const availableIds = new Set(items.map(({ workPackage }) => workPackage.id));
  const selectedIds = selection.ids.filter((id) => availableIds.has(id));
  const selectedItems = items.filter(({ workPackage }) =>
    selectedIds.includes(workPackage.id),
  );
  const aggregateAssessment =
    selectedItems.length >= 2
      ? assessWorkPackageSelection(selectedItems)
      : null;

  return (
    <div>
      <PageHeading
        eyebrow="Team Leader workspace"
        title="Material readiness"
        description={
          mode === "combined"
            ? "Select planned work to check its combined demand against shared Inventory evidence."
            : "Review planned work and open a package to inspect its material evidence."
        }
      />
      <WorkPackageListControls filters={filters} mode={mode} />

      {mode === "combined" &&
      selection.attempted &&
      aggregateAssessment !== null ? (
        <WorkPackageSelectionSummary
          assessment={aggregateAssessment}
          closeHref={buildCombinedSelectionHref(filters, selectedIds)}
          workPackages={selectedItems.map(({ workPackage }) => workPackage)}
        />
      ) : null}
      {mode === "combined" ? (
        <CombinedAvailabilitySelector
          filters={filters}
          items={items}
          selectedIds={selectedIds}
          selectionAttempted={selection.attempted}
          totalCount={allItems.length}
        />
      ) : (
        <WorkPackageList
          filters={filters}
          items={items}
          totalCount={allItems.length}
        />
      )}
    </div>
  );
}

function buildCombinedSelectionHref(
  filters: ReturnType<typeof parseWorkPackageListFilters>,
  selectedIds: readonly string[],
): string {
  const params = new URLSearchParams({ mode: "combined" });

  if (filters.query.length > 0) {
    params.set("q", filters.query);
  }
  if (filters.status !== "all") {
    params.set("status", filters.status);
  }
  for (const selectedId of selectedIds) {
    params.append("workPackage", selectedId);
  }

  return `/?${params.toString()}`;
}
