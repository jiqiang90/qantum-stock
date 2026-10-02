import type {
  PersistSolutionSelectionResult,
  SelectSolutionCommand,
  WorkPackageEvidence,
} from "./readiness-model";

export interface ReadinessRepository {
  list(): Promise<readonly WorkPackageEvidence[]>;
  findById(id: string): Promise<WorkPackageEvidence | null>;
  selectSolution(
    command: SelectSolutionCommand,
  ): Promise<PersistSolutionSelectionResult>;
}
