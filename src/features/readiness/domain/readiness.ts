export type ReadinessStatus = "READY" | "SHORTAGE" | "UNKNOWN";

const QUANTITY_SCALE = 1_000;

export type ReadinessReason =
  | "NO_REQUIREMENTS"
  | "PRODUCT_NOT_MAPPED"
  | "REQUIRED_QUANTITY_MISSING"
  | "INVENTORY_SNAPSHOT_MISSING"
  | "INSUFFICIENT_QUANTITY"
  | "SUFFICIENT_QUANTITY";

export interface ProductEvidence {
  readonly id: string;
  readonly productCode: string;
  readonly name: string;
  readonly canonicalUnit: string;
}

export interface InventorySnapshotEvidence {
  readonly availableQuantity: number;
  readonly capturedAt: string;
}

export interface RequirementEvidenceInput {
  readonly id: string;
  readonly description: string;
  readonly product: ProductEvidence | null;
  readonly requiredQuantity: number | null;
  readonly inventorySnapshot: InventorySnapshotEvidence | null;
}

export interface RequirementAssessment {
  readonly requirementId: string;
  readonly description: string;
  readonly product: ProductEvidence | null;
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

export function assessReadiness(
  requirements: readonly RequirementEvidenceInput[],
): ReadinessAssessment {
  if (requirements.length === 0) {
    return {
      status: "UNKNOWN",
      reason: "NO_REQUIREMENTS",
      requirements: [],
    };
  }

  const requirementAssessments = requirements.map(assessRequirement);

  return {
    status: aggregateReadiness(requirementAssessments),
    reason: null,
    requirements: requirementAssessments,
  };
}

function assessRequirement(
  requirement: RequirementEvidenceInput,
): RequirementAssessment {
  const inventorySnapshot =
    requirement.product === null ? null : requirement.inventorySnapshot;
  const evidence = {
    requirementId: requirement.id,
    description: requirement.description,
    product: requirement.product,
    requiredQuantity: normalizeNullableQuantity(requirement.requiredQuantity),
    availableQuantity: normalizeNullableQuantity(
      inventorySnapshot?.availableQuantity ?? null,
    ),
    inventoryCapturedAt: inventorySnapshot?.capturedAt ?? null,
  };

  if (requirement.product === null) {
    return {
      ...evidence,
      missingQuantity: null,
      status: "UNKNOWN",
      reason: "PRODUCT_NOT_MAPPED",
    };
  }

  if (requirement.requiredQuantity === null) {
    return {
      ...evidence,
      missingQuantity: null,
      status: "UNKNOWN",
      reason: "REQUIRED_QUANTITY_MISSING",
    };
  }

  if (requirement.inventorySnapshot === null) {
    return {
      ...evidence,
      missingQuantity: null,
      status: "UNKNOWN",
      reason: "INVENTORY_SNAPSHOT_MISSING",
    };
  }

  const missingQuantity =
    Math.max(
      toQuantitySteps(requirement.requiredQuantity) -
        toQuantitySteps(requirement.inventorySnapshot.availableQuantity),
      0,
    ) / QUANTITY_SCALE;

  if (missingQuantity > 0) {
    return {
      ...evidence,
      missingQuantity,
      status: "SHORTAGE",
      reason: "INSUFFICIENT_QUANTITY",
    };
  }

  return {
    ...evidence,
    missingQuantity,
    status: "READY",
    reason: "SUFFICIENT_QUANTITY",
  };
}

function normalizeNullableQuantity(quantity: number | null): number | null {
  return quantity === null ? null : toQuantitySteps(quantity) / QUANTITY_SCALE;
}

function toQuantitySteps(quantity: number): number {
  return Math.round(quantity * QUANTITY_SCALE);
}

function aggregateReadiness(
  requirements: readonly RequirementAssessment[],
): ReadinessStatus {
  if (requirements.some(({ status }) => status === "SHORTAGE")) {
    return "SHORTAGE";
  }

  if (requirements.some(({ status }) => status === "UNKNOWN")) {
    return "UNKNOWN";
  }

  return "READY";
}
