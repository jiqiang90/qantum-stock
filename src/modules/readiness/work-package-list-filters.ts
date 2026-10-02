import type {
  WorkPackageListFilters,
  WorkPackageReadiness,
} from "./readiness-model";

export function filterWorkPackages(
  items: readonly WorkPackageReadiness[],
  filters: WorkPackageListFilters,
): readonly WorkPackageReadiness[] {
  const query = filters.query.trim().toLocaleLowerCase();

  return items.filter((item) => {
    const matchesStatus =
      filters.status === "all" || item.assessment.status === filters.status;

    if (!matchesStatus) {
      return false;
    }

    if (query.length === 0) {
      return true;
    }

    const { workPackage } = item;
    const { solution } = workPackage;
    const searchableEvidence = [
      workPackage.name,
      solution.supplier,
      solution.internalCode,
      solution.supplierRefCode,
      solution.serviceClassification,
      solution.serviceType,
      solution.serviceSize,
      solution.serviceTypeOption,
      solution.substrateOption,
    ];

    return searchableEvidence.some((value) =>
      value.toLocaleLowerCase().includes(query),
    );
  });
}
