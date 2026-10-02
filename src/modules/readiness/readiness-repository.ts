import type { WorkPackageEvidence } from "./readiness-model";

export interface ReadinessRepository {
  list(): Promise<readonly WorkPackageEvidence[]>;
  findById(id: string): Promise<WorkPackageEvidence | null>;
}
