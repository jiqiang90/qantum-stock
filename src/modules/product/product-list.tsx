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
import { formatNumber, formatTimestamp } from "@/lib/presentation/formatters";
import type { ProductListFilters, ProductListItem } from "./product-model";

export function ProductList({
  items,
  filters,
}: {
  readonly items: readonly ProductListItem[];
  readonly filters: ProductListFilters;
}) {
  if (items.length === 0) {
    const hasFilters =
      filters.query.length > 0 ||
      filters.usage !== "all" ||
      filters.inventory !== "all";

    return (
      <EmptyState
        title={
          hasFilters
            ? "No Products match these filters"
            : "No Products available"
        }
        description={
          hasFilters
            ? "Try a broader search or clear the filters."
            : "The Product catalogue is empty."
        }
        action={
          hasFilters ? (
            <Link
              className="inline-flex min-h-11 items-center rounded-md bg-emerald-800 px-4 text-sm font-bold text-white outline-none hover:bg-emerald-900 focus-visible:ring-3 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              href="/products"
            >
              Clear filters
            </Link>
          ) : undefined
        }
      />
    );
  }

  return (
    <section aria-labelledby="product-list-title">
      <h2
        id="product-list-title"
        className="mb-4 text-xl font-semibold text-slate-950"
      >
        {items.length} {items.length === 1 ? "Product" : "Products"}
      </h2>

      <DataTable label="Products">
        <colgroup className="hidden lg:table-column-group">
          <col className="w-[27%]" />
          <col className="w-[13%]" />
          <col className="w-[10%]" />
          <col className="w-[14%]" />
          <col className="w-[23%]" />
          <col className="w-[13%]" />
        </colgroup>
        <DataTableHead>
          <DataTableHeaderCell>Product</DataTableHeaderCell>
          <DataTableHeaderCell>Product Code</DataTableHeaderCell>
          <DataTableHeaderCell>Unit</DataTableHeaderCell>
          <DataTableHeaderCell>Latest Inventory</DataTableHeaderCell>
          <DataTableHeaderCell>Captured</DataTableHeaderCell>
          <DataTableHeaderCell>Used by</DataTableHeaderCell>
        </DataTableHead>
        <DataTableBody>
          {items.map((item) => (
            <DataTableRow key={item.id}>
              <DataTableCell label="Product" emphasis>
                <Link
                  href={`/products/${item.id}`}
                  className="rounded-sm text-base font-semibold text-slate-950 outline-none group-hover:text-emerald-900 after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-3 focus-visible:after:ring-emerald-700 focus-visible:after:ring-inset"
                >
                  {item.name}
                </Link>
              </DataTableCell>
              <DataTableCell label="Product Code">
                {item.productCode}
              </DataTableCell>
              <DataTableCell label="Unit">{item.canonicalUnit}</DataTableCell>
              <DataTableCell label="Latest Inventory">
                {formatInventory(item)}
              </DataTableCell>
              <DataTableCell label="Captured">
                {formatTimestamp(item.inventorySnapshot?.capturedAt ?? null)}
              </DataTableCell>
              <DataTableCell label="Used by">
                {item.referencingWorkPackageCount} Work Package
                {item.referencingWorkPackageCount === 1 ? "" : "s"}
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </section>
  );
}

function formatInventory(item: ProductListItem): string {
  if (item.inventorySnapshot === null) {
    return "Unknown";
  }

  return formatNumber(item.inventorySnapshot.availableQuantity);
}
