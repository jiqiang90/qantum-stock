import { PageHeading } from "@/components/page-heading";
import { assessWorkPackageSelection } from "@/modules/readiness/assess-readiness";
import { createReadinessService } from "@/modules/readiness/create-readiness-service";
import {
  parseWorkPackageListFilters,
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
  const selection = parseWorkPackageSelection(params);
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
        description="Review packages individually or select multiple packages to check their combined demand against shared Inventory evidence."
      />
      <WorkPackageListControls filters={filters} />

      {aggregateAssessment === null ? null : (
        <WorkPackageSelectionSummary assessment={aggregateAssessment} />
      )}
      <WorkPackageList
        filters={filters}
        items={items}
        selectedIds={selectedIds}
        selectionAttempted={selection.attempted}
        totalCount={allItems.length}
      />
    </div>
  );
}
