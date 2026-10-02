import { describe, expect, it } from "vitest";

import type {
  RequirementAssessment,
  WorkPackageReadiness,
  WorkPackageSelectionAssessment,
} from "./readiness-model";
import {
  buildCombinedShortageSummary,
  buildWorkPackageShortageSummary,
} from "./shortage-summary";

const shortageId = "90000000-0000-0000-0000-000000000001";
const unknownId = "90000000-0000-0000-0000-000000000002";
const readyId = "90000000-0000-0000-0000-000000000003";

describe("buildWorkPackageShortageSummary", () => {
  it("builds deterministic evidence in requirement order and trims the note", () => {
    expect(
      buildWorkPackageShortageSummary({
        item: workPackageReadiness(),
        selectedRequirementIds: [unknownId, shortageId],
        note: "  Please confirm delivery.  ",
      }),
    ).toBe(`MATERIAL SHORTAGE SUMMARY
Work Package: Level 2 service riser firestopping
Planned date: 2026-10-08
Readiness: SHORTAGE
Blocking requirements:
- [SHORTAGE] Seal annular gaps
  Product: IS-310 Intumescent Sealant
  Product code: IS-310
  Required: 4 cartridge
  Available: 0 cartridge
  Missing: 4 cartridge
  Inventory captured: 2026-10-02T00:00:00.000Z
  Reason: Insufficient quantity
- [UNKNOWN] Provide unresolved accessory
  Product: Unknown
  Product code: Unknown
  Required: Unknown
  Available: Unknown
  Missing: Unknown
  Inventory captured: Unknown
  Reason: Product not mapped

Note: Please confirm delivery.`);
  });

  it("rejects duplicate, unrelated, and ready requirement selections", () => {
    const item = workPackageReadiness();

    expect(() =>
      buildWorkPackageShortageSummary({
        item,
        selectedRequirementIds: [shortageId, shortageId],
      }),
    ).toThrow("Selected requirements must be unique.");
    expect(() =>
      buildWorkPackageShortageSummary({
        item,
        selectedRequirementIds: ["90000000-0000-0000-0000-000000000099"],
      }),
    ).toThrow("Selected requirement is not available for this Work Package.");
    expect(() =>
      buildWorkPackageShortageSummary({
        item,
        selectedRequirementIds: [readyId],
      }),
    ).toThrow("Only blocking requirements can be summarized.");
  });
});

describe("buildCombinedShortageSummary", () => {
  it("builds combined shortage and incomplete demand without READY products", () => {
    const assessment: WorkPackageSelectionAssessment = {
      status: "SHORTAGE",
      workPackageIds: [
        "20000000-0000-0000-0000-000000000001",
        "20000000-0000-0000-0000-000000000002",
      ],
      products: [
        aggregateProduct("SHORTAGE"),
        {
          ...aggregateProduct("UNKNOWN"),
          product: {
            id: "30000000-0000-0000-0000-000000000002",
            productCode: "CP-200",
            name: "CP-200 Cable Firestop Pillow Pack",
            canonicalUnit: "pack",
          },
          knownRequiredQuantity: 3,
          requiredQuantityIncomplete: true,
          availableQuantity: null,
          missingQuantity: null,
          inventoryCapturedAt: null,
          reason: "INVENTORY_SNAPSHOT_MISSING",
        },
        aggregateProduct("READY"),
      ],
      unmappedRequirementCount: 0,
      workPackagesWithoutRequirements: 0,
    };

    expect(
      buildCombinedShortageSummary({
        assessment,
        workPackages: [
          {
            id: "20000000-0000-0000-0000-000000000001",
            name: "Level 2 service riser firestopping",
            plannedDate: "2026-10-08",
          },
          {
            id: "20000000-0000-0000-0000-000000000002",
            name: "Level 3 east riser firestopping",
            plannedDate: "2026-10-09",
          },
        ],
      }),
    ).toBe(`COMBINED MATERIAL SHORTAGE SUMMARY
Work Packages:
- Level 2 service riser firestopping — 2026-10-08
- Level 3 east riser firestopping — 2026-10-09
Combined availability: SHORTAGE
Blocking products:
- [SHORTAGE] IS-310 Intumescent Sealant
  Product code: IS-310
  Required: 10 cartridge
  Available: 8 cartridge
  Missing: 2 cartridge
  Inventory captured: 2026-10-02T00:00:00.000Z
  Reason: Insufficient quantity
- [UNKNOWN] CP-200 Cable Firestop Pillow Pack
  Product code: CP-200
  Required: At least 3 pack
  Available: Unknown
  Missing: Unknown
  Inventory captured: Unknown
  Reason: Inventory snapshot missing`);
  });
});

