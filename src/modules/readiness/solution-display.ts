import type { SolutionReference } from "./readiness-model";

export function formatFireResistance(solution: SolutionReference): string {
  return `${solution.integrity}/${solution.insulation}`;
}

export function formatSolutionLabel(solution: SolutionReference): string {
  return [
    `${solution.supplier} ${solution.internalCode}`,
    `${solution.serviceTypeOption} ${solution.serviceSize}`,
    solution.substrateOption,
    formatFireResistance(solution),
  ].join(" · ");
}
