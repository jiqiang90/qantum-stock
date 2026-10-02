import {
  ListFilterActions,
  ListFilterSelect,
  ListSearchField,
} from "@/components/list-filter-controls";
import type { ProductListFilters } from "./product-model";

export function ProductListControls({
  filters,
}: {
  readonly filters: ProductListFilters;
}) {
  return (
    <form
      action="/products"
      method="get"
      aria-label="Filter Products"
      className="mb-8 grid gap-4 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(15rem,1fr)_12rem_12rem_auto] lg:items-end"
    >
      <ListSearchField
        defaultValue={filters.query}
        label="Search Products"
        name="q"
        placeholder="Name or Product Code"
      />

      <ListFilterSelect label="Usage" name="usage" value={filters.usage}>
        <option value="all">All usage</option>
        <option value="used">Used</option>
        <option value="unused">Unused</option>
      </ListFilterSelect>

      <ListFilterSelect
        label="Inventory evidence"
        name="inventory"
        value={filters.inventory}
      >
        <option value="all">All evidence</option>
        <option value="known">Known</option>
        <option value="unknown">Unknown</option>
      </ListFilterSelect>

      <ListFilterActions resetHref="/products" />
    </form>
  );
}
