import { describe, expect, it } from "vitest";

import type { WorkPackageEvidence } from "./readiness-model";
import type {
  PersistSolutionSelectionResult,
  SelectSolutionCommand,
} from "./readiness-model";
import type { ReadinessRepository } from "./readiness-repository";
import { ReadinessService } from "./readiness-service";

function workPackage(id: string): WorkPackageEvidence {
  return {
    id,
    name: `Work Package ${id}`,
    plannedDate: "2026-10-08",
    selectedSolutionOptionId: `option-${id}-selected`,
    solutionOptions: [
      {
        id: `option-${id}-selected`,
        solution: solution(id, "0444"),
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
      },
      {
        id: `option-${id}-alternative`,
        solution: solution(`${id}-alternative`, "0999"),
        requirements: [
          {
            id: `alternative-requirement-${id}`,
            description: `Alternative requirement ${id}`,
            product: {
              id: `alternative-product-${id}`,
              productCode: `ALT-${id}`,
              name: `Alternative Product ${id}`,
              canonicalUnit: "each",
            },
            requiredQuantity: 2,
            inventorySnapshot: {
              availableQuantity: 1,
              capturedAt: "2026-10-02T00:00:00Z",
            },
          },
        ],
      },
    ],
  };
}

function solution(id: string, internalCode: string) {
  return {
    id: `solution-${id}`,
    internalCode,
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
  };
}

class StubReadinessRepository implements ReadinessRepository {
  readonly listCalls: string[] = [];
  readonly findCalls: string[] = [];
  readonly selectCalls: SelectSolutionCommand[] = [];
  selectionResult: PersistSolutionSelectionResult = {
    status: "selected",
    selectedOptionId: "option-work-package-1-selected",
  };

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

  selectSolution(
    command: SelectSolutionCommand,
  ): Promise<PersistSolutionSelectionResult> {
    this.selectCalls.push(command);
    return Promise.resolve(this.selectionResult);
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
      selectedOption: selectedWorkPackage.solutionOptions[0],
      assessment: expect.objectContaining({ status: "READY" }),
      solutionOptions: [
        expect.objectContaining({
          selected: true,
          assessment: {
            status: "READY",
            reason: null,
            requirements: expect.any(Array),
          },
        }),
        expect.objectContaining({
          selected: false,
          assessment: {
            status: "SHORTAGE",
            reason: null,
            requirements: expect.any(Array),
          },
        }),
      ],
    });
  });

  it("rejects inconsistent evidence when the selected option is absent", async () => {
    const invalid = {
      ...workPackage("invalid"),
      selectedSolutionOptionId: "missing-option",
    };
    const service = new ReadinessService(
      new StubReadinessRepository([invalid]),
    );

    await expect(service.findById("invalid")).rejects.toThrow(
      "Selected Solution Option is missing",
    );
  });

  it("returns null when the Work Package is absent", async () => {
    const repository = new StubReadinessRepository([]);
    const result = await new ReadinessService(repository).findById("missing");

    expect(result).toBeNull();
    expect(repository.findCalls).toEqual(["missing"]);
  });

  it("returns the bounded persistence result after selection", async () => {
    const selectedWorkPackage = workPackage("work-package-1");
    const repository = new StubReadinessRepository([selectedWorkPackage]);
    const service = new ReadinessService(repository);
    const command = {
      workPackageId: "work-package-1",
      solutionOptionId: "option-2",
      expectedCurrentOptionId: "option-1",
    };

    await expect(service.selectSolution(command)).resolves.toEqual({
      status: "selected",
      selectedOptionId: "option-work-package-1-selected",
    });
    expect(repository.selectCalls).toEqual([command]);
    expect(repository.findCalls).toEqual([]);
  });
});
