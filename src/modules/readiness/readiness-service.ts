import { assessReadiness } from "./assess-readiness";
import type {
  WorkPackageEvidence,
  WorkPackageReadiness,
} from "./readiness-model";
import type { ReadinessRepository } from "./readiness-repository";

export class ReadinessService {
  constructor(private readonly repository: ReadinessRepository) {}

  async list(): Promise<readonly WorkPackageReadiness[]> {
    const workPackages = await this.repository.list();

    return workPackages.map(toReadiness);
  }

  async findById(id: string): Promise<WorkPackageReadiness | null> {
    const workPackage = await this.repository.findById(id);

    return workPackage === null ? null : toReadiness(workPackage);
  }
}

function toReadiness(workPackage: WorkPackageEvidence): WorkPackageReadiness {
  return {
    workPackage,
    assessment: assessReadiness(workPackage.requirements),
  };
}
