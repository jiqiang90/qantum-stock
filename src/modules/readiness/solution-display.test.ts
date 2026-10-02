import { describe, expect, it } from "vitest";

import type { SolutionReference } from "./readiness-model";
import { formatFireResistance, formatSolutionLabel } from "./solution-display";

const solution: SolutionReference = {
  id: "solution-0444",
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
};

describe("Solution presentation", () => {
  it("derives a compact label from source-backed catalogue fields", () => {
    expect(formatSolutionLabel(solution)).toBe(
      "Ryanfire 0444 · PVC Pipe Ø40mm · Plasterboard Wall · 60/60",
    );
  });

  it("preserves literal fire-resistance text without parsing source values", () => {
    const sourceWithDash = { ...solution, insulation: "-" };
    const before = { ...sourceWithDash };

    expect(formatFireResistance(sourceWithDash)).toBe("60/-");
    expect(sourceWithDash).toEqual(before);
  });
});
