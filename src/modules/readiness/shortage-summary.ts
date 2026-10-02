import { formatNumber } from "@/lib/presentation/formatters";
import type {
  AggregateProductAssessment,
  ReadinessReason,
  RequirementAssessment,
  WorkPackageReadiness,
  WorkPackageSelectionAssessment,
} from "./readiness-model";

const reasonDescriptions: Record<ReadinessReason, string> = {
  NO_REQUIREMENTS: "No requirements recorded",
  PRODUCT_NOT_MAPPED: "Product not mapped",
  REQUIRED_QUANTITY_MISSING: "Required quantity missing",
  INVENTORY_SNAPSHOT_MISSING: "Inventory snapshot missing",
  INSUFFICIENT_QUANTITY: "Insufficient quantity",
  SUFFICIENT_QUANTITY: "Quantity available",
};

export interface WorkPackageSummaryInput {
  readonly item: WorkPackageReadiness;
  readonly selectedRequirementIds: readonly string[];
  readonly note?: string;
}

export interface CombinedSummaryWorkPackage {
  readonly id: string;
  readonly name: string;
  readonly plannedDate: string;
}

export interface CombinedSummaryInput {
  readonly assessment: WorkPackageSelectionAssessment;
  readonly workPackages: readonly CombinedSummaryWorkPackage[];
}

export function buildWorkPackageShortageSummary(
  input: WorkPackageSummaryInput,
): string {
  assertUnique(input.selectedRequirementIds);

  const requirementsById = new Map(
    input.item.assessment.requirements.map((requirement) => [
      requirement.requirementId,
      requirement,
    ]),
  );
  const selectedIds = new Set(input.selectedRequirementIds);

  for (const id of selectedIds) {
    const requirement = requirementsById.get(id);
    if (requirement === undefined) {
      throw new Error(
        "Selected requirement is not available for this Work Package.",
      );
    }
    if (requirement.status === "READY") {
      throw new Error("Only blocking requirements can be summarized.");
    }
  }

  const selectedRequirements = input.item.assessment.requirements.filter(
    ({ requirementId }) => selectedIds.has(requirementId),
  );
  if (selectedRequirements.length === 0) {
    throw new Error("Select at least one blocking requirement.");
  }

  const lines = [
    "MATERIAL SHORTAGE SUMMARY",
    `Work Package: ${input.item.workPackage.name}`,
    `Planned date: ${input.item.workPackage.plannedDate}`,
    `Readiness: ${input.item.assessment.status}`,
    "Blocking requirements:",
    ...selectedRequirements.flatMap(formatRequirement),
  ];
  const note = input.note?.trim();
  if (note !== undefined && note.length > 500) {
    throw new Error("Note must be 500 characters or fewer.");
  }
  if (note !== undefined && note.length > 0) {
    lines.push("", `Note: ${note}`);
  }

  return lines.join("\n");
}

export function buildCombinedShortageSummary(
  input: CombinedSummaryInput,
): string {
  if (input.assessment.status === "READY") {
    throw new Error("Combined availability has no blocking evidence.");
  }

  const workPackagesById = new Map(
    input.workPackages.map((workPackage) => [workPackage.id, workPackage]),
  );
  const orderedWorkPackages = input.assessment.workPackageIds.map((id) => {
    const workPackage = workPackagesById.get(id);
    if (workPackage === undefined) {
      throw new Error("Combined summary Work Package evidence is incomplete.");
    }
    return workPackage;
  });

  const blockingProducts = input.assessment.products.filter(
    ({ status }) => status !== "READY",
  );
  const blockingLines = blockingProducts.flatMap(formatAggregateProduct);

  if (input.assessment.unmappedRequirementCount > 0) {
    blockingLines.push(
      "- [UNKNOWN] Unmapped Product requirements",
      "  Product code: Unknown",
      "  Required: Unknown",
      "  Available: Unknown",
      "  Missing: Unknown",
      "  Inventory captured: Unknown",
      "  Reason: Product not mapped",
    );
  }
  if (input.assessment.workPackagesWithoutRequirements > 0) {
    blockingLines.push(
      "- [UNKNOWN] Work Packages without Product Requirements",
      "  Product code: Unknown",
      "  Required: Unknown",
      "  Available: Unknown",
      "  Missing: Unknown",
      "  Inventory captured: Unknown",
      "  Reason: No requirements recorded",
    );
  }
  if (blockingLines.length === 0) {
    throw new Error("Combined availability has no blocking evidence.");
  }

  return [
    "COMBINED MATERIAL SHORTAGE SUMMARY",
    "Work Packages:",
    ...orderedWorkPackages.map(
      ({ name, plannedDate }) => `- ${name} — ${plannedDate}`,
    ),
    `Combined availability: ${input.assessment.status}`,
    "Blocking products:",
    ...blockingLines,
  ].join("\n");
}

function assertUnique(ids: readonly string[]): void {
  if (new Set(ids).size !== ids.length) {
    throw new Error("Selected requirements must be unique.");
  }
}

function formatRequirement(
  requirement: RequirementAssessment,
): readonly string[] {
  const unit = requirement.product?.canonicalUnit ?? null;
  return [
    `- [${requirement.status}] ${requirement.description}`,
    `  Product: ${requirement.product?.name ?? "Unknown"}`,
    `  Product code: ${requirement.product?.productCode ?? "Unknown"}`,
    `  Required: ${formatQuantity(requirement.requiredQuantity, unit)}`,
    `  Available: ${formatQuantity(requirement.availableQuantity, unit)}`,
    `  Missing: ${formatQuantity(requirement.missingQuantity, unit)}`,
    `  Inventory captured: ${formatIsoTimestamp(requirement.inventoryCapturedAt)}`,
    `  Reason: ${reasonDescriptions[requirement.reason]}`,
  ];
}

function formatAggregateProduct(
  product: AggregateProductAssessment,
): readonly string[] {
  const unit = product.product.canonicalUnit;
  const knownRequired = formatQuantity(product.knownRequiredQuantity, unit);
  const required = product.requiredQuantityIncomplete
    ? product.knownRequiredQuantity > 0
      ? `At least ${knownRequired}`
      : "Unknown"
    : knownRequired;

  return [
    `- [${product.status}] ${product.product.name}`,
    `  Product code: ${product.product.productCode}`,
    `  Required: ${required}`,
    `  Available: ${formatQuantity(product.availableQuantity, unit)}`,
    `  Missing: ${formatQuantity(product.missingQuantity, unit)}`,
    `  Inventory captured: ${formatIsoTimestamp(product.inventoryCapturedAt)}`,
    `  Reason: ${reasonDescriptions[product.reason]}`,
  ];
}

function formatQuantity(value: number | null, unit: string | null): string {
  return value === null || unit === null
    ? "Unknown"
    : `${formatNumber(value)} ${unit}`;
}

function formatIsoTimestamp(value: string | null): string {
  return value === null ? "Unknown" : new Date(value).toISOString();
}
