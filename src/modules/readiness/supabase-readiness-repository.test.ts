import { describe, expect, it } from "vitest";

import { mapReadinessRow } from "./supabase-readiness-repository";

describe("mapReadinessRow", () => {
  it("maps Product evidence and selects the latest snapshot by time then ID", () => {
    const result = mapReadinessRow({
      id: "work-package-1",
      name: "Concrete floor partial shortage",
      planned_date: "2026-10-08",
      solution: {
        id: "solution-1",
        internal_code: "0375",
        supplier_ref_code: "V15.1-21SFR00018-130-D",
        supplier: "Ryanfire",
        orientation: "Wall",
        substrate: "FR plasterboard, FR plasterboard wall (2 layers 13mm)",
        service_classification: "Insulated Pipe",
        service_type: "Copper Pipe  - 50mm Fibreglass",
        service_size: "Ø32mm",
        integrity: "60",
        insulation: "60",
        service_type_option: "Insulated Copper Pipe",
        substrate_option: "Plasterboard Wall",
      },
      requirements: [
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
                {
                  id: "snapshot-a",
                  available_quantity: 14,
                  captured_at: "2026-10-01T21:00:00Z",
                },
                {
                  id: "snapshot-c",
                  available_quantity: 8,
                  captured_at: "2026-10-01T21:00:00Z",
                },
                {
                  id: "snapshot-b",
                  available_quantity: 20,
                  captured_at: "2026-09-30T21:00:00Z",
                },
              ],
            },
          },
        },
      ],
    });

    expect(result).toEqual({
      id: "work-package-1",
      name: "Concrete floor partial shortage",
      plannedDate: "2026-10-08",
      solution: {
        id: "solution-1",
        internalCode: "0375",
        supplierRefCode: "V15.1-21SFR00018-130-D",
        supplier: "Ryanfire",
        orientation: "Wall",
        substrate: "FR plasterboard, FR plasterboard wall (2 layers 13mm)",
        serviceClassification: "Insulated Pipe",
        serviceType: "Copper Pipe  - 50mm Fibreglass",
        serviceSize: "Ø32mm",
        integrity: "60",
        insulation: "60",
        serviceTypeOption: "Insulated Copper Pipe",
        substrateOption: "Plasterboard Wall",
      },
      requirements: [
        {
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
        },
      ],
    });
  });

  it("orders requirements and preserves missing evidence and numeric zero", () => {
    const result = mapReadinessRow({
      id: "work-package-2",
      name: "Mixed evidence",
      planned_date: "2026-10-09",
      solution: {
        id: "solution-2",
        internal_code: "0334",
        supplier_ref_code: "V1.11-22SFR00038-146-E",
        supplier: "Ryanfire",
        orientation: "Wall",
        substrate: "FR plasterboard, FR plasterboard wall (1 layer 13mm)",
        service_classification: "Non-Combustible Pipe",
        service_type: "Copper Pipe",
        service_size: "Ø100mm",
        integrity: "60",
        insulation: "-",
        service_type_option: "Copper Pipe",
        substrate_option: "Plasterboard Wall",
      },
      requirements: [
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
                {
                  id: "snapshot-zero",
                  available_quantity: 0,
                  captured_at: "2026-10-02T00:00:00Z",
                },
              ],
            },
          },
        },
      ],
    });

    expect(result.requirements.map(({ id }) => id)).toEqual([
      "requirement-first",
      "requirement-later",
    ]);
    expect(result.requirements[0]?.inventorySnapshot?.availableQuantity).toBe(
      0,
    );
    expect(result.requirements[1]).toMatchObject({
      product: null,
      requiredQuantity: null,
      inventorySnapshot: null,
    });
    expect(result.solution.insulation).toBe("-");
  });
});
