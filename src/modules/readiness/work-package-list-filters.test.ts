import { describe, expect, it } from "vitest";

import type { ReadinessStatus, WorkPackageReadiness } from "./readiness-model";
import { filterWorkPackages } from "./work-package-list-filters";

const items = [
  workPackage("ready-riser", "Level 2 service riser", "READY", {
    internalCode: "0444",
    supplierRefCode: "V21.2-RISER",
    serviceType: "PVC Pipe",
  }),
  workPackage("shortage-floor", "Timber floor penetrations", "SHORTAGE", {
    internalCode: "0485",
    supplierRefCode: "V21.2-FLOOR",
    serviceType: "Copper Pipe",
  }),
  workPackage("unknown-ceiling", "Ceiling conduit", "UNKNOWN", {
    internalCode: "0510",
    supplierRefCode: "V21.2-CEILING",
    serviceType: "PVC Conduit",
  }),
];

describe("filterWorkPackages", () => {
  it.each([
    ["RISER", ["ready-riser"]],
    ["0485", ["shortage-floor"]],
    ["v21.2-ceiling", ["unknown-ceiling"]],
    ["pvc conduit", ["unknown-ceiling"]],
  ])(
    "matches visible Work Package and Solution evidence for %s",
    (query, ids) => {
      expect(
        filterWorkPackages(items, { query, status: "all" }).map(
          ({ workPackage }) => workPackage.id,
        ),
      ).toEqual(ids);
    },
  );

  it("combines search and readiness filters without changing result order", () => {
    expect(
      filterWorkPackages(items, { query: "pipe", status: "SHORTAGE" }).map(
        ({ workPackage }) => workPackage.id,
      ),
    ).toEqual(["shortage-floor"]);
  });
});

function workPackage(
  id: string,
  name: string,
  status: ReadinessStatus,
  solution: {
    readonly internalCode: string;
    readonly supplierRefCode: string;
    readonly serviceType: string;
  },
): WorkPackageReadiness {
  const option = {
    id: `option-${id}`,
    solution: {
      id: `solution-${id}`,
      supplier: "Ryanfire",
      orientation: "Wall",
      substrate: "FR plasterboard wall",
      serviceClassification: "Pipe",
      serviceSize: "Ø40mm",
      integrity: "60",
      insulation: "60",
      serviceTypeOption: solution.serviceType,
      substrateOption: "Plasterboard Wall",
      ...solution,
    },
    requirements: [],
  };
  const assessment = {
    status,
    reason: status === "UNKNOWN" ? ("NO_REQUIREMENTS" as const) : null,
    requirements: [],
  };

  return {
    workPackage: {
      id,
      name,
      plannedDate: "2026-10-08",
      selectedSolutionOptionId: option.id,
      solutionOptions: [option],
    },
    selectedOption: option,
    assessment,
    solutionOptions: [{ option, assessment, selected: true }],
  };
}
