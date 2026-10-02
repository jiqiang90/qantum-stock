import type {
  ReadinessAssessment,
  ReadinessStatus,
  RequirementAssessment,
  RequirementEvidenceInput,
  WorkPackageReadiness,
  WorkPackageSelectionAssessment,
} from "./readiness-model";

const QUANTITY_SCALE = 1_000;

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

export function assessWorkPackageSelection(
  workPackages: readonly WorkPackageReadiness[],
): WorkPackageSelectionAssessment {
  const products = new Map<string, AggregateProductEvidence>();
  let unmappedRequirementCount = 0;
  let workPackagesWithoutRequirements = 0;

  for (const { assessment } of workPackages) {
    if (assessment.requirements.length === 0) {
      workPackagesWithoutRequirements += 1;
    }

    for (const requirement of assessment.requirements) {
      if (requirement.product === null) {
        unmappedRequirementCount += 1;
        continue;
      }

      const aggregate = products.get(requirement.product.id) ?? {
        product: requirement.product,
        knownRequiredSteps: 0,
        requiredQuantityIncomplete: false,
        availableQuantity: null,
        inventoryCapturedAt: null,
      };

      if (requirement.requiredQuantity === null) {
        aggregate.requiredQuantityIncomplete = true;
      } else {
        aggregate.knownRequiredSteps += toQuantitySteps(
          requirement.requiredQuantity,
        );
      }

      if (
        requirement.availableQuantity !== null &&
        requirement.inventoryCapturedAt !== null &&
        (aggregate.inventoryCapturedAt === null ||
          requirement.inventoryCapturedAt > aggregate.inventoryCapturedAt)
      ) {
        aggregate.availableQuantity = requirement.availableQuantity;
        aggregate.inventoryCapturedAt = requirement.inventoryCapturedAt;
      }

      products.set(requirement.product.id, aggregate);
    }
  }

  const productAssessments = [...products.values()]
    .map(assessAggregateProduct)
    .sort(
      (left, right) =>
        left.product.productCode.localeCompare(
          right.product.productCode,
          "en-NZ",
        ) || left.product.id.localeCompare(right.product.id, "en-NZ"),
    );

  return {
    status: aggregateSelectionReadiness(
      productAssessments,
      unmappedRequirementCount,
      workPackagesWithoutRequirements,
    ),
    workPackageIds: workPackages.map(({ workPackage }) => workPackage.id),
    products: productAssessments,
    unmappedRequirementCount,
    workPackagesWithoutRequirements,
  };
}

interface AggregateProductEvidence {
  readonly product: NonNullable<RequirementAssessment["product"]>;
  knownRequiredSteps: number;
  requiredQuantityIncomplete: boolean;
  availableQuantity: number | null;
  inventoryCapturedAt: string | null;
}

function assessAggregateProduct(
  evidence: AggregateProductEvidence,
): WorkPackageSelectionAssessment["products"][number] {
  const knownRequiredQuantity = evidence.knownRequiredSteps / QUANTITY_SCALE;
  const base = {
    product: evidence.product,
    knownRequiredQuantity,
    requiredQuantityIncomplete: evidence.requiredQuantityIncomplete,
    availableQuantity: normalizeNullableQuantity(evidence.availableQuantity),
    inventoryCapturedAt: evidence.inventoryCapturedAt,
  };

  if (evidence.availableQuantity === null) {
    return {
      ...base,
      missingQuantity: null,
      status: "UNKNOWN",
      reason: "INVENTORY_SNAPSHOT_MISSING",
    };
  }

  const missingQuantity =
    Math.max(
      evidence.knownRequiredSteps - toQuantitySteps(evidence.availableQuantity),
      0,
    ) / QUANTITY_SCALE;

  if (missingQuantity > 0) {
    return {
      ...base,
      missingQuantity,
      status: "SHORTAGE",
      reason: "INSUFFICIENT_QUANTITY",
    };
  }

  if (evidence.requiredQuantityIncomplete) {
    return {
      ...base,
      missingQuantity: null,
      status: "UNKNOWN",
      reason: "REQUIRED_QUANTITY_MISSING",
    };
  }

  return {
    ...base,
    missingQuantity: 0,
    status: "READY",
    reason: "SUFFICIENT_QUANTITY",
  };
}

function aggregateSelectionReadiness(
  products: WorkPackageSelectionAssessment["products"],
  unmappedRequirementCount: number,
  workPackagesWithoutRequirements: number,
): ReadinessStatus {
  if (products.some(({ status }) => status === "SHORTAGE")) {
    return "SHORTAGE";
  }

  if (
    unmappedRequirementCount > 0 ||
    workPackagesWithoutRequirements > 0 ||
    products.length === 0 ||
    products.some(({ status }) => status === "UNKNOWN")
  ) {
    return "UNKNOWN";
  }

  return "READY";
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
