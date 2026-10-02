import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type {
  PersistSolutionSelectionResult,
  RequirementEvidenceInput,
  SelectSolutionCommand,
  SolutionOptionEvidence,
  SolutionReference,
  WorkPackageEvidence,
} from "./readiness-model";
import type { ReadinessRepository } from "./readiness-repository";

const WORK_PACKAGE_SELECT = `
  id,
  name,
  planned_date,
  selected_solution_option_id,
  solution_options!solution_options_work_package_id_fkey (
    id,
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

interface SolutionRow {
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
}

interface SolutionOptionRow {
  readonly id: string;
  readonly solution: SolutionRow;
  readonly requirements: readonly ProductRequirementRow[];
}

export interface ReadinessRow {
  readonly id: string;
  readonly name: string;
  readonly planned_date: string;
  readonly selected_solution_option_id: string;
  readonly solution_options: readonly SolutionOptionRow[];
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

  async selectSolution(
    command: SelectSolutionCommand,
  ): Promise<PersistSolutionSelectionResult> {
    const { data, error } = await this.client.rpc(
      "select_work_package_solution",
      {
        p_work_package_id: command.workPackageId,
        p_solution_option_id: command.solutionOptionId,
        p_expected_current_option_id: command.expectedCurrentOptionId,
      },
    );

    return error === null
      ? { status: "selected", selectedOptionId: data }
      : mapSelectionErrorCode(error.code);
  }
}

export function mapSelectionErrorCode(
  code: string | undefined,
): PersistSolutionSelectionResult {
  switch (code) {
    case "42501":
      return { status: "unauthenticated" };
    case "22023":
      return { status: "invalid" };
    case "40001":
      return { status: "conflict" };
    default:
      return { status: "unavailable" };
  }
}

export function mapReadinessRow(row: ReadinessRow): WorkPackageEvidence {
  return {
    id: row.id,
    name: row.name,
    plannedDate: row.planned_date,
    selectedSolutionOptionId: row.selected_solution_option_id,
    solutionOptions: [...row.solution_options]
      .sort(
        (left, right) =>
          left.solution.internal_code.localeCompare(
            right.solution.internal_code,
            "en-NZ",
          ) || left.id.localeCompare(right.id, "en-NZ"),
      )
      .map(mapSolutionOption),
  };
}

function mapSolutionOption(row: SolutionOptionRow): SolutionOptionEvidence {
  return {
    id: row.id,
    solution: mapSolution(row.solution),
    requirements: [...row.requirements]
      .sort(
        (left, right) =>
          left.position - right.position || left.id.localeCompare(right.id),
      )
      .map(mapRequirement),
  };
}

function mapSolution(row: SolutionRow): SolutionReference {
  return {
    id: row.id,
    internalCode: row.internal_code,
    supplierRefCode: row.supplier_ref_code,
    supplier: row.supplier,
    orientation: row.orientation,
    substrate: row.substrate,
    serviceClassification: row.service_classification,
    serviceType: row.service_type,
    serviceSize: row.service_size,
    integrity: row.integrity,
    insulation: row.insulation,
    serviceTypeOption: row.service_type_option,
    substrateOption: row.substrate_option,
  };
}

function mapRequirement(
  requirement: ProductRequirementRow,
): RequirementEvidenceInput {
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
