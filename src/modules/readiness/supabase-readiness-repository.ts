import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { WorkPackageEvidence } from "./readiness-model";
import type { ReadinessRepository } from "./readiness-repository";

const WORK_PACKAGE_SELECT = `
  id,
  name,
  planned_date,
  solution:solutions!inner (
    id,
    internal_code,
    supplier_ref_code,
    supplier,
    orientation,
    substrate,
    service_classification,
    service_type,
    service_size,
    integrity,
    insulation,
    service_type_option,
    substrate_option
  ),
  requirements:product_requirements (
    id,
    position,
    description,
    required_quantity,
    solution_product:solution_products (
      product:products (
        id,
        product_code,
        name,
        canonical_unit,
        inventory_snapshots (
          id,
          available_quantity,
          captured_at
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

interface ProductRow {
  readonly id: string;
  readonly product_code: string;
  readonly name: string;
  readonly canonical_unit: string;
  readonly inventory_snapshots: readonly InventorySnapshotRow[];
}

interface ProductRequirementRow {
  readonly id: string;
  readonly position: number;
  readonly description: string;
  readonly required_quantity: number | null;
  readonly solution_product: {
    readonly product: ProductRow;
  } | null;
}

export interface ReadinessRow {
  readonly id: string;
  readonly name: string;
  readonly planned_date: string;
  readonly solution: {
    readonly id: string;
    readonly internal_code: string;
    readonly supplier_ref_code: string;
    readonly supplier: string;
    readonly orientation: string;
    readonly substrate: string;
    readonly service_classification: string;
    readonly service_type: string;
    readonly service_size: string;
    readonly integrity: string;
    readonly insulation: string;
    readonly service_type_option: string;
    readonly substrate_option: string;
  };
  readonly requirements: readonly ProductRequirementRow[];
}

export class SupabaseReadinessRepository implements ReadinessRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async list(): Promise<readonly WorkPackageEvidence[]> {
    const { data, error } = await this.client
      .from("work_packages")
      .select(WORK_PACKAGE_SELECT)
      .order("planned_date")
      .order("name")
      .order("id")
      .overrideTypes<ReadinessRow[], { merge: false }>();

    if (error) {
      throw new Error("Unable to load material readiness data.", {
        cause: error,
      });
    }

    return data.map(mapReadinessRow);
  }

  async findById(id: string): Promise<WorkPackageEvidence | null> {
    const { data, error } = await this.client
      .from("work_packages")
      .select(WORK_PACKAGE_SELECT)
      .eq("id", id)
      .maybeSingle()
      .overrideTypes<ReadinessRow, { merge: false }>();

    if (error) {
      throw new Error("Unable to load material readiness data.", {
        cause: error,
      });
    }

    return data === null ? null : mapReadinessRow(data);
  }
}

export function mapReadinessRow(row: ReadinessRow): WorkPackageEvidence {
  return {
    id: row.id,
    name: row.name,
    plannedDate: row.planned_date,
    solution: {
      id: row.solution.id,
      internalCode: row.solution.internal_code,
      supplierRefCode: row.solution.supplier_ref_code,
      supplier: row.solution.supplier,
      orientation: row.solution.orientation,
      substrate: row.solution.substrate,
      serviceClassification: row.solution.service_classification,
      serviceType: row.solution.service_type,
      serviceSize: row.solution.service_size,
      integrity: row.solution.integrity,
      insulation: row.solution.insulation,
      serviceTypeOption: row.solution.service_type_option,
      substrateOption: row.solution.substrate_option,
    },
    requirements: [...row.requirements]
      .sort(
        (left, right) =>
          left.position - right.position || left.id.localeCompare(right.id),
      )
      .map((requirement) => {
        const product = requirement.solution_product?.product ?? null;
        const latestSnapshot = selectLatestSnapshot(
          product?.inventory_snapshots ?? [],
        );

        return {
          id: requirement.id,
          description: requirement.description,
          product:
            product === null
              ? null
              : {
                  id: product.id,
                  productCode: product.product_code,
                  name: product.name,
                  canonicalUnit: product.canonical_unit,
                },
          requiredQuantity: requirement.required_quantity,
          inventorySnapshot:
            latestSnapshot === null
              ? null
              : {
                  availableQuantity: latestSnapshot.available_quantity,
                  capturedAt: latestSnapshot.captured_at,
                },
        };
      }),
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
