import { describe, expect, it } from "vitest";

import type { WorkPackageEvidence } from "./readiness-model";
import type { ReadinessRepository } from "./readiness-repository";
import { ReadinessService } from "./readiness-service";

function workPackage(id: string): WorkPackageEvidence {
  return {
    id,
    name: `Work Package ${id}`,
    plannedDate: "2026-10-08",
    solution: {
      id: `solution-${id}`,
      internalCode: "0444",
      supplierRefCode: "V21.2-21SFR00051-98-A",
      supplier: "Ryanfire",
      orientation: "Wall",
      substrate: "FR plasterboard, FR plasterboard wall (1 layer 13mm)",
      serviceClassification: "Combustible Pipe",
      serviceType: "PVC Pipe",
      serviceSize: "Ø40mm",
      integrity: "60",
      insulation: "60",
      serviceTypeOption: "PVC Pipe",
      substrateOption: "Plasterboard Wall",
    },
    requirements: [
      {
        id: `requirement-${id}`,
        description: `Requirement ${id}`,
        product: {
          id: `product-${id}`,
          productCode: `P-${id}`,
          name: `Product ${id}`,
          canonicalUnit: "each",
        },
        requiredQuantity: 1,
        inventorySnapshot: {
          availableQuantity: 1,
          capturedAt: "2026-10-02T00:00:00Z",
        },
      },
    ],
  };
}

class StubReadinessRepository implements ReadinessRepository {
  readonly listCalls: string[] = [];
  readonly findCalls: string[] = [];

  constructor(private readonly workPackages: readonly WorkPackageEvidence[]) {}

  list(): Promise<readonly WorkPackageEvidence[]> {
    this.listCalls.push("list");
    return Promise.resolve(this.workPackages);
  }

  findById(id: string): Promise<WorkPackageEvidence | null> {
    this.findCalls.push(id);
    return Promise.resolve(
      this.workPackages.find((candidate) => candidate.id === id) ?? null,
    );
  }
}

describe("ReadinessService", () => {
  it("lists every Work Package with its calculated readiness", async () => {
    const firstWorkPackage = workPackage("one");
    const secondWorkPackage = workPackage("two");
    const repository = new StubReadinessRepository([
      firstWorkPackage,
      secondWorkPackage,
    ]);
    const result = await new ReadinessService(repository).list();

    expect(repository.listCalls).toEqual(["list"]);
    expect(
      result.map(({ workPackage, assessment }) => [
        workPackage.id,
        assessment.status,
      ]),
    ).toEqual([
      ["one", "READY"],
      ["two", "READY"],
    ]);
  });
  it("finds one Work Package with its calculated readiness", async () => {
    const selectedWorkPackage = workPackage("selected");
    const repository = new StubReadinessRepository([selectedWorkPackage]);
    const result = await new ReadinessService(repository).findById("selected");

    expect(repository.findCalls).toEqual(["selected"]);
    expect(result).toEqual({
      workPackage: selectedWorkPackage,
      assessment: expect.objectContaining({ status: "READY" }),
    });
  });

  it("returns null when the Work Package is absent", async () => {
    const repository = new StubReadinessRepository([]);
    const result = await new ReadinessService(repository).findById("missing");

    expect(result).toBeNull();
    expect(repository.findCalls).toEqual(["missing"]);
  });
});
