import { describe, expect, it } from "vitest";

import { mapProductRow, type ProductRow } from "./supabase-product-repository";

describe("mapProductRow", () => {
  it("preserves Product-owned catalogue attributes", () => {
    const row: ProductRow & {
      readonly category: string;
      readonly description: string;
      readonly manufacturer: string;
      readonly supplier_product_code: string;
      readonly variant: string;
    } = {
      id: "product-one",
      product_code: "SC-100",
      name: "SC-100 Fire Collar",
      canonical_unit: "each",
      category: "Fire collar",
      description: "Rigid collar for combustible service penetrations.",
      manufacturer: "Northstar Passive Systems",
      supplier_product_code: "NPS-SC100",
      variant: "100 mm collar",
      inventory_snapshots: [],
      solution_products: [],
    };

    expect(mapProductRow(row)).toMatchObject({
      category: "Fire collar",
      description: "Rigid collar for combustible service penetrations.",
      manufacturer: "Northstar Passive Systems",
      supplierProductCode: "NPS-SC100",
      variant: "100 mm collar",
    });
  });

  it("selects the latest snapshot by captured time then ID and preserves zero", () => {
    const result = mapProductRow({
      id: "product-one",
      product_code: "SC-100",
      name: "SC-100 Fire Collar",
      category: "Fire collar",
      manufacturer: "Northstar Passive Systems",
      supplier_product_code: "NPS-SC100",
      variant: "100 mm collar",
      description: "Rigid collar for combustible pipe penetrations.",
      canonical_unit: "each",
      inventory_snapshots: [
        {
          id: "snapshot-a",
          available_quantity: 7,
          captured_at: "2026-10-02T00:00:00Z",
        },
        {
          id: "snapshot-c",
          available_quantity: 0,
          captured_at: "2026-10-02T00:00:00Z",
        },
        {
          id: "snapshot-b",
          available_quantity: 12,
          captured_at: "2026-10-01T00:00:00Z",
        },
      ],
      solution_products: [],
    });

    expect(result).toEqual({
      id: "product-one",
      productCode: "SC-100",
      name: "SC-100 Fire Collar",
      category: "Fire collar",
      manufacturer: "Northstar Passive Systems",
      supplierProductCode: "NPS-SC100",
      variant: "100 mm collar",
      description: "Rigid collar for combustible pipe penetrations.",
      canonicalUnit: "each",
      inventorySnapshot: {
        availableQuantity: 0,
        capturedAt: "2026-10-02T00:00:00Z",
      },
      usages: [],
    });
  });

  it("orders every usage deterministically and preserves missing evidence", () => {
    const result = mapProductRow({
      id: "product-two",
      product_code: "IS-310",
      name: "IS-310 Fire Sealant",
      category: "Sealant",
      manufacturer: "Northstar Passive Systems",
      supplier_product_code: "NPS-IS310",
      variant: "310 ml cartridge",
      description: "Sealant for joints and annular gaps.",
      canonical_unit: "cartridge",
      inventory_snapshots: [],
      solution_products: [
        {
          requirements: [
            {
              id: "requirement-z",
              position: 2,
              description: "Later position",
              required_quantity: null,
              solution_option: {
                id: "option-a",
                work_package: {
                  id: "work-package-a",
                  name: "Alpha works",
                  planned_date: "2026-10-08",
                  selected_solution_option_id: "option-a",
                },
              },
            },
            {
              id: "requirement-b",
              position: 1,
              description: "Same position, later ID",
              required_quantity: 3,
              solution_option: {
                id: "option-a",
                work_package: {
                  id: "work-package-a",
                  name: "Alpha works",
                  planned_date: "2026-10-08",
                  selected_solution_option_id: "option-a",
                },
              },
            },
          ],
        },
        {
          requirements: [
            {
              id: "requirement-a",
              position: 1,
              description: "Same position, earlier ID",
              required_quantity: 2,
              solution_option: {
                id: "option-a",
                work_package: {
                  id: "work-package-a",
                  name: "Alpha works",
                  planned_date: "2026-10-08",
                  selected_solution_option_id: "option-a",
                },
              },
            },
            {
              id: "requirement-earliest",
              position: 9,
              description: "Earlier planned Work Package",
              required_quantity: 1,
              solution_option: {
                id: "option-b",
                work_package: {
                  id: "work-package-b",
                  name: "Beta works",
                  planned_date: "2026-10-07",
                  selected_solution_option_id: "option-b",
                },
              },
            },
            {
              id: "requirement-unselected-option",
              position: 0,
              description: "Alternative plan only",
              required_quantity: 99,
              solution_option: {
                id: "option-a-alternative",
                work_package: {
                  id: "work-package-a",
                  name: "Alpha works",
                  planned_date: "2026-10-08",
                  selected_solution_option_id: "option-a",
                },
              },
            },
          ],
        },
      ],
    });

    expect(result.inventorySnapshot).toBeNull();
    expect(result.usages.map(({ requirementId }) => requirementId)).toEqual([
      "requirement-earliest",
      "requirement-a",
      "requirement-b",
      "requirement-z",
    ]);
    expect(result.usages[3]).toMatchObject({
      requiredQuantity: null,
      workPackage: {
        id: "work-package-a",
        name: "Alpha works",
        plannedDate: "2026-10-08",
      },
    });
  });
});
