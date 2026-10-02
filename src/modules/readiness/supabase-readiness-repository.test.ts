import { describe, expect, it } from "vitest";

import {
  mapReadinessRow,
  mapSelectionErrorCode,
  type ReadinessRow,
} from "./supabase-readiness-repository";

describe("mapReadinessRow", () => {
  it("keeps options distinct and maps their Product evidence", () => {
    const result = mapReadinessRow(
      row([
        option("option-alternative", "0999", []),
        option("option-selected", "0375", [
          {
            id: "requirement-1",
            position: 0,
            description: "Install collars",
            required_quantity: 12,
            solution_product: {
              product: {
                id: "product-1",
                product_code: "SC-100",
                name: "SC-100 Fire Collar",
                canonical_unit: "each",
                inventory_snapshots: [
                  snapshot("snapshot-a", 14, "2026-10-01T21:00:00Z"),
                  snapshot("snapshot-c", 8, "2026-10-01T21:00:00Z"),
                  snapshot("snapshot-b", 20, "2026-09-30T21:00:00Z"),
                ],
              },
            },
          },
        ]),
      ]),
    );

    expect(result.selectedSolutionOptionId).toBe("option-selected");
    expect(result.solutionOptions.map(({ id }) => id)).toEqual([
      "option-selected",
      "option-alternative",
    ]);
    expect(result.solutionOptions[0]?.requirements[0]).toEqual({
      id: "requirement-1",
      description: "Install collars",
      requiredQuantity: 12,
      product: {
        id: "product-1",
        productCode: "SC-100",
        name: "SC-100 Fire Collar",
        canonicalUnit: "each",
      },
      inventorySnapshot: {
        availableQuantity: 8,
        capturedAt: "2026-10-01T21:00:00Z",
      },
    });
  });

  it("orders requirements and preserves missing evidence and numeric zero", () => {
    const result = mapReadinessRow(
      row([
        option("option-selected", "0375", [
          {
            id: "requirement-later",
            position: 1,
            description: "Unmapped item",
            required_quantity: null,
            solution_product: null,
          },
          {
            id: "requirement-first",
            position: 0,
            description: "Known zero stock",
            required_quantity: 4,
            solution_product: {
              product: {
                id: "product-2",
                product_code: "PW-050",
                name: "PW-050 Firestop Pipe Wrap",
                canonical_unit: "roll",
                inventory_snapshots: [
                  snapshot("snapshot-zero", 0, "2026-10-02T00:00:00Z"),
                ],
              },
            },
          },
        ]),
      ]),
    );
    const selected = result.solutionOptions[0]!;

    expect(selected.requirements.map(({ id }) => id)).toEqual([
      "requirement-first",
      "requirement-later",
    ]);
    expect(selected.requirements[0]?.inventorySnapshot?.availableQuantity).toBe(
      0,
    );
    expect(selected.requirements[1]).toMatchObject({
      product: null,
      requiredQuantity: null,
      inventorySnapshot: null,
    });
    expect(selected.solution.insulation).toBe("-");
  });
});

describe("mapSelectionErrorCode", () => {
  it.each([
    ["42501", "unauthenticated"],
    ["22023", "invalid"],
    ["40001", "conflict"],
    ["XX000", "unavailable"],
    [undefined, "unavailable"],
  ] as const)("maps database code %s to %s", (code, status) => {
    expect(mapSelectionErrorCode(code)).toEqual({ status });
  });
});

function row(solutionOptions: ReadinessRow["solution_options"]): ReadinessRow {
  return {
    id: "work-package-1",
    name: "Concrete floor partial shortage",
    planned_date: "2026-10-08",
    selected_solution_option_id: "option-selected",
    solution_options: solutionOptions,
  };
}

function option(
  id: string,
  internalCode: string,
  requirements: ReadinessRow["solution_options"][number]["requirements"],
): ReadinessRow["solution_options"][number] {
  return {
    id,
    solution: {
      id: `solution-${internalCode}`,
      internal_code: internalCode,
      supplier_ref_code: `SUP-${internalCode}`,
      supplier: "Ryanfire",
      orientation: "Wall",
      substrate: "FR plasterboard, FR plasterboard wall (2 layers 13mm)",
      service_classification: "Insulated Pipe",
      service_type: "Copper Pipe - 50mm Fibreglass",
      service_size: "Ø32mm",
      integrity: "60",
      insulation: internalCode === "0375" ? "-" : "60",
      service_type_option: "Insulated Copper Pipe",
      substrate_option: "Plasterboard Wall",
    },
    requirements,
  };
}

function snapshot(id: string, quantity: number, capturedAt: string) {
  return {
    id,
    available_quantity: quantity,
    captured_at: capturedAt,
  };
}
