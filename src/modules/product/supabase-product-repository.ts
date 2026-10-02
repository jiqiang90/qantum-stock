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
      solution_option:solution_options!product_requirements_solution_option_id_fkey (
        id,
        work_package:work_packages!solution_options_work_package_id_fkey (
          id,
          name,
          planned_date,
          selected_solution_option_id
        )
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
  readonly solution_option: {
    readonly id: string;
    readonly work_package: {
      readonly id: string;
      readonly name: string;
      readonly planned_date: string;
      readonly selected_solution_option_id: string;
    };
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
  const usages = row.solution_products.flatMap(({ requirements }) =>
    requirements.filter(
      ({ solution_option }) =>
        solution_option.id ===
        solution_option.work_package.selected_solution_option_id,
    ),
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
  const leftWorkPackage = left.solution_option.work_package;
  const rightWorkPackage = right.solution_option.work_package;

  return (
    leftWorkPackage.planned_date.localeCompare(rightWorkPackage.planned_date) ||
    leftWorkPackage.name.localeCompare(rightWorkPackage.name, "en-NZ") ||
    left.position - right.position ||
    left.id.localeCompare(right.id, "en-NZ")
  );
}

function mapUsage(usage: ProductUsageRow): ProductUsageEvidence {
  const workPackage = usage.solution_option.work_package;

  return {
    requirementId: usage.id,
    position: usage.position,
    description: usage.description,
    requiredQuantity: usage.required_quantity,
    workPackage: {
      id: workPackage.id,
      name: workPackage.name,
      plannedDate: workPackage.planned_date,
    },
  };
}