function workPackageReadiness(): WorkPackageReadiness {
  const requirements: readonly RequirementAssessment[] = [
    {
      requirementId: shortageId,
      description: "Seal annular gaps",
      product: {
        id: "30000000-0000-0000-0000-000000000001",
        productCode: "IS-310",
        name: "IS-310 Intumescent Sealant",
        canonicalUnit: "cartridge",
      },
      requiredQuantity: 4,
      availableQuantity: 0,
      missingQuantity: 4,
      inventoryCapturedAt: "2026-10-02T00:00:00Z",
      status: "SHORTAGE",
      reason: "INSUFFICIENT_QUANTITY",
    },
    {
      requirementId: unknownId,
      description: "Provide unresolved accessory",
      product: null,
      requiredQuantity: null,
      availableQuantity: null,
      missingQuantity: null,
      inventoryCapturedAt: null,
      status: "UNKNOWN",
      reason: "PRODUCT_NOT_MAPPED",
    },
    {
      requirementId: readyId,
      description: "Install available collar",
      product: {
        id: "30000000-0000-0000-0000-000000000003",
        productCode: "SC-040",
        name: "SC-040 Fire Collar",
        canonicalUnit: "each",
      },
      requiredQuantity: 1,
      availableQuantity: 10,
      missingQuantity: 0,
      inventoryCapturedAt: "2026-10-02T00:00:00Z",
      status: "READY",
      reason: "SUFFICIENT_QUANTITY",
    },
  ];
  const option = {
    id: "70000000-0000-0000-0000-000000000001",
    solution: {
      id: "10000000-0000-0000-0000-000000000001",
      internalCode: "0444",
      supplierRefCode: "V21.2-21SFR00051-98-A",
      supplier: "Ryanfire",
      orientation: "Wall",
      substrate: "Plasterboard Wall",
      serviceClassification: "Pipe",
      serviceType: "PVC Pipe",
      serviceSize: "Ø40mm",
      integrity: "60",
      insulation: "60",
      serviceTypeOption: "PVC Pipe Ø40mm",
      substrateOption: "Plasterboard Wall",
    },
    requirements: [],
  };

  return {
    workPackage: {
      id: "20000000-0000-0000-0000-000000000001",
      name: "Level 2 service riser firestopping",
      plannedDate: "2026-10-08",
      selectedSolutionOptionId: option.id,
      solutionOptions: [option],
    },
    selectedOption: option,
    assessment: { status: "SHORTAGE", reason: null, requirements },
    solutionOptions: [
      {
        option,
        assessment: { status: "SHORTAGE", reason: null, requirements },
        selected: true,
      },
    ],
  };
}

function aggregateProduct(
  status: "READY" | "SHORTAGE" | "UNKNOWN",
): WorkPackageSelectionAssessment["products"][number] {
  return {
    product: {
      id: "30000000-0000-0000-0000-000000000001",
      productCode: "IS-310",
      name: "IS-310 Intumescent Sealant",
      canonicalUnit: "cartridge",
    },
    knownRequiredQuantity: status === "READY" ? 1 : 10,
    requiredQuantityIncomplete: false,
    availableQuantity: 8,
    missingQuantity: status === "SHORTAGE" ? 2 : 0,
    inventoryCapturedAt: "2026-10-02T00:00:00Z",
    status,
    reason:
      status === "SHORTAGE"
        ? "INSUFFICIENT_QUANTITY"
        : status === "UNKNOWN"
          ? "REQUIRED_QUANTITY_MISSING"
          : "SUFFICIENT_QUANTITY",
  };
}
