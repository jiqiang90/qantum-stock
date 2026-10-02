import { describe, expect, it } from "vitest";

import type { ProductEvidence, ProductListFilters } from "./product-model";
import type { ProductRepository } from "./product-repository";
import { ProductService } from "./product-service";

const allFilters: ProductListFilters = {
  query: "",
  usage: "all",
  inventory: "all",
};

function product(
  overrides: Partial<ProductEvidence> &
    Pick<ProductEvidence, "id" | "productCode" | "name">,
): ProductEvidence {
  return {
    canonicalUnit: "each",
    category: "Fire protection product",
    manufacturer: "Northstar Passive Systems",
    supplierProductCode: "NPS-DEFAULT",
    variant: "Standard",
    description: "Synthetic Product used by the Product service tests.",
    inventorySnapshot: null,
    usages: [],
    ...overrides,
  };
}

const collar = product({
  id: "product-collar",
  productCode: "SC-100",
  name: "Fire Collar",
  inventorySnapshot: {
    availableQuantity: 4,
    capturedAt: "2026-10-02T00:00:00Z",
  },
  usages: [
    {
      requirementId: "requirement-collar-one",
      position: 1,
      description: "Collar at service penetration",
      requiredQuantity: 2,
      workPackage: {
        id: "work-package-a",
        name: "Level 1 services",
        plannedDate: "2026-10-08",
      },
    },
    {
      requirementId: "requirement-collar-two",
      position: 2,
      description: "Additional collar in the same Work Package",
      requiredQuantity: 1,
      workPackage: {
        id: "work-package-a",
        name: "Level 1 services",
        plannedDate: "2026-10-08",
      },
    },
    {
      requirementId: "requirement-collar-three",
      position: 1,
      description: "Collar for riser work",
      requiredQuantity: 3,
      workPackage: {
        id: "work-package-b",
        name: "Riser works",
        plannedDate: "2026-10-09",
      },
    },
  ],
});

const sealant = product({
  id: "product-sealant",
  productCode: "IS-310",
  name: "Intumescent Sealant",
  canonicalUnit: "cartridge",
  inventorySnapshot: {
    availableQuantity: 0,
    capturedAt: "2026-10-02T00:00:00Z",
  },
  usages: [
    {
      requirementId: "requirement-sealant",
      position: 1,
      description: "Seal service opening",
      requiredQuantity: 6,
      workPackage: {
        id: "work-package-c",
        name: "Plant room opening",
        plannedDate: "2026-10-10",
      },
    },
  ],
});

const unusedProduct = product({
  id: "product-unused",
  productCode: "AA-001",
  name: "Unused Fire Board",
});

class StubProductRepository implements ProductRepository {
  constructor(private readonly products: readonly ProductEvidence[]) {}

  list(): Promise<readonly ProductEvidence[]> {
    return Promise.resolve(this.products);
  }

  findById(id: string): Promise<ProductEvidence | null> {
    return Promise.resolve(
      this.products.find((candidate) => candidate.id === id) ?? null,
    );
  }
}

function createService(
  products: readonly ProductEvidence[] = [collar, sealant, unusedProduct],
) {
  return new ProductService(new StubProductRepository(products));
}

describe("ProductService", () => {
  it("searches Product Code and name case-insensitively after trimming", async () => {
    const service = createService();

    await expect(
      service.list({ ...allFilters, query: "  sc-100 " }),
    ).resolves.toEqual([expect.objectContaining({ id: "product-collar" })]);
    await expect(
      service.list({ ...allFilters, query: "INTUMESCENT" }),
    ).resolves.toEqual([expect.objectContaining({ id: "product-sealant" })]);
  });

  it("filters Products by whether they are used by any requirement", async () => {
    const service = createService();

    const used = await service.list({ ...allFilters, usage: "used" });
    const unused = await service.list({ ...allFilters, usage: "unused" });

    expect(used.map(({ id }) => id)).toEqual([
      "product-sealant",
      "product-collar",
    ]);
    expect(unused.map(({ id }) => id)).toEqual(["product-unused"]);
  });

  it("treats numeric zero as known Inventory evidence", async () => {
    const service = createService();

    const known = await service.list({ ...allFilters, inventory: "known" });
    const unknown = await service.list({
      ...allFilters,
      inventory: "unknown",
    });

    expect(known.map(({ id }) => id)).toEqual([
      "product-sealant",
      "product-collar",
    ]);
    expect(known[0]?.inventorySnapshot?.availableQuantity).toBe(0);
    expect(unknown.map(({ id }) => id)).toEqual(["product-unused"]);
  });

  it("combines search, usage, and Inventory filters", async () => {
    const result = await createService().list({
      query: "fire",
      usage: "used",
      inventory: "known",
    });

    expect(result.map(({ id }) => id)).toEqual(["product-collar"]);
  });

  it("sorts by Product Code and then ID for deterministic results", async () => {
    const firstDuplicate = product({
      id: "product-a",
      productCode: "ZZ-999",
      name: "First duplicate",
    });
    const secondDuplicate = product({
      id: "product-b",
      productCode: "ZZ-999",
      name: "Second duplicate",
    });
    const service = createService([secondDuplicate, collar, firstDuplicate]);

    const result = await service.list(allFilters);

    expect(result.map(({ id }) => id)).toEqual([
      "product-collar",
      "product-a",
      "product-b",
    ]);
  });

  it("counts unique referencing Work Packages without hiding requirements", async () => {
    const service = createService([collar]);

    const list = await service.list(allFilters);
    const detail = await service.findById("product-collar");

    expect(list[0]?.referencingWorkPackageCount).toBe(2);
    expect(detail?.usages.map(({ requirementId }) => requirementId)).toEqual([
      "requirement-collar-one",
      "requirement-collar-two",
      "requirement-collar-three",
    ]);
  });

  it("returns null when the Product is absent", async () => {
    await expect(
      createService().findById("missing-product"),
    ).resolves.toBeNull();
  });
});
