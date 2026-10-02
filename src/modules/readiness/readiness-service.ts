import { assessReadiness } from "./assess-readiness";
import type {
  PersistSolutionSelectionResult,
  WorkPackageEvidence,
  WorkPackageReadiness,
  SelectSolutionCommand,
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

  async selectSolution(
    command: SelectSolutionCommand,
  ): Promise<PersistSolutionSelectionResult> {
    return this.repository.selectSolution(command);
  }
}

function toReadiness(workPackage: WorkPackageEvidence): WorkPackageReadiness {
  const solutionOptions = workPackage.solutionOptions.map((option) => ({
    option,
    assessment: assessReadiness(option.requirements),
    selected: option.id === workPackage.selectedSolutionOptionId,
  }));
  const selectedOption = solutionOptions.find(({ selected }) => selected);

  if (selectedOption === undefined) {
    throw new Error(
      "Selected Solution Option is missing from Work Package evidence.",
    );
  }

  return {
    workPackage,
    selectedOption: selectedOption.option,
    assessment: selectedOption.assessment,
    solutionOptions,
  };
}
