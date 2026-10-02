import type { ProductIdentity } from "../product/product-model";

export type ReadinessStatus = "READY" | "SHORTAGE" | "UNKNOWN";

export interface WorkPackageListFilters {
  readonly query: string;
  readonly status: ReadinessStatus | "all";
}

export type ReadinessReason =
  | "NO_REQUIREMENTS"
  | "PRODUCT_NOT_MAPPED"
  | "REQUIRED_QUANTITY_MISSING"
  | "INVENTORY_SNAPSHOT_MISSING"
  | "INSUFFICIENT_QUANTITY"
  | "SUFFICIENT_QUANTITY";

/** Readiness carries the canonical Product identity without owning it. */
export type ProductReference = ProductIdentity;

export interface InventorySnapshotEvidence {
  readonly availableQuantity: number;
  readonly capturedAt: string;
}

export interface RequirementEvidenceInput {
  readonly id: string;
  readonly description: string;
  readonly product: ProductReference | null;
  readonly requiredQuantity: number | null;
  readonly inventorySnapshot: InventorySnapshotEvidence | null;
}

export interface RequirementAssessment {
  readonly requirementId: string;
  readonly description: string;
  readonly product: ProductReference | null;
  readonly requiredQuantity: number | null;
  readonly availableQuantity: number | null;
  readonly missingQuantity: number | null;
  readonly inventoryCapturedAt: string | null;
  readonly status: ReadinessStatus;
  readonly reason: Exclude<ReadinessReason, "NO_REQUIREMENTS">;
}

export interface ReadinessAssessment {
  readonly status: ReadinessStatus;
  readonly reason: "NO_REQUIREMENTS" | null;
  readonly requirements: readonly RequirementAssessment[];
}

export interface SolutionReference {
  readonly id: string;
  readonly internalCode: string;
  readonly supplierRefCode: string;
  readonly supplier: string;
  readonly orientation: string;
  readonly substrate: string;
  readonly serviceClassification: string;
  readonly serviceType: string;
  readonly serviceSize: string;
  readonly integrity: string;
  readonly insulation: string;
  readonly serviceTypeOption: string;
  readonly substrateOption: string;
}

export interface WorkPackageEvidence {
  readonly id: string;
  readonly name: string;
  readonly plannedDate: string;
  readonly selectedSolutionOptionId: string;
  readonly solutionOptions: readonly SolutionOptionEvidence[];
}

export interface SolutionOptionEvidence {
  readonly id: string;
  readonly solution: SolutionReference;
  readonly requirements: readonly RequirementEvidenceInput[];
}

export interface SolutionOptionReadiness {
  readonly option: SolutionOptionEvidence;
  readonly assessment: ReadinessAssessment;
  readonly selected: boolean;
}

export interface WorkPackageReadiness {
  readonly workPackage: WorkPackageEvidence;
  readonly selectedOption: SolutionOptionEvidence;
  readonly assessment: ReadinessAssessment;
  readonly solutionOptions: readonly SolutionOptionReadiness[];
}

export interface AggregateProductAssessment {
  readonly product: ProductReference;
  readonly knownRequiredQuantity: number;
  readonly requiredQuantityIncomplete: boolean;
  readonly availableQuantity: number | null;
  readonly missingQuantity: number | null;
  readonly inventoryCapturedAt: string | null;
  readonly status: ReadinessStatus;
  readonly reason:
    | "REQUIRED_QUANTITY_MISSING"
    | "INVENTORY_SNAPSHOT_MISSING"
    | "INSUFFICIENT_QUANTITY"
    | "SUFFICIENT_QUANTITY";
}

export interface WorkPackageSelectionAssessment {
  readonly status: ReadinessStatus;
  readonly workPackageIds: readonly string[];
  readonly products: readonly AggregateProductAssessment[];
  readonly unmappedRequirementCount: number;
  readonly workPackagesWithoutRequirements: number;
}

export interface SelectSolutionCommand {
  readonly workPackageId: string;
  readonly solutionOptionId: string;
  readonly expectedCurrentOptionId: string;
}

export type PersistSolutionSelectionResult =
  | { readonly status: "selected"; readonly selectedOptionId: string }
  | {
      readonly status:
        "unauthenticated" | "invalid" | "conflict" | "unavailable";
    };

export type SelectionFeedback = "conflict" | "invalid" | "unavailable" | null;
