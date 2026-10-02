import {
  ListFilterActions,
  ListFilterSelect,
  ListSearchField,
} from "@/components/list-filter-controls";
import type { WorkPackageListFilters } from "./readiness-model";

export function WorkPackageListControls({
  filters,
}: {
  readonly filters: WorkPackageListFilters;
}) {
  return (
    <form
      action="/"
      method="get"
      aria-label="Filter Work Packages"
      className="mb-8 grid gap-4 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(15rem,1fr)_12rem_auto] lg:items-end"
    >
      <ListSearchField
        defaultValue={filters.query}
        label="Search Work Packages"
        name="q"
        placeholder="Name, Solution code or service"
      />

      <ListFilterSelect label="Readiness" name="status" value={filters.status}>
        <option value="all">All statuses</option>
        <option value="READY">Ready</option>
        <option value="SHORTAGE">Shortage</option>
        <option value="UNKNOWN">Unknown</option>
      </ListFilterSelect>

      <ListFilterActions resetHref="/" />
    </form>
  );
}
