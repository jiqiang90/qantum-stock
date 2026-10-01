import { describe, expect, it } from "vitest";

import {
  type ProductReference,
  type ReadinessPolicy,
  type RequirementEvidenceInput,
  StandardReadinessPolicy,
} from "./readiness";

const mappedProduct: ProductReference = {
  id: "product-fire-collar",
  productCode: "DEMO-SC-100",
  name: "SampleShield SC-100 Fire Collar",
  canonicalUnit: "each",
};

const policy: ReadinessPolicy = new StandardReadinessPolicy();

function requirement(
  overrides: Partial<RequirementEvidenceInput> = {},
): RequirementEvidenceInput {
  return {
    id: "requirement-fire-collar",
    description: "Install fire collars to service penetrations",
    product: mappedProduct,
    requiredQuantity: 10,
    inventorySnapshot: {
      availableQuantity: 12,
      capturedAt: "2026-10-01T21:00:00.000Z",
    },
    ...overrides,
  };
}

describe("StandardReadinessPolicy", () => {
  it("marks a non-empty Work Package ready when every requirement is satisfied", () => {
    const result = policy.assess([
      requirement(),
      requirement({
        id: "requirement-fire-compound",
        description: "Apply fire compound to the remaining openings",
        product: {
          id: "product-fire-compound",
          productCode: "DEMO-FC-20",
          name: "SampleCompound FC-20 Fire Compound",
          canonicalUnit: "kg",
        },
        requiredQuantity: 2.5,
        inventorySnapshot: {
          availableQuantity: 2.5,
          capturedAt: "2026-10-01T21:05:00.000Z",
        },
      }),
    ]);

    expect(result.status).toBe("READY");
    expect(result.reason).toBeNull();
    expect(result.requirements).toEqual([
      expect.objectContaining({
        requirementId: "requirement-fire-collar",
        status: "READY",
        reason: "SUFFICIENT_QUANTITY",
        requiredQuantity: 10,
        availableQuantity: 12,
        missingQuantity: 0,
      }),
      expect.objectContaining({
        requirementId: "requirement-fire-compound",
        status: "READY",
        reason: "SUFFICIENT_QUANTITY",
        requiredQuantity: 2.5,
        availableQuantity: 2.5,
        missingQuantity: 0,
      }),
    ]);
  });

  it("marks a known deficit as a shortage and reports the decimal quantity missing", () => {
    const result = policy.assess([
      requirement({
        requiredQuantity: 3.75,
        inventorySnapshot: {
          availableQuantity: 1.25,
          capturedAt: "2026-10-01T21:00:00.000Z",
        },
      }),
    ]);

    expect(result.status).toBe("SHORTAGE");
    expect(result.requirements[0]).toEqual({
      requirementId: "requirement-fire-collar",
      description: "Install fire collars to service penetrations",
      product: mappedProduct,
      requiredQuantity: 3.75,
      availableQuantity: 1.25,
      missingQuantity: 2.5,
      inventoryCapturedAt: "2026-10-01T21:00:00.000Z",
      status: "SHORTAGE",
      reason: "INSUFFICIENT_QUANTITY",
    });
  });

  it("treats quantities equal to three decimal places as ready", () => {
    const result = policy.assess([
      requirement({
        requiredQuantity: 0.1 + 0.2,
        inventorySnapshot: {
          availableQuantity: 0.3,
          capturedAt: "2026-10-01T21:00:00.000Z",
        },
      }),
    ]);

    expect(result.status).toBe("READY");
    expect(result.requirements[0]).toEqual(
      expect.objectContaining({
        status: "READY",
        reason: "SUFFICIENT_QUANTITY",
        requiredQuantity: 0.3,
        availableQuantity: 0.3,
        missingQuantity: 0,
      }),
    );
  });

  it("reports a decimal shortage to three decimal places", () => {
    const result = policy.assess([
      requirement({
        requiredQuantity: 0.3,
        inventorySnapshot: {
          availableQuantity: 0.1,
          capturedAt: "2026-10-01T21:00:00.000Z",
        },
      }),
    ]);

    expect(result.status).toBe("SHORTAGE");
    expect(result.requirements[0]?.missingQuantity).toBe(0.2);
  });

  it("gives a confirmed shortage precedence while retaining unknown evidence", () => {
    const result = policy.assess([
      requirement({
        id: "requirement-confirmed-shortage",
        requiredQuantity: 10,
        inventorySnapshot: {
          availableQuantity: 2,
          capturedAt: "2026-10-01T21:00:00.000Z",
        },
      }),
      requirement({
        id: "requirement-unknown-product",
        product: null,
        requiredQuantity: null,
      }),
    ]);

    expect(result.status).toBe("SHORTAGE");
    expect(result.requirements).toEqual([
      expect.objectContaining({
        requirementId: "requirement-confirmed-shortage",
        status: "SHORTAGE",
        reason: "INSUFFICIENT_QUANTITY",
        missingQuantity: 8,
      }),
      expect.objectContaining({
        requirementId: "requirement-unknown-product",
        status: "UNKNOWN",
        reason: "PRODUCT_NOT_MAPPED",
        availableQuantity: null,
        missingQuantity: null,
        inventoryCapturedAt: null,
      }),
    ]);
  });

  it.each([
    {
      name: "missing Product mapping",
      input: requirement({
        product: null,
        requiredQuantity: null,
        inventorySnapshot: null,
      }),
      reason: "PRODUCT_NOT_MAPPED",
    },
    {
      name: "missing required quantity",
      input: requirement({
        requiredQuantity: null,
      }),
      reason: "REQUIRED_QUANTITY_MISSING",
    },
    {
      name: "missing Inventory Snapshot",
      input: requirement({ inventorySnapshot: null }),
      reason: "INVENTORY_SNAPSHOT_MISSING",
    },
  ] as const)(
    "marks $name as unknown with its canonical reason",
    ({ input, reason }) => {
      const result = policy.assess([input]);

      expect(result.status).toBe("UNKNOWN");
      expect(result.requirements[0]).toEqual(
        expect.objectContaining({
          status: "UNKNOWN",
          reason,
          missingQuantity: null,
        }),
      );

      if (reason === "REQUIRED_QUANTITY_MISSING") {
        expect(result.requirements[0]).toEqual(
          expect.objectContaining({
            availableQuantity: 12,
            inventoryCapturedAt: "2026-10-01T21:00:00.000Z",
          }),
        );
      }
    },
  );

  it("gives unknown evidence precedence over otherwise ready requirements", () => {
    const result = policy.assess([
      requirement({ id: "requirement-ready" }),
      requirement({
        id: "requirement-missing-snapshot",
        inventorySnapshot: null,
      }),
    ]);

    expect(result.status).toBe("UNKNOWN");
    expect(result.requirements.map(({ status }) => status)).toEqual([
      "READY",
      "UNKNOWN",
    ]);
  });

  it("does not treat a Work Package with no requirements as ready", () => {
    expect(policy.assess([])).toEqual({
      status: "UNKNOWN",
      reason: "NO_REQUIREMENTS",
      requirements: [],
    });
  });

  it("preserves zero as known evidence", () => {
    const result = policy.assess([
      requirement({
        id: "requirement-zero-demand",
        requiredQuantity: 0,
        inventorySnapshot: {
          availableQuantity: 0,
          capturedAt: "2026-10-01T21:00:00.000Z",
        },
      }),
      requirement({
        id: "requirement-zero-available",
        requiredQuantity: 3,
        inventorySnapshot: {
          availableQuantity: 0,
          capturedAt: "2026-10-01T21:05:00.000Z",
        },
      }),
    ]);

    expect(result.status).toBe("SHORTAGE");
    expect(result.requirements).toEqual([
      expect.objectContaining({
        requirementId: "requirement-zero-demand",
        status: "READY",
        reason: "SUFFICIENT_QUANTITY",
        availableQuantity: 0,
        missingQuantity: 0,
      }),
      expect.objectContaining({
        requirementId: "requirement-zero-available",
        status: "SHORTAGE",
        reason: "INSUFFICIENT_QUANTITY",
        availableQuantity: 0,
        missingQuantity: 3,
      }),
    ]);
  });
});
