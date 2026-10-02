import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatPlannedDate, ReadinessStatusBadge } from "./readiness-display";
import type { WorkPackageReadiness } from "./readiness-model";
import { WorkPackageRequirementsSection } from "./work-package-requirements-section";
import { WorkPackageSolutionSection } from "./work-package-solution-section";

export function WorkPackageDetail({
  item: { workPackage, assessment },
}: {
  readonly item: WorkPackageReadiness;
}) {
  return (
    <article>
      <header>
        <Breadcrumbs
          parent={{ href: "/", label: "Work Packages" }}
          current={workPackage.name}
        />

        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-600 uppercase">
              Planned {formatPlannedDate(workPackage.plannedDate)}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {workPackage.name}
            </h1>
          </div>
          <ReadinessStatusBadge status={assessment.status} />
        </div>
      </header>

      <div className="mt-9 space-y-5">
        <WorkPackageSolutionSection solution={workPackage.solution} />

        <WorkPackageRequirementsSection assessment={assessment} />
      </div>
    </article>
  );
}
