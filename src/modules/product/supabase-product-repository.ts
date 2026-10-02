import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { ProductEvidence, ProductUsageEvidence } from "./product-model";
import type { ProductRepository } from "./product-repository";

const PRODUCT_SELECT = `
  id,
  product_code,
  name,
  category,
  manufacturer,
  supplier_product_code,
  variant,
  description,
  canonical_unit,
  inventory_snapshots (
    id,
    available_quantity,
    captured_at
  ),
  solution_products:solution_products!solution_products_product_id_fkey (
    requirements:product_requirements!product_requirements_solution_product_id_fkey (
      id,
      position,
      description,
      required_quantity,
      work_package:work_packages!product_requirements_work_package_id_fkey (
        id,
        name,
        planned_date
      )
    )
  )
` as const;

interface InventorySnapshotRow {
  readonly id: string;
  readonly available_quantity: number;
  readonly captured_at: string;
}

interface ProductUsageRow {
  readonly id: string;
  readonly position: number;
  readonly description: string;
  readonly required_quantity: number | null;
  readonly work_package: {
    readonly id: string;
    readonly name: string;
    readonly planned_date: string;
  };
}

export interface ProductRow {
  readonly id: string;
  readonly product_code: string;
  readonly name: string;
  readonly category: string;
  readonly manufacturer: string;
  readonly supplier_product_code: string;
  readonly variant: string;
  readonly description: string;
  readonly canonical_unit: string;
  readonly inventory_snapshots: readonly InventorySnapshotRow[];
  readonly solution_products: readonly {
    readonly requirements: readonly ProductUsageRow[];
  }[];
}

export class SupabaseProductRepository implements ProductRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async list(): Promise<readonly ProductEvidence[]> {
    const { data, error } = await this.client
      .from("products")
      .select(PRODUCT_SELECT)
      .order("product_code")
      .order("id")
      .overrideTypes<ProductRow[], { merge: false }>();

    if (error) {
      throw new Error("Unable to load Product data.", { cause: error });
    }

    return data.map(mapProductRow);
  }

  async findById(id: string): Promise<ProductEvidence | null> {
    const { data, error } = await this.client
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .maybeSingle()
      .overrideTypes<ProductRow, { merge: false }>();

    if (error) {
      throw new Error("Unable to load Product data.", { cause: error });
    }

    return data === null ? null : mapProductRow(data);
  }
}

export function mapProductRow(row: ProductRow): ProductEvidence {
  const latestSnapshot = selectLatestSnapshot(row.inventory_snapshots);
  const usages = row.solution_products.flatMap(
    ({ requirements }) => requirements,
  );

  return {
    id: row.id,
    productCode: row.product_code,
    name: row.name,
    category: row.category,
    manufacturer: row.manufacturer,
    supplierProductCode: row.supplier_product_code,
    variant: row.variant,
    description: row.description,
    canonicalUnit: row.canonical_unit,
    inventorySnapshot:
      latestSnapshot === null
        ? null
        : {
            availableQuantity: latestSnapshot.available_quantity,
            capturedAt: latestSnapshot.captured_at,
          },
    usages: usages.sort(compareUsages).map(mapUsage),
  };
}

function selectLatestSnapshot(
  snapshots: readonly InventorySnapshotRow[],
): InventorySnapshotRow | null {
  return (
    [...snapshots].sort(
      (left, right) =>
        right.captured_at.localeCompare(left.captured_at) ||
        right.id.localeCompare(left.id),
    )[0] ?? null
  );
}

function compareUsages(left: ProductUsageRow, right: ProductUsageRow): number {
  return (
    left.work_package.planned_date.localeCompare(
      right.work_package.planned_date,
    ) ||
    left.work_package.name.localeCompare(right.work_package.name, "en-NZ") ||
    left.position - right.position ||
    left.id.localeCompare(right.id, "en-NZ")
  );
}

function mapUsage(usage: ProductUsageRow): ProductUsageEvidence {
  return {
    requirementId: usage.id,
    position: usage.position,
    description: usage.description,
    requiredQuantity: usage.required_quantity,
    workPackage: {
      id: usage.work_package.id,
      name: usage.work_package.name,
      plannedDate: usage.work_package.planned_date,
    },
  };
}
